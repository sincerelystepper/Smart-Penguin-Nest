
// This code uploads the raw data from the load cells, which is the testing point for the load cells, see if they work. 

#include <WiFi.h>
#include "HX711.h"

// HX711 pins (connect accordingly)
#define DOUT 32  // Data pin from HX711 : this is the DAT line 
#define CLK 33   // Clock pin from HX711

HX711 scale;

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  
  scale.begin(DOUT, CLK);
  scale.set_scale();  // You'll calibrate this value later
  scale.tare();       // Reset the scale to 0

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("NodeMCU IP address: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    String request = client.readStringUntil('\r');
    client.flush();

    float weight = scale.get_units(5);  // Get average of 5 readings

    // HTML content for auto-refresh display
    String html = "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='2'>"
                  "<meta charset='UTF-8'><title>Penguin ICU - Weight</title></head><body>"
                  "<h1>Penguin ICU - Weight</h1>"
                  "<p><strong>Current Weight:</strong> " + String(weight, 2) + " grams</p>"
                  "</body></html>";

    client.println("HTTP/1.1 200 OK");
    client.println("Content-type:text/html");
    client.println();
    client.println(html);
    client.println();

    Serial.println("Weight: " + String(weight) + " g");
  }
}
