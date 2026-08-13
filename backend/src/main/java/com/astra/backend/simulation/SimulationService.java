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
    private final Random random = new Random();

    private boolean demoModeActive = false;
    private int currentScenarioIndex = 0;

    public void startDemoMode() {
        log.info("Starting HOD Presentation Mode...");
        demoModeActive = true;
        currentScenarioIndex = 0;
        notificationService.sendNotification("simulation", Map.of("status", "STARTED", "mode", "DEMO"));
    }

    public void stopDemoMode() {
        log.info("Stopping HOD Presentation Mode.");
        demoModeActive = false;
        notificationService.sendNotification("simulation", Map.of("status", "STOPPED"));
    }
    
    public boolean isDemoModeActive() {
        return demoModeActive;
    }

    @Scheduled(fixedDelay = 15000) // Trigger every 15 seconds during Demo Mode
    public void runDemoLoop() {
        if (!demoModeActive) return;

        var scenarios = threatLibraryService.getAllScenarios();
        if (scenarios.isEmpty()) return;

        ScenarioDto scenario = scenarios.get(currentScenarioIndex % scenarios.size());
        currentScenarioIndex++;
        
        triggerScenario(scenario);
    }

    public Incident triggerRandomScenario() {
        var scenarios = threatLibraryService.getAllScenarios();
        if (scenarios.isEmpty()) return null;
        ScenarioDto scenario = scenarios.get(random.nextInt(scenarios.size()));
        return triggerScenario(scenario);
    }

    public java.util.List<ScenarioDto> getAllScenarios() {
        return threatLibraryService.getAllScenarios();
    }

    public Incident triggerScenarioById(String threatId) {
        ScenarioDto scenario = threatLibraryService.getScenarioById(threatId);
        if (scenario == null) return null;
        return triggerScenario(scenario);
    }

    public Incident triggerScenario(ScenarioDto scenario) {
        log.info("Triggering Simulation: {}", scenario.getThreatName());

        Incident simulatedIncident = Incident.builder()
                .id(UUID.randomUUID())
                .name(scenario.getThreatName())
                .type(scenario.getCategory())
                .severity(scenario.getSeverity())
                .status("ACTIVE")
                .target("SIMULATED-DEVICE-01 / 10.0.0." + (random.nextInt(254) + 1))
                .aiExplanation(scenario.getAiSummary())
                .build();
                
        // Save to database so it persists when navigating to the Threats page
        simulatedIncident = incidentRepository.save(simulatedIncident);
                
        // Generate recovery steps
        recoveryService.generateRecoveryStepsForIncident(simulatedIncident.getId(), scenario.getImmediateAction(), scenario.getRecoveryWorkflow());
                
        // Stream to WebSocket clients
        notificationService.sendNotification("threats", simulatedIncident);
        notificationService.sendNotification("timeline", Map.of(
            "event", "NEW_INCIDENT", 
            "incident", simulatedIncident,
            "immediateAction", scenario.getImmediateAction() != null ? scenario.getImmediateAction() : "Immediate Response Triggered",
            "animation", scenario.getDashboardAnimation()
        ));
        
        return simulatedIncident;
    }
}
