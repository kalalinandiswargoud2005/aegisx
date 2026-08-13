package com.astra.agent.commands;

import com.astra.agent.database.TelemetryRepository;
import com.astra.agent.simulation.SimulationEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommandProcessor {

    private final SimulationEngine simulationEngine;
    private final TelemetryRepository telemetryRepository;

    public void processCommand(String action, Map<String, Object> payload) {
        if (action == null) {
            log.warn("Received command with no action: {}", payload);
            return;
        }

        switch (action.toUpperCase()) {
            case "REFRESH":
                log.info("Executing REFRESH command");
                // Trigger an immediate heartbeat/sync if needed
                break;
            case "RESTART":
                log.warn("Executing RESTART command. Shutting down agent JVM.");
                System.exit(0); // WinSW will restart it automatically if configured
                break;
            case "RUN_DIAGNOSTICS":
                log.info("Executing RUN_DIAGNOSTICS command");
                break;
            case "START_SIMULATION":
                log.info("Executing START_SIMULATION command");
                if (payload.containsKey("threatId")) {
                    simulationEngine.triggerScenarioById((String) payload.get("threatId"));
                } else {
                    simulationEngine.triggerRandomScenario();
                }
                break;
            case "CLEAR_CACHE":
                log.info("Executing CLEAR_CACHE command");
                telemetryRepository.deleteAll();
                break;
            default:
                log.warn("Unknown command action received: {}", action);
        }
    }
}
