package com.astra.backend.simulation;

import com.astra.backend.dto.ScenarioDto;
import com.astra.backend.entity.Incident;
import com.astra.backend.notification.NotificationService;
import com.astra.backend.service.RecoveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SimulationService.class);

    private final ThreatLibraryService threatLibraryService;
    private final NotificationService notificationService;
    private final com.astra.backend.repository.IncidentRepository incidentRepository;
    private final RecoveryService recoveryService;
    private final com.astra.backend.service.CommandDispatchService commandDispatchService;
    private final com.astra.backend.service.DeviceService deviceService;
    private final Random random = new Random();

    public Incident triggerRandomScenario(String target) {
        var scenarios = threatLibraryService.getAllScenarios();
        if (scenarios.isEmpty()) return null;
        ScenarioDto scenario = scenarios.get(random.nextInt(scenarios.size()));
        return triggerScenario(scenario, target);
    }

    public java.util.List<ScenarioDto> getAllScenarios() {
        return threatLibraryService.getAllScenarios();
    }

    public Incident triggerScenarioById(String threatId, String target) {
        ScenarioDto scenario = threatLibraryService.getScenarioById(threatId);
        if (scenario == null) return null;
        return triggerScenario(scenario, target);
    }

    public Incident triggerScenario(ScenarioDto scenario, String target) {
        log.info("Triggering Simulation: {}", scenario.getThreatName());

        String targetStr = target != null ? target : "SIMULATED-DEVICE-01 / 10.0.0." + (random.nextInt(254) + 1);

        Incident simulatedIncident = Incident.builder()
                .id(UUID.randomUUID())
                .name(scenario.getThreatName())
                .type(scenario.getCategory())
                .severity(scenario.getSeverity())
                .status("ACTIVE")
                .target(targetStr)
                .aiExplanation(scenario.getAiSummary())
                .build();
                
        // Save to database so it persists when navigating to the Threats page
        simulatedIncident = incidentRepository.save(simulatedIncident);
                
        // Generate recovery steps
        if (scenario.getDynamicRecovery() != null && !scenario.getDynamicRecovery().isEmpty()) {
            recoveryService.generateDynamicRecoveryStepsForIncident(simulatedIncident.getId(), scenario.getImmediateAction(), scenario.getDynamicRecovery());
        } else {
            recoveryService.generateRecoveryStepsForIncident(simulatedIncident.getId(), scenario.getImmediateAction(), scenario.getRecoveryWorkflow());
        }
                
        // Stream to WebSocket clients
        notificationService.sendNotification("threats", simulatedIncident);
        notificationService.sendNotification("timeline", Map.of(
            "event", "NEW_INCIDENT", 
            "incident", simulatedIncident,
            "immediateAction", scenario.getImmediateAction() != null ? scenario.getImmediateAction() : "Immediate Response Triggered",
            "animation", scenario.getDashboardAnimation()
        ));
        
        // Dispatch SHOW_THREAT_ALERT to the target device if it exists and is online
        try {
            java.util.List<com.astra.backend.entity.Device> devices = deviceService.getAllDevices();
            if (!devices.isEmpty()) {
                com.astra.backend.entity.Device targetDevice = devices.stream()
                        .filter(d -> "ONLINE".equalsIgnoreCase(d.getStatus()))
                        .findFirst()
                        .orElse(devices.get(0));
                
                if ("ONLINE".equalsIgnoreCase(targetDevice.getStatus())) {
                    commandDispatchService.queueCommand(
                            targetDevice.getId(),
                            simulatedIncident.getId(),
                            "SHOW_THREAT_ALERT",
                            "{\"target\":\"" + scenario.getThreatName() + "\"}"
                    );
                    log.info("Dispatched SHOW_THREAT_ALERT to device {}", targetDevice.getName());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch threat alert command: {}", e.getMessage());
        }

        return simulatedIncident;
    }
}
