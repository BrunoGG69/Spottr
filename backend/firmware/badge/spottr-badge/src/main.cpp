#include <Arduino.h>
#include <NimBLEDevice.h>

#define BADGE_ID "SPOTTR"

#define LED_PIN 10
#define LED_ACTIVE_LOW false
#define BLINK_INTERVAL 500

NimBLEAdvertising *adv;
static bool advertising = false;

static void ledWrite(bool on)
{
    digitalWrite(LED_PIN, (on != LED_ACTIVE_LOW) ? HIGH : LOW);
}

void setup()
{
    Serial.begin(115200);
    delay(200);

    pinMode(LED_PIN, OUTPUT);
    ledWrite(false);

    Serial.println();
    Serial.println("Spottr Badge booting...");

    NimBLEDevice::init(BADGE_ID);

    String mac = NimBLEDevice::getAddress().toString().c_str();
    Serial.println("Badge MAC: " + mac);

    NimBLEAdvertisementData advData;
    advData.setName(BADGE_ID);

    adv = NimBLEDevice::getAdvertising();
    adv->setAdvertisementData(advData);
    adv->start();

    advertising = true;
    Serial.println("Advertising as " BADGE_ID);
}

void loop()
{
    static unsigned long lastBlink = 0;
    static bool ledOn = false;

    if (advertising && millis() - lastBlink >= BLINK_INTERVAL)
    {
        lastBlink = millis();
        ledOn = !ledOn;
        ledWrite(ledOn);
    }
}