#include "portal/portal.h"
#include "portal/spottr_logo.h"
#include "config/config.h"
#include "globals.h"

static const char PORTAL_HEAD[] PROGMEM = R"HEAD(
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

static const char PORTAL_LOGO[] PROGMEM =
    "<div class='logo'>"
    "<img src='/logo.svg' width='30' height='30' alt=''>"
    "<span class='wordmark'>Spottr</span></div>";

static String stepDots(int active)
{
    String out = "<div class='dots'>";
    for (int i = 1; i <= 4; i++)
    {
        out += String("<div class='dot") + (i <= active ? " on" : "") + "'></div>";
    }
    return out + "</div>";
}

static String pageShell(const String &body)
{
    return String(FPSTR(PORTAL_HEAD)) + String(FPSTR(PORTAL_LOGO)) + body + "</div></body></html>";
}

static String currentStepUrl()
{
    if (setupStep == 0) return "/";
    if (setupStep == 1) return "/wifi";
    if (setupStep == 2) return "/mqtt";
    return "/confirm";
}

static void handleWelcome()
{
    String b = "<p class='eyebrow'>Setup</p><h1>Welcome to Spottr</h1>"
               "<p class='sub'>Let's get this scanner node configured. You'll name it, "
               "connect it to WiFi, and point it at your broker.</p>" +
               stepDots(0) +
               "<form action='/name' method='GET'><button type='submit'>Begin setup</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

static void handleNameForm()
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

static void handleNameSave()
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

static void handleWifiForm()
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

static void handleWifiSave()
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

static void handleMqttForm()
{
    String b = "<p class='eyebrow'>Step 3 of 4</p><h1>MQTT broker</h1>"
               "<p class='sub'>Where the Spottr bridge is listening.</p>" +
               stepDots(3) +
               "<form action='/mqtt' method='POST'>"
               "<label for='broker'>Broker address</label>"
               "<input type='text' id='broker' name='broker' placeholder='192.168.0.12' "
               "value='" + mqttBroker + "' required>"
               "<label for='port'>Port</label>"
               "<input type='number' id='port' name='port' min='1' max='65535' "
               "value='" + String(mqttPort) + "'>"
               "<label for='mqtt_user'>Username</label>"
               "<input type='text' id='mqtt_user' name='mqtt_user' autocomplete='off' "
               "value='" + mqttUser + "'>"
               "<label for='mqtt_pass'>Password</label>"
               "<input type='password' id='mqtt_pass' name='mqtt_pass' autocomplete='new-password'>"
               "<p class='hint'>" + String(mqttPass.length() ? "Leave blank to keep the saved password." : "Leave blank if your broker allows anonymous access.") + "</p>"
               "<button type='submit'>Continue</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

static void handleMqttSave()
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

    mqttUser = portalServer.arg("mqtt_user");
    mqttUser.trim();

    String newPass = portalServer.arg("mqtt_pass");
    if (newPass.length() > 0) mqttPass = newPass;

    preferences.begin("spottr-cfg", false);
    preferences.putString("broker", mqttBroker);
    preferences.putUInt("port", mqttPort);
    preferences.putString("mqtt_user", mqttUser);
    preferences.putString("mqtt_pass", mqttPass);
    preferences.putUInt("step", 3);
    preferences.end();
    setupStep = 3;

    Serial.println("Saved broker: " + mqttBroker + ":" + String(mqttPort));
    dumpStoredConfig("step 3 (mqtt)");

    portalServer.sendHeader("Location", "/confirm", true);
    portalServer.send(302, "text/plain", "");
}

static void handleConfirm()
{
    String b = "<p class='eyebrow'>Step 4 of 4</p><h1>Review</h1>"
               "<p class='sub'>Confirm and the scanner will restart and join your network.</p>" +
               stepDots(4) +
               "<div class='review'>"
               "<div class='row'><span>Room</span><span>" + roomName + "</span></div>"
               "<div class='row'><span>Scanner ID</span><span>" + scannerId + "</span></div>"
               "<div class='row'><span>Network</span><span>" + wifiSsid + "</span></div>"
               "<div class='row'><span>Broker</span><span>" + mqttBroker + ":" + String(mqttPort) + "</span></div>"
               "<div class='row'><span>MQTT auth</span><span>" + String(mqttUser.length() ? mqttUser + " / ••••••" : "anonymous") + "</span></div>"
               "<div class='row'><span>MAC</span><span>" + WiFi.macAddress() + "</span></div>"
               "<div class='row'><span>Firmware</span><span>" FIRMWARE_VERSION "</span></div>"
               "</div>"
               "<form action='/finish' method='POST'><button type='submit'>Confirm &amp; restart</button></form>";
    portalServer.send(200, "text/html", pageShell(b));
}

static void handleFinish()
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

static void handleLogo()
{
    portalServer.sendHeader("Cache-Control", "max-age=86400");
    portalServer.send_P(200, "image/svg+xml", SPOTTR_LOGO_SVG);
}

static void handlePortalNotFound()
{
    portalServer.sendHeader("Location", String("http://192.168.4.1") + currentStepUrl(), true);
    portalServer.send(302, "text/plain", "");
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

void handlePortalLoop()
{
    dnsServer.processNextRequest();
    portalServer.handleClient();
}