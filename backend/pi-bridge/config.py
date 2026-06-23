# contains code for Firebase init, env vars and consts
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
print("SERVICE_ACCOUNT =", os.getenv("SERVICE_ACCOUNT"))
print("FIREBASE_DB_URL =", os.getenv("FIREBASE_DB_URL"))

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

MQTT_TOPIC_PRESENCE = "spottr/presence"
MQTT_TOPIC_HEARTBEAT = "spottr/scanners/heartbeat"
MQTT_TOPIC_STATUS = "spottr/scanners/status"

SCANNER_TIMEOUT = 60  # Set Timeout for Scanner
BADGE_TIMEOUT = 60  # Set Timeout for Badge
PING_INTERVAL = 15 # Set Ping Interval
PONG_TIMEOUT = 5 # Set Pong Interval

FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL")
SERVICE_ACCOUNT = os.getenv("SERVICE_ACCOUNT")

cred = credentials.Certificate(SERVICE_ACCOUNT)
firebase_admin.initialize_app(cred, {
	"databaseURL": FIREBASE_DB_URL
})

fs_client = firestore.client()  # Just making my life easier