#include <Arduino.h>
#include "globals.h"
#include "ota/ota.h"
#include "scanner/scanner.h"
#include "portal/portal.h"
#include "config/config.h"

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
uint16_t mqttPort = DEFAULT_MQTT_PORT;
uint8_t setupStep = 0;
bool setupDone = false;
bool configPortalActive = false;

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);

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

void setup()
{
    Serial.begin(115200);
    delay(200);

    Serial.println();
    Serial.println("Spottr Scanner — firmware " FIRMWARE_VERSION);

    loadConfig();

    if (!setupDone)
    {
        Serial.println("Setup not complete — opening config portal.");
        dumpStoredConfig("boot");
        startConfigPortal();
        return;
    }

    if (waitForConfigCommand(5000))
    {
        Serial.println("Config command received — forcing config portal.");
        preferences.begin("spottr-cfg", false);
        preferences.putBool("setup_done", false);
        preferences.putUInt("step", 0);
        preferences.end();
        setupStep = 0;
        setupDone = false;
        startConfigPortal();
        return;
    }

    if (!tryConnectSavedWiFi(10000))
    {
        startConfigPortal();
        return;
    }

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
        return;
    }

    if (!mqtt.connected())
    {
        connectMQTT();
    }
    mqtt.loop();

    serviceOTA();
}