#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <FS.h>

const char *ssid = "你的WiFi名稱";
const char *password = "你的WiFi密碼";

const int ledPin = 2; // ESP32上的燈的引腳

AsyncWebServer server(80);

void setup() {
  Serial.begin(115200);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  // 連接到WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // 初始化文件系統
  if (!SPIFFS.begin(true)) {
    Serial.println("An error occurred while mounting SPIFFS");
    return;
  }

  // 設定伺服器路由
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    // 讀取HTML文件
    File file = SPIFFS.open("/index.html");
    if(!file){
      Serial.println("Failed to open file for reading");
      return;
    }

    String html = file.readString();
    file.close();
    request->send(200, "text/html", html);
  });

  // 設定按鈕的處理函式
  server.on("/button", HTTP_GET, [](AsyncWebServerRequest *request){
    String buttonValue = request->arg("value");
    if(buttonValue == "A"){
      turnOnAndOff(2000); // 2秒
    }
    else if(buttonValue == "B"){
      turnOnAndOff(4000); // 4秒
    }
    request->send(200, "text/plain", "OK");
  });

  // 啟動伺服器
  server.begin();
}

void loop() {
  // 你的程式碼主要在這裡處理
}

void turnOnAndOff(int duration) {
  digitalWrite(ledPin, HIGH);
  delay(duration);
  digitalWrite(ledPin, LOW);
}
