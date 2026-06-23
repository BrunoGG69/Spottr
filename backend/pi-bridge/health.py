# everything related to the health of the devices including the scanner and badges
import time
from firebase_admin import db
import state
from config import SCANNER_TIMEOUT, BADGE_TIMEOUT, PING_INTERVAL, PONG_TIMEOUT

# def check_scanner_status():
#     while True:
#         now = time.time()
#         for scanner, last_seen in list(state.scanner_status.items()):
#             if now - last_seen > SCANNER_TIMEOUT:
#                 print(f"{scanner} is OFFLINE")
#                 db.reference(f"scanner_status/{scanner}").set({
#                     "status": "OFFLINE",
#                     "last_seen": int(last_seen)
#                 })
#         time.sleep(30)

def check_badge_status():
    while True:
        now = time.time()
        for badge_id, last_seen in list(state.badge_last_seen.items()):
            if now - last_seen > BADGE_TIMEOUT:
                print(f"{badge_id} is OFFLINE")
                usable_mac = badge_id.replace(":", "_")
                db.reference(f"badge_location/{usable_mac}").update({
                    "status": "OFFLINE",
                    "last_seen": int(last_seen)
                })
        time.sleep(30)

def ping_scanners(client):
    while True:
        for scanner_id in list(state.scanner_status.keys()):
            topic = f"spottr/scanners/ping/{scanner_id}"
            client.publish(topic, "{}")
            state.pending_pings[scanner_id] = time.time()
        time.sleep(PING_INTERVAL)

def check_ping_responses():
    while True:
        now = time.time()
        for scanner_id, ping_time in list(state.pending_pings.items()):
            if now - ping_time > PONG_TIMEOUT:
                last_pong = state.pong_received.get(scanner_id, 0)
                if last_pong < ping_time:
                    print(f"{scanner_id} did not respond to ping, marking OFFLINE")
                    db.reference(f"scanner_status/{scanner_id}").set({
                        "status": "OFFLINE",
                        "last_seen": int(last_pong) if last_pong else int(ping_time),
                        "reason": "ping_timeout"
                    })
                    state.scanner_status.pop(scanner_id, None)
                del state.pending_pings[scanner_id]
        time.sleep(2)


def verify_scanner_mac(scanner_id, reported_mac):
    if not reported_mac:
        return True

    known = state.scanner_registry.get(scanner_id)
    if known is None:
        db.reference(f"scanners/{scanner_id}").set({
            "mac": reported_mac,
            "room": None,
            "label": scanner_id,
            "assigned": False
        })
        state.scanner_registry[scanner_id] = {
            "mac": reported_mac,
            "room": None,
            "label": scanner_id,
            "assigned": False
        }
        print(f"New scanner {scanner_id} auto-registered with MAC Address {reported_mac}")
        return True

    if known.get("mac") != reported_mac:
        print(
            f"WARNING: {scanner_id} reported MAC Address as {reported_mac} which differs from registry's {known.get('mac')}")
        return False

    return True