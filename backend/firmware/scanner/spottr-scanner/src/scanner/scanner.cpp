#include "scanner/scanner.h"
#include "ota/ota.h"
#include "led/led.h"
#include "globals.h"

String pingTopic()
{
    return String("spottr/scanners/ping/") + scannerId;
}

String pongTopic()
{
    return String("spottr/scanners/pong/") + scannerId;
}

bool tryConnectSavedWiFi(unsigned long timeoutMs)
{
    if (wifiSsid.length() == 0)
    {
        Serial.println("No saved WiFi credentials found.");
        return false;
    }

    Serial.println("Connecting to saved WiFi: " + wifiSsid);
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());

    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs)
    {
        ledUpdate();
        delay(50);
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        WiFi.setSleep(false);
        Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
        return true;
    }

    Serial.println("\nNot connected yet.");
    return false;
}

static void sendPong()
{
    String payload = "{\"scanner\":\"" + scannerId + "\","
                     "\"mac\":\"" + scannerMac + "\","
                     "\"status\":\"alive\","
                     "\"uptime\":" + String(millis() / 1000) + "}";
    mqtt.publish(pongTopic().c_str(), payload.c_str());
    Serial.println("Received ping, sent pong");
}

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    String topicStr = String(topic);
    if (topicStr == pingTopic())
    {
        sendPong();
        return;
    }

    if (topicStr == otaTopic())
    {
        String msg;
        for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
        handleOtaMessage(msg);
    }
}

void connectMQTT()
{
    while (!mqtt.connected())
    {
        Serial.print("Connecting To MQTT...");

        bool ok;
        if (mqttUser.length() > 0)
            ok = mqtt.connect(scannerId.c_str(), mqttUser.c_str(), mqttPass.c_str());
        else
            ok = mqtt.connect(scannerId.c_str());

        if (ok)
        {
            Serial.println("Connected!");

            String statusPayload = "{\"scanner\":\"" + scannerId + "\","
                                   "\"mac\":\"" + scannerMac + "\","
                                   "\"status\":\"online\","
                                   "\"version\":\"" FIRMWARE_VERSION "\"}";
            mqtt.publish("spottr/scanners/status", statusPayload.c_str());

            mqtt.subscribe(pingTopic().c_str());
            mqtt.subscribe(otaTopic().c_str());
            Serial.println("Subscribed to ping topic: " + pingTopic());
            Serial.println("Subscribed to OTA topic: " + otaTopic());
        }
        else
        {
            Serial.printf("failed rc=%d retrying in 3s\n", mqtt.state());
            for (int i = 0; i < 60; i++)
            {
                ledUpdate();
                delay(50);
            }
        }
    }
}

class ScanCallback : public NimBLEScanCallbacks
{
    void onResult(const NimBLEAdvertisedDevice *device) override
    {
        String name = String(device->getName().c_str());
        if (name == "SPOTTR")
        {
            String mac = String(device->getAddress().toString().c_str());
            String payload = "{\"scanner\":\"" + scannerId + "\","
                             "\"badge_id\":\"" + mac + "\","
                             "\"rssi\":" + String(device->getRSSI()) + "}";
            if (mqtt.connected())
            {
                mqtt.publish("spottr/presence", payload.c_str());
            }
            Serial.printf("Spotted: %s | RSSI: %d\n", mac.c_str(), device->getRSSI());
        }
    }
};

static void scanTask(void *pvParameters)
{
    while (true)
    {
        pBLEScan->start(1, false);
        pBLEScan->clearResults();
        delay(50);
    }
}

void startBLEScanning()
{
    mqtt.setServer(mqttBroker.c_str(), mqttPort);
    mqtt.setCallback(mqttCallback);
    connectMQTT();

    NimBLEDevice::init("");
    pBLEScan = NimBLEDevice::getScan();
    pBLEScan->setScanCallbacks(new ScanCallback(), false);
    pBLEScan->setActiveScan(false);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);

    xTaskCreate(scanTask, "scanTask", 4096, NULL, 1, NULL);
    Serial.println("BLE Starting + MQTT Publishing...");
}