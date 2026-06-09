#include <Arduino.h>
#include <NimBLEDevice.h>

#define BADGE_ID "SPOTTR_BADGE_002"

#ifndef LED_BUILTIN
#define LED_BUILTIN 10
#endif

NimBLEAdvertising *adv;

void setup() {
  Serial.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  NimBLEDevice::init(BADGE_ID);

  NimBLEAdvertisementData advData;
  advData.setName(BADGE_ID);
  advData.setManufacturerData(std::string(BADGE_ID));

  adv = NimBLEDevice::getAdvertising();
  adv->setAdvertisementData(advData);
  adv->start();

  Serial.println("Badge advertising continuously...");
  digitalWrite(LED_BUILTIN, LOW);
}

void loop() {
  Serial.println("Badge is running...");
  delay(1000);
}