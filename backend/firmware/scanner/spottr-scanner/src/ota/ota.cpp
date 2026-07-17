#include "ota/ota.h"
#include "led/led.h"
#include "globals.h"
#include <HTTPUpdate.h>
#include <WiFiClientSecure.h>

static bool otaPending = false;
static String otaUrl;
static String otaVersion;

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

    t_httpUpdate_return ret = httpUpdate.update(client, url);

    switch (ret)
    {
    case HTTP_UPDATE_FAILED:
        Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n",
                      httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str());
        break;
    case HTTP_UPDATE_NO_UPDATES:
        Serial.println("HTTP_UPDATE_NO_UPDATES");
        break;
    case HTTP_UPDATE_OK:
        Serial.println("HTTP_UPDATE_OK");
        break;
    }
}

void serviceOTA(){
    if (otaPending){
        if (!otaPending) return;
        otaPending = false;
        ledSet(LED_OTA);
        Serial.println("Starting OTA to version " + otaVersion);
        performOTA(otaUrl);
    }
}