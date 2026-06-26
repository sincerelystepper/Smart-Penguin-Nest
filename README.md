# Smart Penguin Nest

<p align="center">

# Embedded Environmental Monitoring Platform for African Penguin Conservation

*An ESP32-based multi-sensor embedded instrumentation platform developed for non-invasive wildlife monitoring, environmental data acquisition, and precision weight measurement.*

<br>

![Platform](https://img.shields.io/badge/Platform-ESP32-blue?style=for-the-badge)
![Firmware](https://img.shields.io/badge/Firmware-Arduino%20C++-00979D?style=for-the-badge)
![EDA](https://img.shields.io/badge/EDA-KiCad-success?style=for-the-badge)
![Instrumentation](https://img.shields.io/badge/Instrumentation-HX711-orange?style=for-the-badge)
![Application](https://img.shields.io/badge/Application-Wildlife%20Monitoring-brightgreen?style=for-the-badge)

</p>

---

> **Engineering Portfolio Project**
>
> This repository documents the design and development of the embedded electronics subsystem for the **Smart Penguin Nest**, a multidisciplinary engineering project created to support environmental monitoring and conservation research of African Penguins through autonomous sensing, embedded instrumentation, and wireless data acquisition.

---

# Table of Contents

* [Project Overview](#project-overview)
* [Research Background](#research-background)
* [Engineering Objectives](#engineering-objectives)
* [System Architecture](#system-architecture)
* [Embedded Electronics Development](#embedded-electronics-development)
* [Hardware Platform](#hardware-platform)
* [Sensor Integration](#sensor-integration)
* [Firmware Architecture](#firmware-architecture)
* [Electronics Design](#electronics-design)
* [Load Cell Calibration](#load-cell-calibration)
* [Communication Architecture](#communication-architecture)
* [Validation & Testing](#validation--testing)
* [Engineering Challenges](#engineering-challenges)
* [Project Gallery](#project-gallery)
* [My Contributions](#my-contributions)
* [Future Improvements](#future-improvements)

---

# Project Overview

The **Smart Penguin Nest** is a prototype embedded environmental monitoring platform developed to assist wildlife researchers in continuously monitoring the environmental conditions experienced by African Penguins during breeding and molting.

The project combines precision instrumentation, environmental sensing, embedded firmware, and wireless communication into a single autonomous monitoring platform capable of acquiring, processing, and transmitting data from multiple sensors.

Although initially developed as a laboratory prototype, the hardware architecture and firmware were designed with future field deployment in mind. Following successful subsystem validation using modular development hardware, a complete electronic schematic was produced in **KiCad** to support future custom PCB revisions and deployment-ready hardware.

This repository focuses specifically on the **embedded electronics engineering**, including firmware development, sensor integration, hardware validation, calibration, and electronic design.

---

# Research Background

African Penguins (*Spheniscus demersus*) have experienced a significant decline in population over recent decades, making continuous ecological monitoring increasingly important for conservation research.

Understanding how environmental conditions influence breeding success, nesting behaviour, and molting requires reliable long-term data acquisition systems capable of operating with minimal disturbance to the animals.

The Smart Penguin Nest project was conceived as a multidisciplinary solution that combines mechanical design, software, and embedded electronics to automate the collection of environmental and physiological measurements from penguin nesting environments.

The embedded subsystem developed within this project provides the sensing and instrumentation layer responsible for acquiring reliable field measurements that can later be analysed by researchers.

---

# Engineering Objectives

The embedded monitoring platform was designed around the following engineering objectives:

* Design a modular embedded instrumentation platform.
* Integrate multiple environmental and physiological sensors.
* Perform accurate body weight measurement using precision load-cell instrumentation.
* Acquire temperature and humidity measurements within the nesting enclosure.
* Enable RFID-based identification capabilities.
* Support infrared temperature sensing.
* Implement wireless communication for remote data transmission.
* Produce a scalable electronics architecture suitable for future PCB implementation.
* Validate subsystem performance through laboratory testing and calibration.

---

# Why This Project Matters

While the immediate application targets wildlife conservation, the engineering principles demonstrated throughout this project are directly applicable to numerous embedded systems domains, including:

| Application                | Relevance                      |
| -------------------------- | ------------------------------ |
| Industrial IoT             | Multi-sensor data acquisition  |
| Precision Agriculture      | Environmental monitoring       |
| Livestock Monitoring       | Animal health instrumentation  |
| Smart Buildings            | Environmental sensing          |
| Cold Chain Monitoring      | Temperature logging            |
| Industrial Automation      | Embedded sensor integration    |
| Remote Telemetry           | Wireless monitoring systems    |
| Scientific Instrumentation | Precision embedded measurement |

The project demonstrates the complete engineering workflow required to transform individual electronic components into an integrated embedded sensing platform suitable for real-world deployment.

---

# Embedded Electronics Development

The embedded subsystem was developed using an iterative engineering workflow, beginning with individual sensor evaluation before progressing toward complete system integration.

Rather than immediately designing a custom PCB, the hardware was first assembled using modular development boards and prototyping components. This accelerated firmware development, simplified subsystem debugging, and allowed each sensing technology to be independently characterized before full system integration.

Following successful laboratory validation, the complete electronic design was captured in **KiCad**, providing a foundation for future PCB revisions and deployment-ready hardware.

The development process followed the typical lifecycle of an embedded instrumentation project:

```text
Requirements Definition
        │
        ▼
Component Selection
        │
        ▼
Power Subsystem Validation
        │
        ▼
Sensor Bring-up
        │
        ▼
Individual Driver Development
        │
        ▼
Sensor Calibration
        │
        ▼
Integrated Firmware Development
        │
        ▼
Wireless Communication
        │
        ▼
Hardware Validation
        │
        ▼
Electronic Schematic Capture
        │
        ▼
Future PCB Design
```

This incremental development approach significantly reduced integration risk by validating each subsystem independently before combining them into the complete monitoring platform.

---

# Hardware Bring-Up

Initial development focused on constructing a working prototype capable of validating each hardware subsystem independently.

The prototype platform combined:

* ESP32 development board
* Precision load-cell interface
* Environmental sensing modules
* RFID identification hardware
* Infrared temperature sensing
* Regulated power distribution
* Wireless communication

Each subsystem was individually verified before being integrated into the complete embedded platform.

<p align="center">
<img src="images/sys.jpg" width="850">
</p>

<p align="center">
<i>Figure 1 — Prototype embedded monitoring platform assembled during subsystem integration and laboratory validation.</i>
</p>

---

# Power Subsystem Validation

Power integrity is one of the most critical aspects of any embedded system.

Before integrating sensors, the power architecture was characterized using laboratory instrumentation to verify voltage regulation, current consumption, and regulator stability under varying operating conditions.

Validation activities included:

* DC-DC buck converter adjustment
* Output voltage verification
* Current consumption measurements
* Regulator stability testing
* System power-up validation

<p align="center">
<img src="images/system power up from the power supply.jpg" width="750">
</p>

<p align="center">
<i>Figure 2 — Initial subsystem power-up using a laboratory bench power supply prior to sensor integration.</i>
</p>

<p align="center">
<img src="images/dc dc buck converter.jpg" width="750">
</p>

<p align="center">
<i>Figure 3 — Output voltage calibration and verification of the DC-DC buck converter before powering embedded electronics.</i>
</p>

<p align="center">
<img src="images/current testing from the lab through a multimeter.jpg" width="750">
</p>

<p align="center">
<i>Figure 4 — Current consumption measurements performed during hardware characterization and subsystem validation.</i>
</p>

These validation steps ensured reliable power delivery to the ESP32 and all connected sensors before progressing to firmware integration and long-duration testing.

---

---

# Sensor Integration

A primary objective of the Smart Penguin Nest platform was the reliable acquisition of environmental and physiological measurements from multiple sensing technologies.

Rather than relying on a single sensor, the embedded platform integrates a heterogeneous collection of digital, analog and precision instrumentation devices, each selected to monitor a different aspect of the nesting environment.

Each sensor required dedicated firmware development, hardware integration, interface validation and system-level testing before being incorporated into the complete embedded monitoring platform.

---

# Embedded Sensor Suite

| Sensor                | Purpose                                      | Interface  |
| --------------------- | -------------------------------------------- | ---------- |
| **HX711 + Load Cell** | Precision body weight measurement            | 24-bit ADC |
| **DS18B20**           | Ambient temperature sensing                  | 1-Wire     |
| **SHTC3**             | Temperature & Relative Humidity              | I²C        |
| **MLX90614**          | Non-contact infrared temperature measurement | I²C        |
| **MFRC522**           | RFID identification                          | SPI        |

The modular firmware architecture allows each sensing subsystem to operate independently while contributing measurements to a common acquisition and communication framework.

---

# Precision Weight Measurement

## HX711 Load Cell Instrumentation

One of the primary engineering challenges was the accurate measurement of penguin body mass without disturbing the animal.

This was achieved using a strain-gauge load cell coupled with the **HX711**, a precision 24-bit analog-to-digital converter specifically designed for load-cell instrumentation.

Unlike conventional ADCs integrated into microcontrollers, the HX711 provides extremely high measurement resolution together with a programmable gain amplifier, making it particularly suitable for low-level bridge sensor measurements.

The embedded firmware performs:

* Load-cell initialization
* Zero-offset (tare) measurement
* Continuous sampling
* Digital averaging
* Calibration factor application
* Stable weight computation

Calibration parameters are stored within the ESP32's non-volatile memory, allowing the system to preserve calibration between power cycles without requiring repeated field calibration.

<p align="center">
<img src="images/weight measuring taring and finding the scale factor.png" width="800">
</p>

<p align="center">
<i>Figure 5 — Load-cell calibration procedure used to determine scale factors and improve measurement accuracy.</i>
</p>

---

# Environmental Monitoring

## Temperature Measurement

Environmental temperature is an important parameter when monitoring nesting conditions.

Initial subsystem validation utilised the **DS18B20** digital temperature sensor because of its simplicity, robustness and single-wire communication interface.

The sensor firmware was developed to provide reliable periodic measurements while maintaining low processor overhead.

Development activities included:

* Sensor initialization
* Device discovery
* Temperature acquisition
* Data validation
* Integration into the monitoring framework

As the project evolved, environmental sensing capabilities were expanded through the integration of the **SHTC3**, enabling simultaneous measurement of temperature and relative humidity.

This upgrade simplified hardware integration while improving the quantity of environmental information available to researchers.

---

# Infrared Temperature Measurement

## MLX90614

To complement conventional contact-based measurements, the monitoring platform incorporates the **MLX90614** infrared temperature sensor.

Unlike traditional sensors that require direct physical contact, the MLX90614 measures emitted infrared radiation, allowing non-contact surface temperature estimation.

Within the Smart Penguin Nest platform this capability enables:

* Non-invasive temperature monitoring
* Additional environmental characterization
* Support for future behavioural studies

Firmware development included:

* I²C communication
* Device initialization
* Continuous temperature acquisition
* Sensor validation

---

# RFID Identification

## MFRC522 RFID Module

The embedded platform also integrates an **MFRC522 RFID reader**, providing the capability to uniquely identify tagged animals during future deployments.

The RFID subsystem communicates with the ESP32 through the SPI interface and was integrated as part of the modular firmware architecture.

Development activities included:

* SPI communication
* Card detection
* UID acquisition
* System integration
* Embedded firmware validation

Although the prototype primarily focused on subsystem validation, the RFID interface establishes a foundation for future automated identification and long-term monitoring applications.

---

# Multi-Sensor Integration

Following independent validation, each sensing subsystem was integrated into a unified embedded firmware architecture.

The ESP32 coordinates sensor acquisition, manages communication interfaces, performs measurement processing and prepares environmental data for transmission to the backend server.

The resulting platform demonstrates a scalable embedded architecture capable of supporting additional sensing technologies with minimal firmware modification.

By separating each hardware driver into modular software components, the monitoring platform remains maintainable, reusable and adaptable to future conservation projects.

---



---
