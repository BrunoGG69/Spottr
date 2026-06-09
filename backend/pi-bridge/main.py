import paho.mqtt.client as paho_mqtt
import json
import time

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_PRESENCE = "spottr/presence"
MQTT_TOPIC_HEARTBEAT = "spottr/scanners/heartbeat"

badge_locations = {}
scanner_status = {}

def get_strongest_scanner(badge_id):
	if badge_id not in badge_locations:
		return None
	readings = badge_locations[badge_id]
	strongest = max(readings, key=readings.get)
	return strongest

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

		strongest_signal = get_strongest_scanner(badge_id)
		print(f"BADGE: {badge_id}, STRONGEST_SIGNAL: {strongest_signal}, RSSI: {rssi}")

	elif topic == MQTT_TOPIC_HEARTBEAT:
		scanner = mqtt_message["scanner"]
		scanner_status[scanner] = time.time()
		print(f"{scanner} is ONLINE")

client = paho_mqtt.Client(paho_mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT)
client.loop_forever()
