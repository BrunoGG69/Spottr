# contains code for Firebase init, env vars and consts
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
print("SERVICE_ACCOUNT =", os.getenv("SERVICE_ACCOUNT"))
print("FIREBASE_DB_URL =", os.getenv("FIREBASE_DB_URL"))

MQTT_BROKER = os.getenv("MQTT_BROKER")
MQTT_PORT = int(os.getenv("MQTT_PORT"))

MQTT_TOPIC_PRESENCE = os.getenv("MQTT_TOPIC_PRESENCE")
MQTT_TOPIC_HEARTBEAT = os.getenv("MQTT_TOPIC_HEARTBEAT")
MQTT_TOPIC_STATUS = os.getenv("MQTT_TOPIC_STATUS")

SCANNER_TIMEOUT = int(os.getenv("SCANNER_TIMEOUT")) # Set Timeout for Scanner from .env
BADGE_TIMEOUT = int(os.getenv("BADGE_TIMEOUT"))  # Set Timeout for Badge from .env
PING_INTERVAL = int(os.getenv("PING_INTERVAL")) # Set Ping Interval from .env
PONG_TIMEOUT = int(os.getenv("PONG_TIMEOUT")) # Set Pong Interval from .env

FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL")
SERVICE_ACCOUNT = os.getenv("SERVICE_ACCOUNT")

cred = credentials.Certificate(SERVICE_ACCOUNT)
firebase_admin.initialize_app(cred, {
	"databaseURL": FIREBASE_DB_URL
})

fs_client = firestore.client()  # Just making my life easier