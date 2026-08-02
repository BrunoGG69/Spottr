#pragma once
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <NimBLEDevice.h>

#define DEFAULT_SCANNER_ID "scanner_node"
#define DEFAULT_MQTT_BROKER "192.168.0.12"
#define DEFAULT_MQTT_PORT 1883
#define DEFAULT_MQTT_USER ""
#define DEFAULT_MQTT_PASS ""

#define FW_MAJOR 0
#define FW_MINOR 8
#define FW_PATCH 1
#define FIRMWARE_VERSION "0.8.1"

extern PubSubClient mqtt;
extern Preferences preferences;
extern WebServer portalServer;
extern DNSServer dnsServer;
extern NimBLEScan *pBLEScan;

extern String scannerMac;
extern String scannerId;
extern String roomName;
extern String wifiSsid;
extern String wifiPass;
extern String mqttBroker;
extern uint16_t mqttPort;
extern String mqttUser;
extern String mqttPass;
extern uint8_t setupStep;
extern bool setupDone;
extern bool configPortalActive;

extern const byte DNS_PORT;
extern IPAddress apIP;
