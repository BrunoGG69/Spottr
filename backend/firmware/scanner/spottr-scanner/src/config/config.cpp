#include "config/config.h"
#include "globals.h"
#include <esp_mac.h>

String slugify(const String &input)
{
    String output;
    for (unsigned int i = 0; i < input.length(); i++)
    {
        char c = tolower(input[i]);
        if (isalnum(c)) output += c;
        else if (output.length() > 0 && output[output.length() - 1] != '_') output += '_';
    }
    while (output.endsWith("_")) output.remove(output.length() - 1);
    return output;
}

void dumpStoredConfig(const char *stage)
{
    preferences.begin("spottr-cfg", true);
    Serial.println();
    Serial.println("---- NVS after " + String(stage) + " ----");
    Serial.println("  step        : " + String(preferences.getUInt("step", 0)));
    Serial.println("  room        : " + preferences.getString("room", "<unset>"));
    Serial.println("  scanner_id  : " + preferences.getString("scanner_id", "<unset>"));
    Serial.println("  ssid        : " + preferences.getString("ssid", "<unset>"));
    Serial.println("  pass        : " + String(preferences.getString("pass", "").length() ? "<saved>" : "<unset>"));
    Serial.println("  broker      : " + preferences.getString("broker", "<unset>"));
    Serial.println("  port        : " + String(preferences.getUInt("port", 0)));
    Serial.println("  mqtt_user   : " + preferences.getString("mqtt_user", "<unset>"));
    Serial.println("  mqtt_pass   : " + String(preferences.getString("mqtt_pass", "").length() ? "<saved>" : "<unset>"));
    Serial.println("  setup_done  : " + String(preferences.getBool("setup_done", false) ? "true" : "false"));
    Serial.println("--------------------------------");
    preferences.end();
}

void loadConfig()
{
    preferences.begin("spottr-cfg", true);
    scannerId = preferences.getString("scanner_id", "");
    roomName = preferences.getString("room", "");
    wifiSsid = preferences.getString("ssid", "");
    wifiPass = preferences.getString("pass", "");
    mqttBroker = preferences.getString("broker", DEFAULT_MQTT_BROKER);
    mqttPort = preferences.getUInt("port", DEFAULT_MQTT_PORT);
    mqttUser = preferences.getString("mqtt_user", DEFAULT_MQTT_USER);
    mqttPass = preferences.getString("mqtt_pass", DEFAULT_MQTT_PASS);
    setupStep = preferences.getUInt("step", 0);
    setupDone = preferences.getBool("setup_done", false);
    preferences.end();
}

String buildApName()
{
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);
    char suffix[5];
    snprintf(suffix, sizeof(suffix), "%02X%02X", mac[4], mac[5]);
    return String("Spottr-Scanner-") + String(suffix);
}