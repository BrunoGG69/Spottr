#pragma once
#include <Arduino.h>

String pingTopic();
String pongTopic();

void connectMQTT();
void startBLEScanning();
bool tryConnectSavedWiFi(unsigned long timeoutMs);