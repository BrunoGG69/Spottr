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

#define FW_MAJOR 1
#define FW_MINOR 0
#define FW_PATCH 0
#define FIRMWARE_VERSION "1.0.0"

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
extern uint8_t setupStep;
extern bool setupDone;
extern bool configPortalActive;

extern const byte DNS_PORT;
extern IPAddress apIP;
