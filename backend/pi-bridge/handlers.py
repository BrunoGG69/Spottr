import json
import time
from firebase_admin import db
import state
from config import MQTT_TOPIC_STATUS, MQTT_TOPIC_PRESENCE, MQTT_TOPIC_HEARTBEAT
from presence import get_strongest_scanner, update_firebase
from health import verify_scanner_mac

def on_connect(client, userdata, flags, result, properties):
	if result == 0:
		print(f"Connected to MQTT Broker!")
		client.subscribe(MQTT_TOPIC_PRESENCE)
		client.subscribe(MQTT_TOPIC_HEARTBEAT)
		client.subscribe(MQTT_TOPIC_STATUS)
		client.subscribe("spottr/scanners/pong/+")
		print(f"SUBSCRIBED TO {MQTT_TOPIC_PRESENCE}, {MQTT_TOPIC_HEARTBEAT}, {MQTT_TOPIC_STATUS} and PONG TOPICS")
	else:
		print(f"Failed to connect, return code: {result}")

def on_message(client, userdata, message):
	topic = message.topic
	mqtt_message = json.loads(message.payload.decode())

	if topic == MQTT_TOPIC_PRESENCE:
		mac = mqtt_message["badge_id"]
		scanner = mqtt_message["scanner"]
		rssi = mqtt_message["rssi"]

		if mac not in state.badge_registry:
			print(f"Unregistered badge MAC: {mac} — ignoring")
			return

		badge_info = state.badge_registry[mac]
		owner = badge_info.get("owner", "Unknown")
		label = badge_info.get("label", mac)

		if mac not in state.badge_locations:
			state.badge_locations[mac] = {}

		state.badge_locations[mac][scanner] = rssi
		state.badge_last_seen[mac] = time.time()

		strongest = get_strongest_scanner(mac)
		print(f"BADGE: {label} ({owner}), ROOM: {strongest}, RSSI: {rssi}")

		update_firebase(mac, scanner, rssi)

	elif topic == MQTT_TOPIC_HEARTBEAT or topic == MQTT_TOPIC_STATUS:
		scanner = mqtt_message["scanner"]
		reported_mac = mqtt_message.get("mac")

		if not verify_scanner_mac(scanner, reported_mac):
			print(f"MAC address verification failed for {scanner}, ignoring message")
			return

		state.scanner_status[scanner] = time.time()
		print(f"{scanner} is ONLINE (MAC Address: {reported_mac})")

		db.reference(f"scanner_status/{scanner}").set({
			"status": "ONLINE",
			"last_seen": int(time.time()),
			"mac": reported_mac
		})

	elif topic.startswith("spottr/scanners/pong/"):
		scanner_id = topic.split("/")[-1]
		reported_mac = mqtt_message.get("mac")

		if not verify_scanner_mac(scanner_id, reported_mac):
			print(f"MAC address verification failed for {scanner_id}, ignoring message")
			return

		state.pong_received[scanner_id] = time.time()
		state.scanner_status[scanner_id] = time.time()
		print(f"PONG received from {scanner_id} (MAC Address: {reported_mac})")

		db.reference(f"scanner_status/{scanner_id}").set({
			"status": "ONLINE",
			"last_seen": int(time.time()),
			"mac": reported_mac
		})