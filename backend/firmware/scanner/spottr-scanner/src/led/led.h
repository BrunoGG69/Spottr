#pragma once
#include <Arduino.h>

enum LedState
{
    LED_CONNECTING,
    LED_ONLINE,
    LED_PORTAL,
    LED_OTA,
    LED_ERROR
};

void ledInit();
void ledSet(LedState state);
void ledUpdate();