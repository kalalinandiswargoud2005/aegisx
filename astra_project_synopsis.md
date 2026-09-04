# ASTRA : AUTONOMOUS ENTERPRISE THREAT INTELLIGENCE, ENDPOINT SECURITY & HARDWARE APPLIANCE
### B.Tech Major Project Synopsis — 2026–2027

---

| **Department** | Cybersecurity |
| :--- | :--- |
| **Institution** | Malla Reddy University, Hyderabad |
| **Guide** | GUIDE NAME, DESIGNATION, IV CS Alpha |
| **Batch** | Batch No. 3 |

| **Team Members** | **Hall Ticket / Roll Numbers** |
| :--- | :--- |
| **D. Sri Koushik** | 2311CS040045 |
| **Kalali Nandiswar Goud** | 2311CS040073 |
| **K. Jyothi Priya** | 2311CS040076 |

---

### Abstract

**ASTRA** is an autonomous enterprise threat intelligence, endpoint security, and dedicated hardware appliance platform engineered to bridge the critical divide between deterministic hardware-level peripheral policing and cognitive AI threat analysis. Modern enterprise environments face severe vulnerabilities from physical peripheral attack vectors (such as BadUSB / Rubber Ducky keystroke injection) as well as cognitive overload across Security Operations Centers (SOCs) caused by alert fatigue. 

ASTRA addresses these challenges through a unified triad:
1. A **deterministic bus-level USB security subsystem** that intercepts and enforces device whitelists in real time prior to OS driver binding,
2. An **autonomous AI Cognitive Reasoning Engine** powered by Google Gemini that synthesizes complex multi-stage attack telemetry into contextual root-cause analyses and natural-language mitigation playbooks, and
3. A **dedicated standalone physical hardware appliance** (built on a Raspberry Pi 4 Model B with a 7-inch capacitive touchscreen, active PWM dual-fan cooling, and GPIO-driven audio-visual sirens). 

Featuring an enterprise Java 17 / Spring Boot backend, a modern React/TypeScript SOC dashboard, and zero-latency WebSocket pipelines, ASTRA provides security teams with real-time threat monitoring, automated endpoint isolation, and comprehensive forensic audit ledgers.

---

### Problem Statement

Managing enterprise security across distributed workstations and hardware interfaces requires continuous vigilance, rapid response to physical and digital intrusions, and disciplined triage to maintain organizational defense posture. Modern corporate enterprises face four critical operational bottlenecks:

1. **Blind Spots at the Physical Boundary:** Conventional Endpoint Detection and Response (EDR) agents operate as passive software daemons within the host OS, making them blind to weaponized Human Interface Devices (HIDs) such as BadUSBs and Rubber Duckies that inject malicious payloads within milliseconds.
2. **Alert Fatigue & Cognitive Overload:** SOC analysts are inundated with thousands of disconnected cryptographic hashes and raw syslog streams from traditional SIEM tools, causing critical Mean-Time-to-Detect (MTTD) and Mean-Time-to-Respond (MTTR) latency windows.
3. **Absence of Autonomous Contextual Reasoning:** Standard rule-based scanners flag isolated anomalies but cannot correlate full MITRE ATT&CK process lineages, estimate blast radiuses, or autonomously formulate actionable containment playbooks without human delay.
4. **Vulnerability of Virtual-Only Consoles:** Reliance on shared cloud-only dashboards leaves security monitoring vulnerable to local network outages, host OS subversion, or cloud credential compromise.

There is a pressing need for a dedicated, tamper-resistant physical security appliance that combines deterministic peripheral hardware defense, high-throughput event processing, and contextual AI incident reasoning.

---

### Objectives

1. **To engineer a deterministic Hardware Security & USB Deployment Subsystem** capable of intercepting, parsing, and enforcing whitelist policies on USB devices at the bus level within sub-millisecond execution windows.
2. **To build an enterprise Threat Catalog Service** that correlates endpoint process telemetry, memory hashes, and network socket connections against real-time Common Vulnerabilities and Exposures (CVE) databases and MITRE ATT&CK matrices.
3. **To integrate an advanced LLM Cognitive Reasoning Engine (Gemini AI)** capable of performing real-time contextual incident synthesis, autonomous root-cause analysis, and natural-language mitigation playbook generation.
4. **To design and fabricate a Dedicated Standalone Physical Security Appliance** powered by a Raspberry Pi 4 Model B, an integrated 7-inch capacitive touchscreen, custom thermal PWM cooling, and hardware audio-visual siren indicators.
5. **To construct a high-throughput, asynchronous Event Ingestion & WebSocket Pipeline** using Spring Boot and React to guarantee zero-latency alert dissemination and real-time live updates across distributed endpoints.
6. **To implement an automated Incident Response & Mitigation Engine** capable of isolating compromised endpoints, terminating unauthorized parent-child process trees, and revoking peripheral bus access autonomously.
7. **To provide a transparent, user-friendly SOC Dashboard & Audit Ledger** featuring interactive health gauges, simulated live attack testing suites, and cryptographic forensic audit trails for all manual and autonomous actions.

---

### System Architecture

```
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   ASTRA ARCHITECTURE                                     │
 ├─────────────────────────┬───────────────────────────────┬────────────────────────────────┤
 │   1. HARDWARE & USB     │      2. AI COGNITIVE &        │     3. BACKEND SERVICES &      │
 │   POLICING SUBSYSTEM    │       THREAT CATALOG          │        SOC DASHBOARD           │
 │ ─────────────────────── │ ───────────────────────────── │ ────────────────────────────── │
 │ • Raspberry Pi 4 ARM    │ • Google Gemini LLM API       │ • Spring Boot 3 / Java 17      │
 │ • 7" Capacitive Touch   │ • Prompt Context Engine       │ • Spring Security & JWT        │
 │ • Active PWM Cooling    │ • MITRE ATT&CK Catalog        │ • Asynchronous STOMP / WS      │
 │ • GPIO Siren Indicators │ • Incident Playbook Generator │ • React 18 / TypeScript UI     │
 │ • BadUSB Bus Intercept  │ • Root-Cause Blast Analyzer   │ • Relational Audit Ledger      │
 └─────────────────────────┴───────────────────────────────┴────────────────────────────────┘
```

#### Module 1: Deterministic Hardware Security & USB Deployment Engine
Operating at the hardware-software boundary, this module interfaces directly with peripheral buses to inspect USB descriptors (Vendor ID, Product ID, Interface Class). It deterministically validates devices against cryptographic whitelists, instantly blocking unauthorized mass storage or keystroke injection payloads (BadUSB / Rubber Ducky) prior to OS driver binding.

#### Module 2: Threat Catalog & Telemetry Ingestion Pipeline
Responsible for aggregating high-frequency endpoint telemetry, including running process trees, parent-child lineages, file hash modifications, and active network sockets. It maps anomalies directly to MITRE ATT&CK tactics, CVE databases, and behavioral heuristic signatures to classify threats into severity tiers.

#### Module 3: AI Cognitive Reasoning & Autonomous Mitigation Agent
The core analytical brain powered by Large Language Models (Google Gemini). When complex or novel threat vectors arise, this module synthesizes full multi-vector event payloads, computes attack blast radius, evaluates threat actor intent, and produces human-readable incident briefs alongside automated mitigation execution commands (endpoint network isolation, process termination).

#### Module 4: Standalone Physical Appliance & Interactive SOC Console
The user-facing command center running both on the dedicated 7-inch hardware appliance touchscreen and distributed SOC web consoles. Built with React, TypeScript, and Tailwind CSS, it features real-time telemetry gauges, interactive live attack simulators, role-based access control (RBAC), and immutable forensic audit logs of all automated and manual security actions.

---

### Technology Stack

| Component | Technology |
| :--- | :--- |
| **Physical Appliance Hardware** | Raspberry Pi 4 Model B (Quad-Core ARM Cortex-A72), 7-inch DSI Capacitive Touchscreen, Dual-Fan PWM Thermal Cooling, GPIO Audio Buzzer & LED Siren Indicators, Custom 3D-Printed Enclosure |
| **Backend Framework** | Java 17, Spring Boot 3.x (Spring Security, Spring Data JPA) |
| **Real-Time Communication** | Spring WebSocket with STOMP Protocol |
| **AI / LLM Cognitive Engine** | Google Gemini API (Structured Few-Shot Prompt Engineering, Context Synthesizer) |
| **Database & Persistence** | Relational Database (MySQL / H2), Hibernate ORM |
| **Authentication & Security** | JWT (JSON Web Tokens), BCrypt Password Encryption, Role-Based Access Control (RBAC) |
| **Frontend Framework** | React 18 with TypeScript, Vite |
| **Styling & UI Components** | Tailwind CSS, Lucide React Icons, Glassmorphism Design System |
| **Data Visualization** | Custom Dynamic SVG Gauges, Canvas Arc Gauges, Real-Time Charting |
| **Threat Intelligence Framework** | MITRE ATT&CK Enterprise Matrix, CVE Classification Mapping |

---

### Expected Outcomes

- **Deterministic Physical Protection:** Complete elimination of unauthorized USB peripheral injection attacks (e.g., Rubber Ducky payloads) through sub-millisecond bus-level validation.
- **Drastic Reduction in Triage Latency:** Compression of Tier-1 SOC alert triage and analysis time from an industry standard of 15–20 minutes down to **sub-second AI response times** with natural-language remediation playbooks.
- **Resilient Out-of-Band Physical Monitoring:** Continuous, tamper-resistant monitoring through an independent physical hardware appliance with audio-visual alarms that operate even during workstation host compromise.
- **Zero-Latency Incident Visibility:** Sub-50ms real-time event streaming and telemetry distribution to security analysts via high-throughput WebSocket brokers.
- **Autonomous Incident Containment:** Immediate automated execution of containment playbooks (host isolation, process tree termination, port shutdown) minimizing adversary lateral movement.

---

### Conclusion

**ASTRA** demonstrates the transformative impact of unifying dedicated hardware appliances, deterministic peripheral bus policing, and cognitive Artificial Intelligence reasoning within modern enterprise defense. By eliminating the blind spots of traditional software-only EDRs and relieving SOC analysts from severe alert fatigue through automated LLM synthesis, ASTRA establishes a comprehensive, resilient, and proactive cybersecurity architecture. The project not only addresses the critical vulnerability of physical hardware attack vectors but also sets a new standard for transparency and autonomous response in modern enterprise Security Operations Centers.