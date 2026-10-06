## Getting Started

### Prerequisites
- **ESP32-C3** modules for badges
- **ESP32-C6** modules for scanners
- Any Linux server already setup with MQTT to use as the bridge between scanner and the database
- [PlatformIO](https://platformio.org/) on a PC

### 1. Flash the firmware
clone the repo and build the firmware using [PlatformIO](https://platformio.org/)
```bash
#badge
cd backend/firmware/badge/spottr-badge
pio run -t upload
```

```bash
#scanner
cd backend/firmware/scanner/spottr-scanner
pio run -t upload
```

### 2. Set up the Bridge
1. Install the Mosquitto MQTT broker on any server:
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
```
2. Set up the Python Bridge:
```bash
cd backend/pi-bridge
pip install -r requirements.txt
```
3. Create a `.env` file in `pi-bridge/` with the following variables:
```
FIREBASE_DB_URL='<RTDB URL>'
SERVICE_ACCOUNT='<PATH TO SERVICE ACCOUNT JSON FILE>'
```
4. Drop your Firebase Admin `serviceAccount.json` in the folder, then run:

```bash
python main.py
```

### 3. Run the Web Dashboard
```bash
cd frontend/website
npm install
npm run dev
```
Add your Firebase config to `.env` file. Check `.env.example` for your reference.
