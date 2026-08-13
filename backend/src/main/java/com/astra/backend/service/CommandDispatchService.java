package com.astra.backend.service;

import com.astra.backend.entity.DeviceCommand;
import com.astra.backend.entity.Incident;
import com.astra.backend.repository.DeviceCommandRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommandDispatchService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CommandDispatchService.class);

    private final DeviceCommandRepository commandRepository;

    public void dispatchCommandsForIncident(Incident incident) {
        if (incident.getTarget() == null || incident.getTarget().isEmpty()) {
            log.warn("Incident {} has no target device. Cannot dispatch commands.", incident.getId());
            return;
        }

        log.info("Dispatching recovery commands for incident: {}", incident.getId());
        UUID deviceId = UUID.fromString(incident.getTarget());

        // Basic default commands based on severity if threat name isn't specifically mapped
        if ("CRITICAL".equalsIgnoreCase(incident.getSeverity())) {
            queueCommand(deviceId, incident.getId(), "ISOLATE_DEVICE", "{}");
            queueCommand(deviceId, incident.getId(), "KILL_PROCESS", "{\"target\":\"malicious_process\"}");
            queueCommand(deviceId, incident.getId(), "RUN_DEFENDER_SCAN", "{}");
        } else if ("HIGH".equalsIgnoreCase(incident.getSeverity())) {
            queueCommand(deviceId, incident.getId(), "KILL_PROCESS", "{\"target\":\"malicious_process\"}");
            queueCommand(deviceId, incident.getId(), "RUN_DEFENDER_SCAN", "{}");
        } else if ("MEDIUM".equalsIgnoreCase(incident.getSeverity())) {
            queueCommand(deviceId, incident.getId(), "RUN_DEFENDER_SCAN", "{}");
        }
        
        // Threat-specific overrides
        String name = incident.getName().toLowerCase();
        
        if (name.contains("eicar")) {
            queueCommand(deviceId, incident.getId(), "QUARANTINE_FILE", "{\"file\":\"eicar\"}");
        } else if (name.contains("mimikatz") || name.contains("credential")) {
            queueCommand(deviceId, incident.getId(), "KILL_PROCESS", "{\"target\":\"mimikatz\"}");
        } else if (name.contains("firewall disabled")) {
            queueCommand(deviceId, incident.getId(), "RE_ENABLE_FIREWALL", "{}");
        } else if (name.contains("antivirus disabled")) {
            queueCommand(deviceId, incident.getId(), "RE_ENABLE_DEFENDER", "{}");
        } else if (name.contains("administrator account")) {
            queueCommand(deviceId, incident.getId(), "DISABLE_LOCAL_ACCOUNT", "{\"username\":\"hacker\"}");
        } else if (name.contains("scheduled task")) {
            queueCommand(deviceId, incident.getId(), "REMOVE_SCHEDULED_TASK", "{\"taskName\":\"evil_task\"}");
        } else if (name.contains("rdp")) {
            queueCommand(deviceId, incident.getId(), "DISABLE_RDP", "{}");
        } else if (name.contains("ransomware") || name.contains("simulation")) {
            queueCommand(deviceId, incident.getId(), "KILL_PROCESS", "{\"target\":\"ransomware\"}");
            queueCommand(deviceId, incident.getId(), "RESTORE_NETWORK", "{}");
        }
    }

    public void queueCommand(UUID deviceId, UUID incidentId, String commandType, String params) {
        DeviceCommand cmd = DeviceCommand.builder()
                .deviceId(deviceId)
                .incidentId(incidentId)
                .commandType(commandType)
                .parameters(params)
                .status("PENDING")
                .build();
        commandRepository.save(cmd);
        log.info("Queued command {} for device {}", commandType, deviceId);
    }
}
