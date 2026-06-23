# used to load badge and scanner registries from Firebase
import time
from firebase_admin import db
import state

def load_badge_registry():
	registry_data = db.reference('badges').get()
	if isinstance(registry_data, dict):
		state.badge_registry = registry_data
		print(f"Loaded {len(state.badge_registry)} badges from Firebase")
	else:
		print("No badges found in Firebase")

def load_scanner_registry():
	registry_data = db.reference('scanners').get()
	if isinstance(registry_data, dict):
		state.scanner_registry = registry_data
		print(f"Loaded {len(state.scanner_registry)} scanners from Firebase")
	else:
		print(f"No scanners found in Firebase")

def reload_registry_periodically():
	while True:
		time.sleep(60)
		load_badge_registry()
		load_scanner_registry()
		print(f"Registries Reloaded")