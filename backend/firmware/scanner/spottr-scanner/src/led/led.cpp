#include "led/led.h"
#define LED_PIN 15

#define LED_ACTIVE_LOW true

static LedState currentState = LED_CONNECTING;
static unsigned long cycleStart = 0;

void ledInit(){
    ledcAttach(LED_PIN, 5000, 8);
    cycleStart = millis();
}

void ledSet(LedState state){
    if (state != currentState){
        currentState = state;
        cycleStart = millis();
    }
}

static void writeBrightness(uint8_t level){
    ledcWrite(LED_PIN, LED_ACTIVE_LOW ? (255 - level) : level);
}

static void writeLed(bool on){
    writeBrightness(on ? 255 : 0);
}

static uint8_t breatheLevel(unsigned long t, unsigned long period)
{
    unsigned long p = t % period;
    uint8_t level;
    if (p < period / 2)
        level = (p * 255) / (period / 2);
    else
        level = 255 - ((p - period / 2) * 255) / (period / 2);
    return (uint16_t)level * level / 255;
}

void ledUpdate()
{
    unsigned long t = millis() - cycleStart;

    switch (currentState)
    {
    case LED_CONNECTING:
        writeLed((t % 500) < 250);
        break;

    case LED_ONLINE:
        writeBrightness(255);
        break;

    case LED_PORTAL:
        writeBrightness(breatheLevel(t, 2500));
        break;

    case LED_OTA:
    {
        unsigned long p = t % 600;
        writeLed((p < 80) || (p >= 160 && p < 240));
        break;
    }

    case LED_ERROR:
    {
        unsigned long p = t % 2000;
        writeLed((p < 120) ||
                 (p >= 240 && p < 360) ||
                 (p >= 480 && p < 600));
        break;
    }
    }
}