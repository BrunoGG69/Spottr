<p align="center">
  <img src="docs/SPOTTR_LOGO.png" alt="Spottr Logo">
</p>

# SPOTTR: Real-time BLE Presence Tracking using ESP32

SPOTTR is an open-source indoor presence tracking system built on a cheap aah microcontroller (ESP32-C3 & ESP32-C6) and Bluetooth Low Energy. This project has multiple applications as it can be used in schools, offices, warehouses or even hospitals.

I started building this project because of one problem, no one can accurately track someone inside a closed building or space while also keeping a head count. I saw this problem at my school. Every time we went to the field, they had to do a manual roll call, and then another one once we were back in class. The school also had no way to find someone when they needed to. We only knew that someone was inside the building, not where exactly they were.
<p align="center">
  <img src="docs/SPOTTR_PRODUCT_IMAGE.png" alt="SPOTTR_PRODUCT_IMAGE.png">
</p>

---

## Features

- **Wearable BLE Badges**: ESP32-C3 Powered badges that broadcast BLE signals at a particular period of time.
- **Room Level Detection**: Fixed scanner nodes placed in every room to detect the badges and publish the recieved values via MQTT.
- **Spottr-Bridge**: This is a server that sits between the scanner-nodes and the cloud as data from the nodes first reaches this server via MQTT and then passed on to the cloud. Did this to reduce load on each scanner if they started publishing data individually.

---

## Hardware Components Used

- **ESP32-C3**: A Low-power microcontroller which also has BLE support. This is used inside the badges
- **LiPo Battery**: To power the badge.
- **ESP32-C6**: Used in the scanner-nodes to recieve data from ESP32-C3 badges.

---

## Renders

![SPOTTR_RENDER_COLLECTION.png](docs/SPOTTR_RENDER_COLLECTION.png)

---

## Wiring Diagram

![SPOTTR_CIRCUIT_BADGE.png](docs/SPOTTR_CIRCUIT_BADGE.png)

---

## Flow Chart

![SPOTTR_DIAGRAM.png](docs/SPOTTR_DIAGRAM.png)

---

## Setup Guide:

Checkout the [Setup File](docs/SETUP_PROJECT.md)

---

## License

AGPL-3.0 © 2026 Prathamesh Prabhakar

---

> **Note: Spottr is currently under active development. Stay tuned for more stuff to be added**
