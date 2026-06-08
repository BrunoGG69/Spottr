#include <Arduino.h>
#include <WiFi.h>
#include <NimBLEDevice.h>
#include <PubSubClient.h>
#include "secrets.h"

#define SCANNER_ID "scanner_bedroom"
#define MQTT_BROKER "192.168.1.57"
#define MQTT_PORT 1883

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient); //name the MQTT client "mqtt" or anything can be used here
NimBLEScan* pBLEScan;

// Function to connect to MQTT broker with retry logic
void connectMQTT() {
    while (!mqtt.connected()) {
        Serial.print("Connecting To MQTT...");
        if (mqtt.connect(SCANNER_ID)) {
            Serial.println("Connected!");
            mqtt.publish("spottr/scanners/status", ("{\"scanner\":\"" SCANNER_ID "\",\"status\":\"online\"}"));
        }
        else 
        {
            Serial.printf("failed rc=%d retrying in 3s\n", mqtt.state());
            delay(3000);
        }
    }
}

// Callback class for handling BLE scan results
class ScanCallback : public NimBLEScanCallbacks {
    void onResult(const NimBLEAdvertisedDevice* device) override {
        String name = String(device->getName().c_str());
        if (name.startsWith("SPOTTR_")) {
            String payload = "{\"scanner\":\"" + String(SCANNER_ID) + "\","
                            + "\"badge_id\":\"" + name + "\","
                            + "\"rssi\":" + String(device->getRSSI()) + "}";

            if (mqtt.connected()) {
                mqtt.publish("spottr/presence", payload.c_str());            
            }

            Serial.printf("Spotted: %s | RSSI: %d\n", name.c_str(), device->getRSSI());

        }
    }
};

// FreeRTOS task to continuously start BLE scanning without blocking the main loop
void scanTask(void *pvParameters) {
        while (true) {
        pBLEScan -> start(1, false);
        pBLEScan -> clearResults();
        delay(50);
    }
}

// Main setup function to initialize WiFi, MQTT, and BLE scanning
void setup() {
    Serial.begin(115200);

    // Initialize WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.println("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

    delay(1000); // Short delay to ensure WiFi is fully connected before proceeding

    // Initialize MQTT
    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
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
void loop() {
    if (!mqtt.connected()) {
        connectMQTT();
    }
    mqtt.loop();
}