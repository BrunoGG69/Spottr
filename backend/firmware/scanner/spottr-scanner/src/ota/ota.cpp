#include "ota/ota.h"
#include "led/led.h"
#include "globals.h"
#include <HTTPUpdate.h>
#include <WiFiClientSecure.h>

static bool otaPending = false;
static bool otaActive = false;
static String otaUrl;
static String otaVersion;

bool isOtaActive() { return otaActive; }

String otaTopic(){
    return "spottr/firmware/scanner";
}

bool isNewerVersion(const String &incoming)
{
    int major = 0, minor = 0, patch = 0;
    sscanf(incoming.c_str(), "%d.%d.%d", &major, &minor, &patch);
    if (major != FW_MAJOR) return major > FW_MAJOR;
    if (minor != FW_MINOR) return minor > FW_MINOR;
    return patch > FW_PATCH;
}

void handleOtaMessage(const String &msg){
    int vStart = msg.indexOf("\"version\":\"");
    int uStart = msg.indexOf("\"url\":\"");
    if (vStart < 0 || uStart < 0) {
        Serial.println("OTA message malformed, ignoring.");
        return;
    }
    vStart += 11;
    uStart += 7;
    String version = msg.substring(vStart, msg.indexOf("\"", vStart));
    String url = msg.substring(uStart, msg.indexOf("\"", uStart));

    Serial.println("OTA offered: " + version + " (running " FIRMWARE_VERSION ")");

    if (isNewerVersion(version)) {
        Serial.println("Newer version available, scheduling OTA.");
        otaPending = true;
        otaUrl = url;
        otaVersion = version;
    } else {
        Serial.println("No newer version available. Skipping OTA.");
    }
}

static void performOTA(const String &url){
    Serial.println("Starting OTA from : " + url);

    WiFiClientSecure client;
    client.setInsecure();

    httpUpdate.rebootOnUpdate(true);
    httpUpdate.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);

    httpUpdate.onStart([]() {
        ledSet(LED_OTA);
        Serial.println("OTA started");
    });

    httpUpdate.onProgress([](int cur, int total) {
        ledUpdate();
        static int lastPct = -1;
        int pct = total ? (cur * 100) / total : 0;
        if (pct != lastPct && pct % 10 == 0) {
            Serial.printf("OTA progress: %d%%\n", pct);
            lastPct = pct;
        }
    });

    httpUpdate.onError([](int err) {
        Serial.printf("OTA error: %d\n", err);
        ledSet(LED_ERROR);
    });

    t_httpUpdate_return ret = httpUpdate.update(client, url);

    switch (ret)
    {
    case HTTP_UPDATE_FAILED:
        Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n", httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str());
        ledSet(LED_ERROR);
        for (int i = 0; i < 60; i++) { ledUpdate(); delay(50); }
        break;

    case HTTP_UPDATE_NO_UPDATES:
        Serial.println("HTTP_UPDATE_NO_UPDATES");
        break;

    case HTTP_UPDATE_OK:
        Serial.println("HTTP_UPDATE_OK");
        ledSet(LED_ONLINE);
        ledUpdate();
        break;
    }
}

void serviceOTA(){
    if (!otaPending) return;
    otaPending = false;
    otaActive = true;
    ledSet(LED_OTA);
    Serial.println("Starting OTA to version " + otaVersion);
    performOTA(otaUrl);
    otaActive = false;
}