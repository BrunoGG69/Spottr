import json
import time
from dotenv import load_dotenv
from firebase_admin import db
import state
import os

load_dotenv()
MQTT_TOPIC_OTA = os.getenv("MQTT_TOPIC_OTA")

def publish_firmware(client, info):
    payload = json.dumps({
        "version": info.get("version"),
        "url": info.get("url"),
    }, separators=(',', ':'))
    client.publish(MQTT_TOPIC_OTA, payload, retain=True)
    print(f"Published firmware {info.get('version')} to scanners")

def watch_firmware(client):
    while True:
        try:
            info = db.reference("firmware/scanner").get()
            if isinstance(info, dict) and info.get("version") and info.get("url"):
                state.last_firmware_version = info.get("version")
                publish_firmware(client, info)
        except Exception as e:
            print(f"Firmware watcher error: {e}")
        time.sleep(30)
