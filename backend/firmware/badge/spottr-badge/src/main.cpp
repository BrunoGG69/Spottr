#include <Arduino.h>
#include <NimBLEDevice.h>

#define BADGE_ID "SPOTTR"

NimBLEAdvertising *adv;

void setup() {
  Serial.begin(115200);

  NimBLEDevice::init(BADGE_ID);

  String mac = NimBLEDevice::getAddress().toString().c_str();
  Serial.print("Device MAC Address: " + mac + "\n");

  NimBLEAdvertisementData advData;
  advData.setName(BADGE_ID);
  advData.setManufacturerData(std::string(BADGE_ID));

  adv = NimBLEDevice::getAdvertising();
  adv->setAdvertisementData(advData);
  adv->start();

  Serial.println("Badge advertising...");
}

void loop() {
  Serial.println("Badge is running...");
  delay(1000);
}