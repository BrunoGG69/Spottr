#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <NimBLEDevice.h>
#include <PubSubClient.h>
#include <HTTPUpdate.h>
#include <WiFiClientSecure.h>
#include "spottr_logo.h"

#define DEFAULT_SCANNER_ID "scanner_node"
#define DEFAULT_MQTT_BROKER "192.168.0.12"
#define DEFAULT_MQTT_PORT 1883

#define FW_MAJOR 1
#define FW_MINOR 0
#define FW_PATCH 0
#define FIRMWARE_VERSION "1.0.0"

bool isNewerVersion(const String &incoming)
{
    int major = 0, minor = 0, patch = 0;
    sscanf(incoming.c_str(), "%d.%d.%d", &major, &minor, &patch);
    if (major != FW_MAJOR) return major > FW_MAJOR;
    if (minor != FW_MINOR) return minor > FW_MINOR;
    return patch > FW_PATCH;
}

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
NimBLEScan *pBLEScan;

String scannerMac;
String scannerId;
String roomName;
String wifiSsid;
String wifiPass;
String mqttBroker;
uint16_t mqttPort;
uint8_t setupStep = 0;
bool setupDone = false;

Preferences preferences;
WebServer portalServer(80);
DNSServer dnsServer;
const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);
bool configPortalActive = false;

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
    setupStep = preferences.getUInt("step", 0);
    setupDone = preferences.getBool("setup_done", false);
    preferences.end();
}

String buildApName()
{
    uint8_t mac[6];
    WiFi.macAddress(mac);
    char suffix[5];
    snprintf(suffix, sizeof(suffix), "%02X%02X", mac[4], mac[5]);
    return String("Spottr-Scanner-") + String(suffix);
}

const char PORTAL_HEAD[] PROGMEM = R"HEAD(
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta charset="utf-8">
<title>Spottr Scanner Setup</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
background-image:radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px);background-size:22px 22px}
.glow{position:fixed;border-radius:50%;filter:blur(110px);pointer-events:none;z-index:0}
.glow-a{top:-120px;left:-80px;width:320px;height:320px;background:rgba(0,212,245,0.13)}
.glow-b{bottom:-140px;right:-100px;width:360px;height:360px;background:rgba(139,92,246,0.10)}
.card{position:relative;z-index:1;width:100%;max-width:380px;background:rgba(255,255,255,0.03);
border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;backdrop-filter:blur(20px)}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:22px}
.wordmark{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;
text-transform:uppercase;letter-spacing:0.25em;color:#fff}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;
text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.35)}
h1{font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:4px 0 8px}
p.sub{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.5}
.dots{display:flex;gap:6px;margin:20px 0 24px}
.dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.12)}
.dot.on{background:#00D4F5}
label{display:block;font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;
letter-spacing:0.2em;color:rgba(255,255,255,0.35);margin:16px 0 6px}
input{width:100%;padding:11px 13px;background:rgba(255,255,255,0.04);
border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;outline:none}
input:focus{border-color:rgba(0,212,245,0.6)}
input::placeholder{color:rgba(255,255,255,0.25)}
.hint{font-family:ui-monospace,monospace;font-size:11px;color:#00D4F5;margin-top:7px;min-height:14px}
button{width:100%;margin-top:24px;padding:12px;background:#00D4F5;color:#000;border:0;
border-radius:999px;font-size:14px;font-weight:600;cursor:pointer}
button:hover{background:#33ddf7}
.review{margin-top:18px;border-top:1px solid rgba(255,255,255,0.06)}
.row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;
border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px}
.row span:first-child{font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;
letter-spacing:0.2em;color:rgba(255,255,255,0.35)}
.row span:last-child{color:#fff;font-family:ui-monospace,monospace;font-size:12px}
</style></head><body>
<div class="glow glow-a"></div><div class="glow glow-b"></div>
<div class="card">
)HEAD";

const char PORTAL_LOGO[] PROGMEM =
    "<div class='logo'>"
    "<img src='/logo.svg' width='30' height='30' alt=''>"
    "<span class='wordmark'>Spottr</span></div>";

String stepDots(int active)
{
    String out = "<div class='dots'>";
    for (int i = 1; i <= 4; i++)
    {
        out += String("<div class='dot") + (i <= active ? " on" : "") + "'></div>";
    }
    return out + "</div>";
}

String pageShell(const String &body)
{
    return String(FPSTR(PORTAL_HEAD)) + String(FPSTR(PORTAL_LOGO)) + body + "</div></body></html>";
}

String currentStepUrl()
{
    if (setupStep == 0) return "/";
    if (setupStep == 1) return "/wifi";
    if (setupStep == 2) return "/mqtt";
    return "/confirm";
}

void handleWelcome()
{
    String b = "<p class='eyebrow'>Setup</p><h1>Welcome to Spottr</h1>"
               "<p class='sub'>Let's get this scanner node configured. You'll name it, "
               "connect it to WiFi, and point it at your broker.</p>" +
               stepDots(0) +
               "<form action='/name' method='GET'><button type='submit'>Begin setup</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

void handleNameForm()
{
    String b = "<p class='eyebrow'>Step 1 of 4</p><h1>Name this node</h1>"
               "<p class='sub'>Which room is this scanner in?</p>" +
               stepDots(1) +
               "<form action='/name' method='POST'>"
               "<label for='room'>Room name</label>"
               "<input type='text' id='room' name='room' placeholder='Living Room' value='" + roomName + "' "
               "oninput=\"var s=this.value.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_')"
               ".replace(/^_+|_+$/g,'');document.getElementById('sid').textContent=s?'scanner_'+s:''\" required>"
               "<p class='hint' id='sid'></p>"
               "<button type='submit'>Continue</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

void handleNameSave()
{
    String room = portalServer.arg("room");
    room.trim();
    if (room.length() == 0)
    {
        portalServer.sendHeader("Location", "/name", true);
        portalServer.send(302, "text/plain", "");
        return;
    }

    String slug = slugify(room);
    if (slug.length() == 0) slug = "node";

    roomName = room;
    scannerId = "scanner_" + slug;

    preferences.begin("spottr-cfg", false);
    preferences.putString("room", roomName);
    preferences.putString("scanner_id", scannerId);
    preferences.putUInt("step", 1);
    preferences.end();
    setupStep = 1;

    Serial.println("Saved room: " + roomName + "  ->  scanner ID: " + scannerId);
    dumpStoredConfig("step 1 (name)");

    portalServer.sendHeader("Location", "/wifi", true);
    portalServer.send(302, "text/plain", "");
}

void handleWifiForm()
{
    int n = WiFi.scanNetworks();
    String options;
    for (int i = 0; i < n; i++)
    {
        options += "<option value=\"" + WiFi.SSID(i) + "\">";
    }

    String b = "<p class='eyebrow'>Step 2 of 4</p><h1>Connect to WiFi</h1>"
               "<p class='sub'>" + scannerId + " needs a network to reach your broker.</p>" +
               stepDots(2) +
               "<form action='/wifi' method='POST'>"
               "<label for='ssid'>Network</label>"
               "<input type='text' id='ssid' name='ssid' list='networks' placeholder='Network name' "
               "value='" + wifiSsid + "' required>"
               "<datalist id='networks'>" + options + "</datalist>"
               "<label for='pass'>Password</label>"
               "<input type='password' id='pass' name='pass' placeholder='Password'>"
               "<button type='submit'>Continue</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

void handleWifiSave()
{
    String ssid = portalServer.arg("ssid");
    ssid.trim();
    if (ssid.length() == 0)
    {
        portalServer.sendHeader("Location", "/wifi", true);
        portalServer.send(302, "text/plain", "");
        return;
    }

    wifiSsid = ssid;
    wifiPass = portalServer.arg("pass");

    preferences.begin("spottr-cfg", false);
    preferences.putString("ssid", wifiSsid);
    preferences.putString("pass", wifiPass);
    preferences.putUInt("step", 2);
    preferences.end();
    setupStep = 2;

    Serial.println("Saved WiFi SSID: " + wifiSsid);
    dumpStoredConfig("step 2 (wifi)");

    portalServer.sendHeader("Location", "/mqtt", true);
    portalServer.send(302, "text/plain", "");
}

void handleMqttForm()
{
    String b = "<p class='eyebrow'>Step 3 of 4</p><h1>MQTT broker</h1>"
               "<p class='sub'>Where the Raspberry Pi bridge is listening.</p>" +
               stepDots(3) +
               "<form action='/mqtt' method='POST'>"
               "<label for='broker'>Broker address</label>"
               "<input type='text' id='broker' name='broker' placeholder='192.168.0.12' "
               "value='" + mqttBroker + "' required>"
               "<label for='port'>Port</label>"
               "<input type='number' id='port' name='port' min='1' max='65535' "
               "value='" + String(mqttPort) + "'>"
               "<button type='submit'>Continue</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

void handleMqttSave()
{
    String broker = portalServer.arg("broker");
    broker.trim();
    if (broker.length() == 0)
    {
        portalServer.sendHeader("Location", "/mqtt", true);
        portalServer.send(302, "text/plain", "");
        return;
    }
    mqttBroker = broker;

    uint16_t port = DEFAULT_MQTT_PORT;
    if (portalServer.hasArg("port"))
    {
        int parsed = portalServer.arg("port").toInt();
        if (parsed > 0 && parsed <= 65535) port = (uint16_t)parsed;
    }
    mqttPort = port;

    preferences.begin("spottr-cfg", false);
    preferences.putString("broker", mqttBroker);
    preferences.putUInt("port", mqttPort);
    preferences.putUInt("step", 3);
    preferences.end();
    setupStep = 3;

    Serial.println("Saved broker: " + mqttBroker + ":" + String(mqttPort));
    dumpStoredConfig("step 3 (mqtt)");

    portalServer.sendHeader("Location", "/confirm", true);
    portalServer.send(302, "text/plain", "");
}

void handleConfirm()
{
    String b = "<p class='eyebrow'>Step 4 of 4</p><h1>Review</h1>"
               "<p class='sub'>Confirm and the scanner will restart and join your network.</p>" +
               stepDots(4) +
               "<div class='review'>"
               "<div class='row'><span>Room</span><span>" + roomName + "</span></div>"
               "<div class='row'><span>Scanner ID</span><span>" + scannerId + "</span></div>"
               "<div class='row'><span>Network</span><span>" + wifiSsid + "</span></div>"
               "<div class='row'><span>Broker</span><span>" + mqttBroker + ":" + String(mqttPort) + "</span></div>"
               "<div class='row'><span>MAC</span><span>" + WiFi.macAddress() + "</span></div>"
               "</div>"
               "<form action='/finish' method='POST'><button type='submit'>Confirm &amp; restart</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

void handleFinish()
{
    preferences.begin("spottr-cfg", false);
    preferences.putBool("setup_done", true);
    preferences.putUInt("step", 4);
    preferences.end();
    setupDone = true;

    Serial.println("Setup confirmed — marking complete.");
    dumpStoredConfig("step 4 (confirm)");

    String b = "<p class='eyebrow'>Done</p><h1>Setup complete</h1>"
               "<p class='sub'>" + scannerId + " is restarting and will join " + wifiSsid +
               ". You can close this page.</p>" + stepDots(4);
    portalServer.send(200, "text/html", pageShell(b));

    delay(1500);
    ESP.restart();
}

void handlePortalNotFound()
{
    portalServer.sendHeader("Location", String("http://192.168.4.1") + currentStepUrl(), true);
    portalServer.send(302, "text/plain", "");
}

void handleLogo()
{
    portalServer.sendHeader("Cache-Control", "max-age=86400");
    portalServer.send_P(200, "image/svg+xml", SPOTTR_LOGO_SVG);
}

void startConfigPortal()
{
    configPortalActive = true;

    WiFi.mode(WIFI_AP);
    WiFi.setSleep(false);
    WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
    String apName = buildApName();
    WiFi.softAP(apName.c_str());

    dnsServer.start(DNS_PORT, "*", apIP);

    portalServer.on("/", HTTP_GET, handleWelcome);
    portalServer.on("/name", HTTP_GET, handleNameForm);
    portalServer.on("/name", HTTP_POST, handleNameSave);
    portalServer.on("/wifi", HTTP_GET, handleWifiForm);
    portalServer.on("/wifi", HTTP_POST, handleWifiSave);
    portalServer.on("/mqtt", HTTP_GET, handleMqttForm);
    portalServer.on("/mqtt", HTTP_POST, handleMqttSave);
    portalServer.on("/confirm", HTTP_GET, handleConfirm);
    portalServer.on("/finish", HTTP_POST, handleFinish);
    portalServer.on("/logo.svg", HTTP_GET, handleLogo);
    portalServer.onNotFound(handlePortalNotFound);
    portalServer.begin();

    Serial.println("Config portal started. Connect to WiFi network: " + apName);
    Serial.println("Then open http://192.168.4.1 to configure the scanner.");
    Serial.println("Resuming at step: " + currentStepUrl());
}

bool tryConnectSavedWiFi(unsigned long timeoutMs)
{
    if (wifiSsid.length() == 0)
    {
        Serial.println("No saved WiFi credentials found.");
        return false;
    }

    Serial.println("Connecting to saved WiFi: " + wifiSsid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());

    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs)
    {
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        WiFi.setSleep(false);
        Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
        return true;
    }

    Serial.println("\nFailed to connect with saved credentials.");
    WiFi.disconnect(true);
    return false;
}

String pingTopic()
{
    return String("spottr/scanners/ping/") + scannerId;
}

String pongTopic()
{
    return String("spottr/scanners/pong/") + scannerId;
}

void performOTA(const String &url)
{
    Serial.println("Starting OTA from : " + url);

    WiFiClientSecure client;
    client.setInsecure();

    httpUpdate.rebootOnUpdate(true);

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

void connectMQTT()
{
    while (!mqtt.connected())
    {
        Serial.print("Connecting To MQTT...");
        if (mqtt.connect(scannerId.c_str()))
        {
            Serial.println("Connected!");

            String statusPayload = "{\"scanner\":\"" + scannerId + "\","
                                   "\"mac\":\"" + scannerMac + "\","
                                   "\"status\":\"online\"}";
            mqtt.publish("spottr/scanners/status", statusPayload.c_str());
            mqtt.subscribe(pingTopic().c_str());
            Serial.println("Subscribed to ping topic: " + pingTopic());
        }
        else
        {
            Serial.printf("failed rc=%d retrying in 3s\n", mqtt.state());
            delay(3000);
        }
    }
}

void sendPong()
{
    String payload = "{\"scanner\":\"" + scannerId + "\","
                     "\"mac\":\"" + scannerMac + "\","
                     "\"status\":\"alive\","
                     "\"uptime\":" + String(millis() / 1000) + "}";
    mqtt.publish(pongTopic().c_str(), payload.c_str());
    Serial.println("Received ping, sent pong");
}

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    String topicStr = String(topic);
    if (topicStr == pingTopic())
    {
        sendPong();
    }
}

class ScanCallback : public NimBLEScanCallbacks
{
    void onResult(const NimBLEAdvertisedDevice *device) override
    {
        String name = String(device->getName().c_str());
        if (name == "SPOTTR")
        {
            String mac = String(device->getAddress().toString().c_str());
            String payload = "{\"scanner\":\"" + scannerId + "\","
                             "\"badge_id\":\"" + mac + "\","
                             "\"rssi\":" + String(device->getRSSI()) + "}";
            if (mqtt.connected())
            {
                mqtt.publish("spottr/presence", payload.c_str());
            }
            Serial.printf("Spotted: %s | RSSI: %d\n", mac.c_str(), device->getRSSI());
        }
    }
};

void scanTask(void *pvParameters)
{
    while (true)
    {
        pBLEScan->start(1, false);
        pBLEScan->clearResults();
        delay(50);
    }
}

bool waitForConfigCommand(unsigned long timeoutMs)
{
    Serial.println("Type 'config' and press Enter within " + String(timeoutMs / 1000) + "s to open the config portal...");
    String input = "";
    unsigned long start = millis();

    while (millis() - start < timeoutMs)
    {
        while (Serial.available())
        {
            char c = Serial.read();
            if (c == '\n' || c == '\r')
            {
                input.trim();
                if (input == "config") return true;
                input = "";
            }
            else
            {
                input += c;
            }
        }
        delay(10);
    }
    return false;
}

void setup()
{
    Serial.begin(115200);
    delay(200);

    loadConfig();

    if (!setupDone)
    {
        Serial.println("Setup not complete — opening config portal.");
        dumpStoredConfig("boot");
        startConfigPortal();
        return;
    }

    if (waitForConfigCommand(5000))
    {
        Serial.println("Config command received — forcing config portal.");
        preferences.begin("spottr-cfg", false);
        preferences.putBool("setup_done", false);
        preferences.putUInt("step", 0);
        preferences.end();
        setupStep = 0;
        setupDone = false;
        startConfigPortal();
        return;
    }

    if (!tryConnectSavedWiFi(10000))
    {
        startConfigPortal();
        return;
    }

    scannerMac = WiFi.macAddress();
    Serial.println("Scanner MAC: " + scannerMac);
    Serial.println("Scanner ID: " + scannerId);
    Serial.println("Room: " + roomName);
    Serial.println("MQTT Broker: " + mqttBroker + ":" + String(mqttPort));

    delay(1000);

    mqtt.setServer(mqttBroker.c_str(), mqttPort);
    mqtt.setCallback(mqttCallback);
    connectMQTT();

    NimBLEDevice::init("");
    pBLEScan = NimBLEDevice::getScan();
    pBLEScan->setScanCallbacks(new ScanCallback(), false);
    pBLEScan->setActiveScan(false);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);

    xTaskCreate(scanTask, "scanTask", 4096, NULL, 1, NULL);
    Serial.println("BLE Starting + MQTT Publishing...");
}

void loop()
{
    if (configPortalActive)
    {
        dnsServer.processNextRequest();
        portalServer.handleClient();
        return;
    }

    if (!mqtt.connected())
    {
        connectMQTT();
    }
    mqtt.loop();
}