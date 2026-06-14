![Spottr Logo](docs/SPOTTR_LOGO.png)
# SPOTTR: Real-time BLE Presence Tracking using ESP32
SPOTTR is an open-source indoor presence tracking system built on ESP32-C3 and Bluetooth Low Energy. Wear a Badge, walk into a room, show up on a map

---
## Features
 -  **BLE Beacon Badges**: ESP32-C3 Powered badges that broadcast unique identifiers.
 - **Room Level Detection** : Fixed scanner nodes placed in rooms to detect nearby badges.
 - **Real-time Mapping**: Visualize presence on a web-based map interface.
 - **Open Source**: Fully open-source hardware and software for customization.

## Hardware Components
- **ESP32-C3**: Low-power microcontroller with integrated BLE.
- **Battery**: For portable badge operation.
- **Enclosure**: 3D printed or custom case for the badge.
- **Scanner Nodes**: ESP32-C6 based devices placed in rooms to detect badges.

## Software Components
- **Firmware**: Custom firmware for badges and scanner nodes to handle BLE communication and data processing.
- **Backend Server**: Python Server running locally on a Raspberry Pi to collect data from scanner nodes and send off to database
- **Web Interface**: React-based web application to visualize presence data on a map.
- **Database**: Firebase Realtime Database or Supabase for storing presence data.

---
## Renders
![Badge Render](docs/SPOTTR_RENDER_COLLECTION.png)

---
## Getting Started
**Coming Soon**

---
 ## Roadmap

### Phase 1 — Website & Dashboard UI
- [x] Project scaffold and structure
- [x] Landing page with 3D badge model
- [x] Intro animation and hero section
- [x] Navbar
- [ ] Footer
- [ ] How it works section
- [ ] Hardware section
- [ ] Software section

### Phase 2 — Badge Firmware
- [x] ESP32-C3 BLE beacon setup
- [ ] Soldering ESP32-C3 modules with Battery
- [ ] Deep sleep between broadcasts (30s interval)
- [ ] 9 month battery life optimization

### Phase 3 — Scanner Firmware
- [x] ESP32-C6 BLE scan
- [x] RSSI reading per badge
- [x] WiFi MQTT publish to Pi broker
- [x] Scanner Status heartbeat
- [ ] Offline buffering if WiFi drops

### Phase 4 — Pi Bridge
- [x] Mosquitto MQTT broker setup on Pi
- [x] Python bridge — MQTT subscriber
- [x] Receive RSSI data from scanner nodes
- [x] Check scanner online/offline status
- [x] Heartbeat monitor per scanner
- [x] Pass location data to Database
- [x] Basic nearest room logic (strongest RSSI wins)
- [ ] Offline retry if Database unreachable

### Phase 5 — Admin Dashboard
- [ ] Live SVG floor map with badge dots
- [ ] Room occupancy counts
- [ ] Badge management (add, edit, remove)
- [ ] Scanner node status (online/offline)
- [ ] Attendance log table with timestamps
- [ ] Export attendance as CSV

### Phase 6 — Access Control
- [ ] Zone definitions (restricted, public, admin)
- [ ] Badge permission levels
- [ ] Alert on unauthorized zone entry
- [ ] Door event logging via NFC tap
- [ ] Access history per badge
- [ ] Admin override and manual unlock

### Phase 7 — Mobile App
- [ ] React Native scaffold
- [ ] Personal tracker view 
- [ ] Movement history for the day
- [ ] Push notifications for zone alerts

---

## License
MIT License © 2026 Prathamesh Prabhakar

---
**Note: Spottr is currently under active development. Hardware arriving June 7, 2026. Stay tuned.**