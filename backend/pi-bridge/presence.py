# contains logic to figure out the closest scanner to the badge
import time
from firebase_admin import db
import state
from config import fs_client

def get_strongest_scanner(mac):
	if mac not in state.badge_locations:
		return None
	readings = state.badge_locations[mac]
	strongest = max(readings, key=readings.get)
	return strongest

def update_firebase(mac, scanner, rssi):
	badge_info = state.badge_registry.get(mac, {})
	owner = badge_info.get('owner', 'Unknown')
	label = badge_info.get('label', mac)
	strongest = get_strongest_scanner(mac)

	usable_mac = mac.replace(':', '_')

	db.reference(f"badge_location/{usable_mac}").set({
		"mac": mac,
		"owner": owner,
		"label": label,
		"room": strongest,
		"rssi": rssi,
		"last_seen": time.time(),
		"status": "ONLINE"
	})

	fs_client.collection("presence_log").add({
		"mac": mac,
		"owner": owner,
		"label": label,
		"scanner": scanner,
		"rssi": rssi,
		"timestamp": int(time.time())
	})
