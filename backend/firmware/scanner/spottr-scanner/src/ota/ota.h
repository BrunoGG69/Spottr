#pragma once
#include <Arduino.h>

String otaTopic();
bool isNewerVersion(const String &incoming);
bool isOtaActive();
void handleOtaMessage(const String &msg);
void serviceOTA();
