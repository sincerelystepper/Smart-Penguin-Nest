#include "HX711.h"
#include <EEPROM.h>

// Pins
const int DT_PIN = 4;   // Data pin (GPIO4)
const int SCK_PIN = 5;  // Clock pin (GPIO5)

// EEPROM
#define EEPROM_SIZE 64
#define CALIBRATION_ADDR 0

HX711 scale;

// Calibration
float calibration_factor = -100.0;  // Default starting value
float known_weight = 1500.0;         // 1.5kg (adjust to your known weight)
bool calibrated = false;

void setup() {
  Serial.begin(115200);
  delay(1000);  // Stabilize serial

  Serial.println("\n=== LOAD CELL CALIBRATION ===");
  Serial.println("Commands: t= tare, c= calibrate, += +100, -= -100");
  Serial.println("          f= +10, g= -10, p= print factor, s= save reading");
  Serial.println("          i= instructions, z= reset EEPROM");

  // Initialize EEPROM and load saved factor
  EEPROM.begin(EEPROM_SIZE);
  loadCalibrationFromEEPROM();

  // Initialize scale
  scale.begin(DT_PIN, SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare();

  Serial.print("Current calib. factor: ");
  Serial.println(calibration_factor, 2);
  Serial.println("Place no weight on scale.");
}

void loop() {
  // Handle serial commands
  if (Serial.available()) {
    char command = Serial.read();
    if (command != '\n' && command != '\r') {  // Ignore newlines
      handleSerialCommand(command);
    }
  }

  // Display weight if calibrated
  if (calibrated) {
    Serial.print("Weight: ");
    Serial.print(scale.get_units(5), 1);  // Average 5 readings
    Serial.println(" g");
    delay(500);
  }
}

// --- Functions ---
void loadCalibrationFromEEPROM() {
  EEPROM.get(CALIBRATION_ADDR, calibration_factor);
  if (isnan(calibration_factor)) {
    calibration_factor = -7050.0;  // Default if EEPROM is empty
    Serial.println("No saved calibration. Using default factor.");
  } else {
    Serial.print("Loaded calibration factor: ");
    Serial.println(calibration_factor, 2);
  }
}

void saveCalibrationToEEPROM() {
  EEPROM.put(CALIBRATION_ADDR, calibration_factor);
  EEPROM.commit();
  Serial.println("Calibration saved to EEPROM.");
}

void handleSerialCommand(char command) {
  switch (command) {
    case 't':  // Tare
      scale.tare();
      Serial.println("Tare complete. Scale reset to zero.");
      break;

    case 'c':  // Calibrate
      calibrate();
      break;

    case '+':  // Coarse increase
      calibration_factor += 100;
      updateScale();
      break;

    case '-':  // Coarse decrease
      calibration_factor -= 100;
      updateScale();
      break;

    case 'f':  // Fine increase
      calibration_factor += 10;
      updateScale();
      break;

    case 'g':  // Fine decrease
      calibration_factor -= 10;
      updateScale();
      break;

    case 'p':  // Print factor
      Serial.print("Calibration factor: ");
      Serial.println(calibration_factor, 2);
      break;

    case 's':  // Stable reading
      takeStableReading();
      break;

    case 'i':  // Instructions
      printInstructions();
      break;

    case 'z':  // Reset EEPROM
      calibration_factor = -7050.0;
      saveCalibrationToEEPROM();
      scale.set_scale(calibration_factor);
      Serial.println("EEPROM reset to default factor.");
      break;

    default:
      Serial.println("Unknown command. Type 'i' for help.");
  }
}

void calibrate() {
  Serial.println("\n=== CALIBRATION ===");
  Serial.println("Place known weight on scale FIRST, then type weight in grams (e.g., 1500)");
  
  // Clear any leftover serial data
  while(Serial.available()) Serial.read();
  
  // Wait for user input
  unsigned long startTime = millis();
  while (!Serial.available()) {
    if (millis() - startTime > 10000) { // 10-second timeout
      Serial.println("Timeout: No weight entered. Aborting.");
      return;
    }
    delay(10);
  }

  // Read the full input (e.g., "1500")
  String input = Serial.readStringUntil('\n');
  input.trim();
  known_weight = input.toFloat();

  if (known_weight <= 0) {
    Serial.println("ERROR: Weight must be > 0. Aborting.");
    return;
  }

  Serial.print("Calibrating with ");
  Serial.print(known_weight);
  Serial.println("g...");

  // Take 10 readings and average
  float avg = 0;
  for (int i = 0; i < 10; i++) {
    avg += scale.get_units();
    delay(200);
  }
  avg /= 10;

  // Calculate new factor (handle negative values)
  calibration_factor = avg / known_weight;
  scale.set_scale(calibration_factor);
  saveCalibrationToEEPROM();
  calibrated = true;

  Serial.print("New calibration factor: ");
  Serial.println(calibration_factor);
  Serial.print("Current reading: ");
  Serial.print(scale.get_units(5), 1);
  Serial.println(" g");
  Serial.println("=== CALIBRATION DONE ===");
}

void updateScale() {
  scale.set_scale(calibration_factor);
  Serial.print("New factor: ");
  Serial.println(calibration_factor, 2);
  Serial.print("Current weight: ");
  Serial.print(scale.get_units(5), 1);
  Serial.println(" g");
}

void takeStableReading() {
  Serial.println("\nStable reading (10 seconds)...");
  unsigned long start = millis();
  while (millis() - start < 10000) {
    Serial.print("Weight: ");
    Serial.print(scale.get_units(5), 1);
    Serial.println(" g");
    delay(200);
  }
  Serial.println("Done.");
}

void printInstructions() {
  Serial.println("\nCOMMANDS:");
  Serial.println("t - Tare (reset to zero)");
  Serial.println("c - Calibrate with known weight");
  Serial.println("+/- - Adjust factor by 100");
  Serial.println("f/g - Fine-tune by 10");
  Serial.println("p - Print current factor");
  Serial.println("s - 10-second stable reading");
  Serial.println("z - Reset EEPROM to default");
  Serial.println("i - Show instructions");
}