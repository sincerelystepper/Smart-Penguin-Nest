#include <Wire.h>
#include <SPI.h>
#include <HX711.h>
#include <MFRC522.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MLX90640.h>

// HX711 Load Cell setup
#define DOUT  21
#define CLK   22
HX711 scale;

// RFID RC522 setup
#define RST_PIN 22
#define SS_PIN  21
MFRC522 rfid(SS_PIN, RST_PIN);

// DS18B20 Temperature Sensor setup
// got the code for DS11 tho. 
#define ONE_WIRE_BUS 16
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// MLX90640 Thermal Camera setup
Adafruit_MLX90640 mlx;

void setup() {
  // Start serial communication
  Serial.begin(115200);
  
  // Initialize Load Cell (HX711)
  scale.begin(DOUT, CLK);
  Serial.println("HX711 Load Cell Initialized!");
  
  // Initialize RFID RC522
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RFID Reader Initialized!");
  
  // Initialize DS18B20 Temperature Sensor
  sensors.begin();
  Serial.println("DS18B20 Temperature Sensor Initialized!");
  
  // Initialize MLX90640 Thermal Camera
  Wire.begin();
  if (!mlx.begin()) {
    Serial.println("MLX90640 not detected");
    while (1);
  }
  Serial.println("MLX90640 Thermal Camera Initialized!");
}

void loop() {
  // Reading weight from HX711
  if (scale.is_ready()) {
    long weight = scale.get_units(10);  // Average reading from 10 samples
    Serial.print("Weight: ");
    Serial.println(weight);
  } else {
    Serial.println("HX711 not connected.");
  }

  // Reading RFID data
  if (rfid.PICC_IsNewCardPresent()) {
    if (rfid.PICC_ReadCardSerial()) {
      Serial.print("RFID Tag ID: ");
      for (byte i = 0; i < rfid.uid.size; i++) {
        Serial.print(rfid.uid.uidByte[i], HEX);
      }
      Serial.println();
    }
  }

  // Reading Temperature from DS18B20, or maybe DTI11
  sensors.requestTemperatures();  // Request temperature reading
  float temperature = sensors.getTempCByIndex(0);  // Get temperature in Celsius
  Serial.print("Temperature: ");
  Serial.println(temperature);

  // Reading Thermal data from MLX90640
  float frame[32 * 24];  // Array to store thermal data
  mlx.getFrame(frame);  // Get thermal data
  Serial.print("Thermal data (first 10 values): ");
  for (int i = 0; i < 10; i++) {
    Serial.print(frame[i], 2);
    Serial.print(", ");
  }
  Serial.println();

  // Delay for readability
  delay(2000); // maybe 1 sec 
}


// how to add the camera in
