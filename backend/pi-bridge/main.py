import threading
import paho.mqtt.client as paho_mqtt

import config
from registry import load_badge_registry, load_scanner_registry, reload_registry_periodically
from health import check_badge_status, ping_scanners, check_ping_responses
from handlers import on_connect, on_message

load_badge_registry()
load_scanner_registry()

client = paho_mqtt.Client(paho_mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

# Used to check if the scanner is still online
# scanner_thread = threading.Thread(target=check_scanner_status, daemon=True)
# scanner_thread.start()

# Used to check if the badge is still online
badge_thread = threading.Thread(target=check_badge_status, daemon=True)
badge_thread.start()

registry_thread = threading.Thread(target=reload_registry_periodically, daemon=True)
registry_thread.start()

ping_thread = threading.Thread(target=ping_scanners, args=(client,), daemon=True)
ping_thread.start()

ping_check_thread = threading.Thread(target=check_ping_responses, daemon=True)
ping_check_thread.start()

client.connect(config.MQTT_BROKER, config.MQTT_PORT)
client.loop_forever()