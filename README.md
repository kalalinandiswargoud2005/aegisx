# ASTRA: Autonomous Enterprise Endpoint Detection & Response (EDR)

<div align="center">

```
   ▄████████    ▄████████     ███        ▄████████    ▄████████ 
  ███    ███   ███    ███ ▀█████████▄   ███    ███   ███    ███ 
  ███    ███   ███    █▀     ▀███▀▀██   ███    ███   ███    ███ 
  ███    ███   ███            ███   ▀  ▄███▄▄▄▄██▀   ███    ███ 
▀███████████ ▀███████████     ███     ▀▀███▀▀▀▀▀   ▀███████████ 
  ███    ███          ███     ███     ▀███████████   ███    ███ 
  ███    ███    ▄█    ███     ███       ███    ███   ███    ███ 
  ███    █▀   ▄████████▀     ▄████▀     ███    ███   ███    █▀  
                                        ███    ███              
```

**Next-Generation Autonomous Threat Intelligence, Live Containment & Autonomous Recovery Platform**

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 🛡️ Architecture Overview

ASTRA is a full-stack, enterprise-grade Autonomous Endpoint Detection and Response (EDR) system that continuously monitors Windows endpoints, detects hostile indicators of compromise (IoCs), and executes sub-second autonomous remediation workflows.

```
┌────────────────────────────────────────────────────────┐
│               ASTRA SOC DASHBOARD (React)              │
│       Real-time STOMP WebSockets / REST API Client     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / WebSocket (8080)
┌───────────────────────────▼────────────────────────────┐
│           ASTRA CORE BACKEND (Spring Boot)             │
│   Event Ingestion · Autonomous Engine · AI Analysis    │
└───────────────────────────┬────────────────────────────┘
                            │ Encrypted Command Channel
┌───────────────────────────▼────────────────────────────┐
│          ASTRA WINDOWS AGENT (Java 21 / Native)        │
│   Realtime File/Process/Network/Registry Telemetry     │
│   Vector HUD Overlays · Microsecond Remediation        │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Repositories

### 1. `backend/` — Core EDR Server
- **Framework:** Java 21, Spring Boot 3.3.0, Spring Security, Spring WebSocket (STOMP).
- **Database:** PostgreSQL / H2 Database with Flyway automated migrations.
- **Capabilities:**
  - Automated threat correlation & scoring engine.
  - Asynchronous command dispatch pipeline with heartbeat monitoring.
  - Multi-threaded simulation harness for safe live cyber demonstrations.

### 2. `frontend/` — SOC Cyber Console
- **Framework:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas / WebGL.
- **Capabilities:**
  - Real-time Threat Map, 3D Globe Telemetry, and Active Breach HUD.
  - 1-Click Autonomous Recovery sequence execution.
  - Dark-mode Cyberpunk SOC interface with live STOMP WebSocket streams.

### 3. `windows-agent/` — High-Performance Native Endpoint Agent
- **Capabilities:**
  - Multi-subsystem real-time monitoring (Processes, Sockets, Registry, Filesystem, Event Log, Firewall, Defender).
  - High-DPI Vector GUI overlays (Hacker Skull Ransomware HUD, Cyber Glitch, Radar Beacon, Hex Shield).
  - Autonomous local remediation engine (process termination, firewall rule injection, registry recovery).

---

## ⚡ Quick Start

### Prerequisites
- Java JDK 21+
- Node.js 18+ and npm
- Maven 3.8+

### 1. Start the Backend Server
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Start the SOC Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Build & Run the Windows Agent
```bash
cd windows-agent
mvn clean package -DskipTests
java -jar target/windows-agent-1.0.0.jar
```

---

## 🔒 Security & Safe Sandbox Execution
All built-in attack simulation routines operate inside a designated sandbox boundary (`C:\Astra\Demo`) or employ non-destructive synthetic hooks, ensuring full executive safety during live evaluations and defense demonstrations.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
