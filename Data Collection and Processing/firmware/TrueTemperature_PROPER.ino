#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "Adafruit_SHTC3.h"
#include <Adafruit_MLX90614.h>

// Wi-Fi credentials
const char* ssid = "Kendal 1 Wi-Fi";
const char* password = "Kendalone!";

// API endpoint
const char* serverName = "https://server-api-609n.onrender.com/data";

Adafruit_SHTC3 shtc3 = Adafruit_SHTC3();
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

float ambient_temp_shtc3 = 0.0;
float ambient_temp_ir = 0.0;
float object_temp_ir = 0.0;
float corrected_chick_temp = 0.0;

// Temperature thresholds
#define WARNING_TEMP 25.0
#define CRITICAL_TEMP 27.0

#define LED_PIN 2  // Onboard LED pin

bool plotterMode = true;  // Toggle between Serial Plotter and Monitor modes

void setup() {
  Serial.begin(115200);
  delay(500);

  Wire.begin();

  if (!shtc3.begin()) {
    Serial.println("ERROR: Couldn't find SHTC3 sensor!");
    while (1) delay(10);
  }

  if (!mlx.begin()) {
    Serial.println("ERROR: Could not initialize MLX90614 sensor!");
    while (1) delay(10);
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  if (!plotterMode) {
    Serial.println("SYSTEM: Initializing penguin monitoring system...");
    Serial.print("NETWORK: Connecting to ");
    Serial.print(ssid);
  }

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 40) {
    delay(250);
    if (!plotterMode) Serial.print(".");
    retries++;
  }

  if (!plotterMode) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nNETWORK: Connected successfully!");
      Serial.print("NETWORK: IP Address: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("\nERROR: Failed to connect to Wi-Fi");
    }
    Serial.println("SYSTEM: Ready for temperature monitoring\n");
  }

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
}

void blinkLED(int interval) {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(interval);
    digitalWrite(LED_PIN, LOW);
    delay(interval);
  }
}

void loop() {
  // Sensor readings
  sensors_event_t humidity, temp;
  shtc3.getEvent(&humidity, &temp);
  ambient_temp_shtc3 = temp.temperature;
  object_temp_ir = mlx.readObjectTempC();
  ambient_temp_ir = mlx.readAmbientTempC();
  corrected_chick_temp = object_temp_ir + (ambient_temp_shtc3 - ambient_temp_ir);

  // Enhanced Serial Outputs
  if (plotterMode) {
    // Serial Plotter format with labels
    Serial.print("ChickTemp:");
    Serial.print(corrected_chick_temp);
    Serial.print(",AmbientTemp:");
    Serial.print(ambient_temp_shtc3);
    Serial.print(",IRTemp:");
    Serial.println(object_temp_ir);
  } else {
    // Detailed Serial Monitor output
    Serial.println("\n=== SENSOR READINGS ===");
    Serial.print("SHTC3 Ambient Temp: ");
    Serial.print(ambient_temp_shtc3);
    Serial.println(" °C");
    
    Serial.print("MLX90614 Ambient Temp: ");
    Serial.print(ambient_temp_ir);
    Serial.println(" °C");
    
    Serial.print("MLX90614 Object Temp: ");
    Serial.print(object_temp_ir);
    Serial.println(" °C");
    
    Serial.print("Corrected Chick Temp: ");
    Serial.print(corrected_chick_temp);
    Serial.println(" °C");
    Serial.println("======================");
  }

  // Temperature alerts
  if (corrected_chick_temp >= CRITICAL_TEMP) {
    if (!plotterMode) Serial.println("ALERT: CRITICAL TEMPERATURE DETECTED!");
    blinkLED(100);
  } else if (corrected_chick_temp >= WARNING_TEMP) {
    if (!plotterMode) Serial.println("WARNING: Elevated temperature detected");
    blinkLED(500);
  } else {
    digitalWrite(LED_PIN, LOW);
    delay(1000);
  }

  // Data transmission
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["corrected_chick_temp"] = corrected_chick_temp;
    doc["timestamp"] = millis();

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    if (!plotterMode) {
      if (httpResponseCode > 0) {
        Serial.print("DATA: Upload successful (HTTP ");
        Serial.print(httpResponseCode);
        Serial.println(")");
      } else {
        Serial.print("ERROR: Upload failed (HTTP ");
        Serial.print(httpResponseCode);
        Serial.println(")");
      }
    }
    http.end();
  } else if (!plotterMode) {
    Serial.println("NETWORK: Wi-Fi disconnected - data not uploaded");
  }

  delay(1000);  // 1-second delay between readings
}