package com.astra.backend.controller;

import com.astra.backend.entity.Device;
import com.astra.backend.entity.Incident;
import com.astra.backend.repository.IncidentRepository;
import com.astra.backend.service.CommandDispatchService;
import com.astra.backend.service.DeviceService;
import com.astra.backend.service.RecoveryService;
import com.astra.backend.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/live-attacks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Transactional
public class LiveAttackController {

    private final DeviceService deviceService;
    private final CommandDispatchService commandDispatchService;
    private final IncidentRepository incidentRepository;
    private final RecoveryService recoveryService;
    private final NotificationService notificationService;

    @PostMapping("/{attackType}")
    public ResponseEntity<Map<String, String>> triggerLiveAttack(
            @PathVariable String attackType,
            @RequestParam(required = false) String target) {
        List<Device> devices = deviceService.getAllDevices();
        if (devices.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "TARGET OFFLINE — ACTION NOT EXECUTED (No devices registered)"));
        }
        
        Device targetDevice = null;
        if (target != null && !target.isBlank()) {
            for (Device d : devices) {
                if (d.getId().toString().equalsIgnoreCase(target) || d.getName().equalsIgnoreCase(target)) {
                    targetDevice = d;
                    break;
                }
            }
        }
        if (targetDevice == null) {
            targetDevice = devices.stream().filter(d -> "ONLINE".equalsIgnoreCase(d.getStatus())).findFirst().orElse(devices.get(0));
        }

        if (!"ONLINE".equalsIgnoreCase(targetDevice.getStatus())) {
            log.warn("[LIVE_ATTACK] Rejected attack command for device {} because status is {}", targetDevice.getName(), targetDevice.getStatus());
            return ResponseEntity.badRequest().body(Map.of("error", "TARGET OFFLINE — ACTION NOT EXECUTED"));
        }
        
        // 1. Generate a corresponding incident in the backend
        Incident incident = new Incident();
        incident.setTarget(targetDevice.getName());
        incident.setStatus("ACTIVE");
        incident.setSeverity("HIGH");

        String immediateAction = "";
        String recoveryWorkflow = "";

        switch (attackType) {
            case "ASTRA_END_TO_END_SAFE_TEST":
            case "SIMULATED_RANSOMWARE":
                incident.setName("Simulated Ransomware File Encryption");
                incident.setType("Ransomware");
                incident.setSeverity("CRITICAL");
                incident.setAiExplanation("AI heuristic engine detected rapid file extension modification (.encrypted) in C:\\Astra\\ValuableData.");
                immediateAction = "Isolate Endpoint & Freeze Malicious Process";
                recoveryWorkflow = "Stop Simulated Attack Process, Decrypt & Rollback Files, Run Threat Quick Scan, Restore Network Connectivity, Reconcile System Baseline";
                break;
            case "REGISTRY_HIJACK":
                incident.setName("Registry Hijack (Task Manager Disabled)");
                incident.setType("Persistence");
                incident.setAiExplanation("A rogue process modified the registry to disable Task Manager (DisableTaskMgr).");
                immediateAction = "Identify Registry Change";
                recoveryWorkflow = "RESTORE_REGISTRY";
                break;
            case "BACKDOOR_PORT":
                incident.setName("Backdoor Port Opened (TCP 4444)");
                incident.setType("C2 Beacon");
                incident.setAiExplanation("A rogue PowerShell process opened a listening port on TCP 4444.");
                immediateAction = "Identify Listening Port";
                recoveryWorkflow = "CLOSE_BACKDOOR";
                break;
            case "LATERAL_MOVEMENT":
                incident.setName("Lateral Movement (Guest Admin)");
                incident.setType("Identity");
                incident.setAiExplanation("The built-in Guest account was enabled and added to the Administrators group.");
                immediateAction = "Identify Privilege Escalation";
                recoveryWorkflow = "REMOVE_GUEST_ADMIN";
                break;
            case "DATA_EXFILTRATION":
                incident.setName("Massive Data Exfiltration");
                incident.setType("Exfiltration");
                incident.setAiExplanation("Unusually high outbound network traffic detected simulating data theft.");
                immediateAction = "Isolate Network";
                recoveryWorkflow = "STOP_EXFILTRATION";
                break;
            case "SHOW_TEST_ENFORCEMENT":
                incident.setName("Safe Test Security Event");
                incident.setType("Verification");
                incident.setAiExplanation("Manual verification event for safe end-to-end overlay and pipeline testing.");
                immediateAction = "Display Safe Test HUD";
                recoveryWorkflow = "SHOW_TEST_ENFORCEMENT";
                break;
            default:
                return ResponseEntity.badRequest().body(Map.of("error", "Unknown attack type."));
        }

        incident = incidentRepository.saveAndFlush(incident);
        recoveryService.generateRecoveryStepsForIncident(incident.getId(), immediateAction, recoveryWorkflow);

        // 2. Dispatch attack execution to agent
        commandDispatchService.queueCommand(
                targetDevice.getId(),
                incident.getId(),
                "EXECUTE_SAFE_ATTACK",
                "{\"target\":\"" + attackType + "\"}"
        );
        
        notificationService.sendNotification("threats", incident);
        notificationService.sendNotification("timeline", Map.of(
            "event", "NEW_INCIDENT", 
            "incident", incident,
            "immediateAction", immediateAction,
            "animation", "pulse_red"
        ));

        return ResponseEntity.ok(Map.of("status", "Attack Dispatched", "incidentId", incident.getId().toString()));
    }
}
