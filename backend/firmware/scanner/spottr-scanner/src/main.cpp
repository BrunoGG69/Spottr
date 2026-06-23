#include <Arduino.h>
#include <WiFi.h>
#include <NimBLEDevice.h>
#include <PubSubClient.h>
#include "secrets.h"

#define SCANNER_ID "scanner_living_room"
#define MQTT_BROKER "192.168.1.57"
#define MQTT_PORT 1883

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient); // name the MQTT client "mqtt" or anything can be used here
NimBLEScan *pBLEScan;

unsigned long lastHeartbeat = 0;
String scannerMac;

// Builds the ping topic this scanner listens on
String pingTopic()
{
    return String("spottr/scanners/ping/") + SCANNER_ID;
}

// Builds the pong topic this scanner responds on
String pongTopic()
{
    return String("spottr/scanners/pong/") + SCANNER_ID;
}

// Function to connect to MQTT broker with retry logic
void connectMQTT()
{
    while (!mqtt.connected())
    {
        Serial.print("Connecting To MQTT...");
        if (mqtt.connect(SCANNER_ID))
        {
            Serial.println("Connected!");

            String statusPayload = "{\"scanner\":\"" SCANNER_ID "\","
                                   "\"mac\":\"" +
                                   scannerMac + "\","
                                                "\"status\":\"online\"}";
            mqtt.publish("spottr/scanners/status", statusPayload.c_str());
            mqtt.subscribe(pingTopic().c_str());
            Serial.println("Subscribed to ping topic: " + pingTopic());
        }
        else
        {
            Serial.printf("failed rc=%d retrying in 3s\n", mqtt.state());
            delay(3000);
        }
    }
}

void sendHeartbeat()
{
    if (millis() - lastHeartbeat >= 30000)
    {
        String payload = "{\"scanner\":\"" SCANNER_ID "\","
                         "\"mac\":\"" +
                         scannerMac + "\","
                                      "\"status\":\"online\","
                                      "\"uptime\":" +
                         String(millis() / 1000) + "}";
        mqtt.publish("spottr/scanners/heartbeat", payload.c_str());
        lastHeartbeat = millis();
    }
}

void sendPong()
{
    String payload = "{\"scanner\":\"" SCANNER_ID "\","
                    "\"mac\":\"" +
                    scannerMac + "\","
                                 "\"status\":\"alive\","
                                 "\"uptime\":" +
                    String(millis() / 1000) + "}";
    mqtt.publish(pongTopic().c_str(), payload.c_str());
    Serial.println("Received ping, sent pong");
}

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    String topicStr = String(topic);
    if (topicStr == pingTopic())
    {
        sendPong();
    }
}

// Callback class for handling BLE scan results
class ScanCallback : public NimBLEScanCallbacks
{
    void onResult(const NimBLEAdvertisedDevice *device) override
    {
        String name = String(device->getName().c_str());
        if (name == "SPOTTR")
        {
            String mac = String(device->getAddress().toString().c_str()); // ← here
            String payload = "{\"scanner\":\"" + String(SCANNER_ID) + "\"," + "\"badge_id\":\"" + mac + "\"," + "\"rssi\":" + String(device->getRSSI()) + "}";
            if (mqtt.connected())
            {
                mqtt.publish("spottr/presence", payload.c_str());
            }
            Serial.printf("Spotted: %s | RSSI: %d\n", mac.c_str(), device->getRSSI());
        }
    }
};

// FreeRTOS task to continuously start BLE scanning without blocking the main loop
void scanTask(void *pvParameters)
{
    while (true)
    {
        pBLEScan->start(1, false);
        pBLEScan->clearResults();
        delay(50);
    }
}

// Main setup function to initialize WiFi, MQTT, and BLE scanning
void setup()
{
    Serial.begin(115200);

    // Initialize WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.println("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

    scannerMac = WiFi.macAddress();
    Serial.println("Scanner MAC: " + scannerMac);

    delay(1000); // Short delay to ensure WiFi is fully connected before proceeding

    // Initialize MQTT
    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
    mqtt.setCallback(mqttCallback);
    connectMQTT();

    NimBLEDevice::init("");
    pBLEScan = NimBLEDevice::getScan();
    pBLEScan->setScanCallbacks(new ScanCallback(), false);
    pBLEScan->setActiveScan(false);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);

    // FreeRTOS task for starting a new task (in this case BLE Scanning) without blocking the main loop
    xTaskCreate(scanTask, "scanTask", 4096, NULL, 1, NULL);
    Serial.println("BLE Starting + MQTT Publishing...");
}

// Main loop to maintain MQTT connection and handle incoming messages
void loop()
{
    if (!mqtt.connected())
    {
        connectMQTT();
    }
    mqtt.loop();

    sendHeartbeat();
}