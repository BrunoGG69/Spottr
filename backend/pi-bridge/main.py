import paho.mqtt.client as paho_mqtt
import json
import time
import os
import threading
import firebase_admin
from firebase_admin import credentials, db, firestore
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_PRESENCE = "spottr/presence"
MQTT_TOPIC_HEARTBEAT = "spottr/scanners/heartbeat"
SCANNER_TIMEOUT = 60 # Set Timeout for Scanner
BADGE_TIMEOUT = 60 # Set Timeout for Badge

FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL")
SERVICE_ACCOUNT = os.getenv("SERVICE_ACCOUNT")

cred = credentials.Certificate(SERVICE_ACCOUNT)
firebase_admin.initialize_app(cred, {
    "databaseURL": FIREBASE_DB_URL
})

fs_client = firestore.client() # Just making my life easier

badge_locations = {}
scanner_status = {}
badge_last_seen = {}

def get_strongest_scanner(badge_id):
	if badge_id not in badge_locations:
		return None
	readings = badge_locations[badge_id]
	strongest = max(readings, key=readings.get)
	return strongest

def update_firebase(badge_id, scanner, rssi):
	strongest = get_strongest_scanner(badge_id)
	db.reference(f"badge_location/{badge_id}").set({
		"room" : strongest,
		"rssi" : rssi,
		"last_seen": int(time.time()),
		"status" : "ONLINE"
	})
	fs_client.collection("presence_log").add({
		"badge_id" : badge_id,
		"scanner" : scanner,
		"rssi" : rssi,
		"timestamp" : int(time.time())
	})

def check_scanner_status():
	while True:
		now = time.time()
		for scanner, last_seen in list(scanner_status.items()):
			if now - last_seen > SCANNER_TIMEOUT:
				print(f"{scanner} is OFFLINE")
				db.reference(f"scanner_status/{scanner}").set({
					"status" : "OFFLINE",
					"last_seen" : int(last_seen)
				})
		time.sleep(30)

def check_badge_status():
	while True:
		now = time.time()
		for badge_id, last_seen in list(badge_last_seen.items()):
			if now - last_seen > BADGE_TIMEOUT:
				print(f"{badge_id} is OFFLINE")
				db.reference(f"badge_location/{badge_id}").update({
					"status": "OFFLINE",
					"last_seen": int(last_seen)
				})
		time.sleep(30)

def on_connect(client, userdata, flags, result, properties):
	if result == 0:
		print(f"Connected to MQTT Broker!")
		client.subscribe(MQTT_TOPIC_PRESENCE)
		client.subscribe(MQTT_TOPIC_HEARTBEAT)
		print(f"Subscribed to {MQTT_TOPIC_PRESENCE} and {MQTT_TOPIC_HEARTBEAT}")
	else:
		print(f"Failed to connect, return code: {result}")

def on_message(client, userdata, message):
	topic =  message.topic
	mqtt_message = json.loads(message.payload.decode())

	if topic == MQTT_TOPIC_PRESENCE:
		badge_id = mqtt_message["badge_id"]
		scanner = mqtt_message["scanner"]
		rssi =  mqtt_message["rssi"]

		if badge_id not in badge_locations:
			badge_locations[badge_id] = {}

		badge_locations[badge_id][scanner] = rssi
		badge_last_seen[badge_id] = time.time()

		strongest_signal = get_strongest_scanner(badge_id)
		print(f"BADGE: {badge_id}, STRONGEST_SIGNAL: {strongest_signal}, RSSI: {rssi}")

		update_firebase(badge_id, scanner, rssi)

	elif topic == MQTT_TOPIC_HEARTBEAT:
		scanner = mqtt_message["scanner"]
		scanner_status[scanner] = time.time()
		print(f"{scanner} is ONLINE")

		db.reference(f"scanner_status/{scanner}").set({
			"status" : "ONLINE",
			"last_seen" : int(time.time())
		})

# Used to check if the scanner is still online
scanner_thread = threading.Thread(target = check_scanner_status, daemon = True)
scanner_thread.start()

# Used to check if the badge is still online
badge_thread = threading.Thread(target = check_badge_status, daemon = True)
badge_thread.start()

client = paho_mqtt.Client(paho_mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT)
client.loop_forever()
