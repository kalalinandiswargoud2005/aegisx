# Windows Agent - Files and Folders

## 1. Hierarchical Directory Structure

```
windows-agent/
├── installer/
│   ├── installer.iss
│   └── windows-agent.xml
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── astra/
│       │           └── windowsagent/
│       │               ├── communication/
│       │               │   └── EventSender.java
│       │               ├── companion/
│       │               │   └── AstraCompanionClient.java
│       │               ├── config/
│       │               │   └── AgentConfigHelper.java
│       │               ├── controller/
│       │               │   └── OverlayIpcController.java
│       │               ├── dispatcher/
│       │               │   └── ThreatDispatcher.java
│       │               ├── dto/
│       │               │   ├── AstraOverlayEvent.java
│       │               │   ├── DeviceCommandDto.java
│       │               │   ├── DeviceRegistrationDto.java
│       │               │   ├── HeartbeatDto.java
│       │               │   ├── TelemetryDto.java
│       │               └── └── ThreatEventDto.java
│       │               ├── monitor/
│       │               │   ├── AdministratorMonitor.java
│       │               │   ├── CPUMonitor.java
│       │               │   ├── DefenderMonitor.java
│       │               │   ├── DNSMonitor.java
│       │               │   ├── EventLogMonitor.java
│       │               │   ├── FileIntegrityMonitor.java
│       │               │   ├── FileSystemMonitor.java
│       │               │   ├── FirewallMonitor.java
│       │               │   ├── HostsMonitor.java
│       │               │   ├── MemoryMonitor.java
│       │               │   ├── ProcessMonitor.java
│       │               │   ├── RDPMonitor.java
│       │               │   ├── ScheduledTaskMonitor.java
│       │               │   ├── SecurityCenterMonitor.java
│       │               │   ├── ServiceMonitor.java
│       │               │   ├── StartupMonitor.java
│       │               │   ├── USBMonitor.java
│       │               └── └── VPNMonitor.java
│       │               ├── scheduler/
│       │               │   └── RemediationCommandPoller.java
│       │               ├── security/
│       │               ├── service/
│       │               │   ├── AstraEnforcerOverlay.java
│       │               │   ├── DeviceRegistration.java
│       │               │   ├── HardwareTelemetryService.java
│       │               │   ├── HeartbeatService.java
│       │               │   ├── MockHardwareService.java
│       │               │   ├── OverlayIpcService.java
│       │               │   ├── RemediationExecutor.java
│       │               └── └── SafeAttackExecutor.java
│       │               ├── util/
│       │               │   └── CommandRunner.java
│       │               └── WindowsAgentApplication.java
│       └── resources/
│           ├── application.yml
│           └── threat-mapping.json
├── agent.log
├── Astra-UI.vbs
├── AstraEDR.xml
└── pom.xml
```

---

## 2. Flat List (Alphabetical Relative Paths)

### Folders
- `installer`
- `src`
- `src/main`
- `src/main/java`
- `src/main/java/com`
- `src/main/java/com/astra`
- `src/main/java/com/astra/windowsagent`
- `src/main/java/com/astra/windowsagent/communication`
- `src/main/java/com/astra/windowsagent/companion`
- `src/main/java/com/astra/windowsagent/config`
- `src/main/java/com/astra/windowsagent/controller`
- `src/main/java/com/astra/windowsagent/dispatcher`
- `src/main/java/com/astra/windowsagent/dto`
- `src/main/java/com/astra/windowsagent/monitor`
- `src/main/java/com/astra/windowsagent/scheduler`
- `src/main/java/com/astra/windowsagent/security`
- `src/main/java/com/astra/windowsagent/service`
- `src/main/java/com/astra/windowsagent/util`
- `src/main/resources`

### Files
- `agent.log`
- `Astra-UI.vbs`
- `AstraEDR.xml`
- `installer/installer.iss`
- `installer/windows-agent.xml`
- `pom.xml`
- `src/main/java/com/astra/windowsagent/WindowsAgentApplication.java`
- `src/main/java/com/astra/windowsagent/communication/EventSender.java`
- `src/main/java/com/astra/windowsagent/companion/AstraCompanionClient.java`
- `src/main/java/com/astra/windowsagent/config/AgentConfigHelper.java`
- `src/main/java/com/astra/windowsagent/controller/OverlayIpcController.java`
- `src/main/java/com/astra/windowsagent/dispatcher/ThreatDispatcher.java`
- `src/main/java/com/astra/windowsagent/dto/AstraOverlayEvent.java`
- `src/main/java/com/astra/windowsagent/dto/DeviceCommandDto.java`
- `src/main/java/com/astra/windowsagent/dto/DeviceRegistrationDto.java`
- `src/main/java/com/astra/windowsagent/dto/HeartbeatDto.java`
- `src/main/java/com/astra/windowsagent/dto/TelemetryDto.java`
- `src/main/java/com/astra/windowsagent/dto/ThreatEventDto.java`
- `src/main/java/com/astra/windowsagent/monitor/AdministratorMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/CPUMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/DefenderMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/DNSMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/EventLogMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/FileIntegrityMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/FileSystemMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/FirewallMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/HostsMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/MemoryMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/ProcessMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/RDPMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/ScheduledTaskMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/SecurityCenterMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/ServiceMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/StartupMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/USBMonitor.java`
- `src/main/java/com/astra/windowsagent/monitor/VPNMonitor.java`
- `src/main/java/com/astra/windowsagent/scheduler/RemediationCommandPoller.java`
- `src/main/java/com/astra/windowsagent/service/AstraEnforcerOverlay.java`
- `src/main/java/com/astra/windowsagent/service/DeviceRegistration.java`
- `src/main/java/com/astra/windowsagent/service/HardwareTelemetryService.java`
- `src/main/java/com/astra/windowsagent/service/HeartbeatService.java`
- `src/main/java/com/astra/windowsagent/service/MockHardwareService.java`
- `src/main/java/com/astra/windowsagent/service/OverlayIpcService.java`
- `src/main/java/com/astra/windowsagent/service/RemediationExecutor.java`
- `src/main/java/com/astra/windowsagent/service/SafeAttackExecutor.java`
- `src/main/java/com/astra/windowsagent/util/CommandRunner.java`
- `src/main/resources/application.yml`
- `src/main/resources/threat-mapping.json`
