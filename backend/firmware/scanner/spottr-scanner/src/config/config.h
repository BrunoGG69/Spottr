#pragma once
#include <Arduino.h>

String slugify(const String &input);
void dumpStoredConfig(const char *stage);
void loadConfig();
String buildApName();