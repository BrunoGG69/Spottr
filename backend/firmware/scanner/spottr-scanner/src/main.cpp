#include <Arduino.h>
#include "globals.h"
#include "ota/ota.h"
#include "scanner/scanner.h"
#include "portal/portal.h"
#include "config/config.h"
#include "led/led.h"

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
Preferences preferences;
WebServer portalServer(80);
DNSServer dnsServer;
NimBLEScan *pBLEScan = nullptr;

String scannerMac;
String scannerId;
String roomName;
String wifiSsid;
String wifiPass;
String mqttBroker;
String mqttUser;
String mqttPass;
uint16_t mqttPort = DEFAULT_MQTT_PORT;
uint8_t setupStep = 0;
bool setupDone = false;
bool configPortalActive = false;

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);

static unsigned long lastWifiCheck = 0;

static bool hasCredentials()
{
    return wifiSsid.length() > 0;
}

static bool waitForConfigCommand(unsigned long timeoutMs)
{
    Serial.println("Type 'config' and press Enter within " + String(timeoutMs / 1000) + "s to open the config portal...");
    String input = "";
    unsigned long start = millis();

    while (millis() - start < timeoutMs)
    {
        while (Serial.available())
        {
            char c = Serial.read();
            if (c == '\n' || c == '\r')
            {
                input.trim();
                if (input == "config") return true;
                input = "";
            }
            else
            {
                input += c;
            }
        }
        delay(10);
    }
    return false;
}

static void enterConfigPortal()
{
    preferences.begin("spottr-cfg", false);
    preferences.putBool("setup_done", false);
    preferences.putUInt("step", 0);
    preferences.end();
    setupStep = 0;
    setupDone = false;
    ledSet(LED_PORTAL);
    startConfigPortal();
}

static void waitForWiFi()
{
    unsigned long attemptStart = millis();

    while (!tryConnectSavedWiFi(15000))
    {
        unsigned long waited = (millis() - attemptStart) / 1000;
        Serial.println("WiFi unavailable (" + String(waited) + "s) — credentials present, retrying.");

        WiFi.disconnect();
        delay(500);

        for (int i = 0; i < 100; i++)
        {
            ledUpdate();
            delay(50);
        }
    }
}

static void serviceWiFi()
{
    if (millis() - lastWifiCheck < 5000) return;
    lastWifiCheck = millis();

    if (WiFi.status() == WL_CONNECTED) return;

    Serial.println("WiFi down..... Reconnecting.");
    ledSet(LED_CONNECTING);
    WiFi.reconnect();
}

void setup()
{
    Serial.begin(115200);
    delay(200);

    Serial.println();
    Serial.println("Spottr Scanner — firmware " FIRMWARE_VERSION);

    ledInit();
    ledSet(LED_CONNECTING);

    loadConfig();

    if (!hasCredentials())
    {
        Serial.println("No WiFi credentials in NVS — opening config portal.");
        dumpStoredConfig("boot");
        enterConfigPortal();
        return;
    }

    if (waitForConfigCommand(5000))
    {
        Serial.println("Config command received — forcing config portal.");
        enterConfigPortal();
        return;
    }

    waitForWiFi();

    scannerMac = WiFi.macAddress();
    Serial.println("Scanner MAC: " + scannerMac);
    Serial.println("Scanner ID: " + scannerId);
    Serial.println("Room: " + roomName);
    Serial.println("MQTT Broker: " + mqttBroker + ":" + String(mqttPort));

    delay(1000);

    startBLEScanning();
}

void loop()
{
    if (configPortalActive)
    {
        handlePortalLoop();
        ledUpdate();
        return;
    }

    serviceWiFi();

    if (WiFi.status() != WL_CONNECTED)
    {
        ledUpdate();
        return;
    }

    if (!mqtt.connected())
    {
        ledSet(LED_CONNECTING);
        connectMQTT();
    }
    else if (!isOtaActive())
    {
        ledSet(LED_ONLINE);
    }
    mqtt.loop();

    serviceOTA();
    ledUpdate();
}