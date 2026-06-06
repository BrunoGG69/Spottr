#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include "secrets.h"
#include <map>
#include <string>

#define SCANNER_ID "scanner_bedroom"

WebServer server(80);

struct BadgeReading {
    String badgeId;
    int rssi;
    unsigned long lastSeen;
};

std::map<std::string, BadgeReading> detectedBadges;
BLEScan* pBLEScan;

class ScanCallback : public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice device) override {
    String name = String(device.getName().c_str());
        if (name.startsWith("SPOTTR_")) {
            BadgeReading reading;
            reading.badgeId = name;
            reading.rssi = device.getRSSI();
            reading.lastSeen = millis();
            detectedBadges[std::string(name.c_str())] = reading;
            Serial.printf("Spotted: %s | RSSI: %d\n", name.c_str(), device.getRSSI());
        }
    }
};

void handleRoot() {
    String html = "<!DOCTYPE html><html><head>";
    html += "<title>Spottr Scanner</title>";
    html += "<meta http-equiv='refresh' content='3'>";
    html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
    html += "<style>";
    html += "*{margin:0;padding:0;box-sizing:border-box;}";
    html += "body{background:#080808;color:#f5f5f5;font-family:monospace;padding:24px;}";
    html += "h1{color:#06B6D4;font-size:20px;margin-bottom:4px;}";
    html += "p{color:#666;font-size:12px;margin-bottom:20px;}";
    html += ".badge{background:#111;border:1px solid #1e1e1e;padding:14px 16px;margin:8px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;}";
    html += ".name{color:#f5f5f5;font-size:14px;}";
    html += ".rssi{color:#F59E0B;font-size:13px;}";
    html += ".empty{color:#333;font-size:13px;margin-top:20px;}";
    html += "</style></head><body>";
    html += "<h1>Spottr Scanner</h1>";
    html += "<p>" + String(SCANNER_ID) + " &nbsp;·&nbsp; " + WiFi.localIP().toString() + "</p>";

    if (detectedBadges.empty()) {
        html += "<p class='empty'>No badges detected yet...</p>";
    } else {
        for (auto& pair : detectedBadges) {
            unsigned long seenAgo = (millis() - pair.second.lastSeen) / 1000;
            html += "<div class='badge'>";
            html += "<span class='name'>" + pair.second.badgeId + "</span>";
            html += "<span class='rssi'>" + String(pair.second.rssi) + " dBm &nbsp;·&nbsp; " + String(seenAgo) + "s ago</span>";
            html += "</div>";
        }
    }

    html += "</body></html>";
    server.send(200, "text/html", html);
}

void handleJson() {
    String json = "{\"scanner\":\"" + String(SCANNER_ID) + "\",\"badges\":[";
    bool first = true;
    for (auto& pair : detectedBadges) {
        if (!first) json += ",";
        json += "{\"id\":\"" + pair.second.badgeId + "\"";
        json += ",\"rssi\":" + String(pair.second.rssi);
        json += ",\"lastSeen\":" + String((millis() - pair.second.lastSeen) / 1000) + "}";
        first = false;
    }
    json += "]}";
    server.send(200, "application/json", json);
}

void scanTask(void* pvParameters) {
    while (true) {
        pBLEScan->start(3, false);
        pBLEScan->clearResults();
        delay(100);
    }
}

void setup() {
    Serial.begin(115200);

    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    server.on("/", handleRoot);
    server.on("/json", handleJson);
    server.begin();
    Serial.println("Web server started");

    BLEDevice::init("");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new ScanCallback());
    pBLEScan->setActiveScan(false);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);

    xTaskCreate(scanTask, "BLEScan", 4096, NULL, 1, NULL);
    Serial.println("BLE scanning...");
}

void loop() {
    server.handleClient();
}