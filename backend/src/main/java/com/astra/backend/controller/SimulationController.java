package com.astra.backend.controller;

import com.astra.backend.entity.Incident;
import com.astra.backend.simulation.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/demo/start")
    public ResponseEntity<Map<String, String>> startDemo() {
        simulationService.startDemoMode();
        return ResponseEntity.ok(Map.of("status", "Demo Started"));
    }

    @PostMapping("/demo/stop")
    public ResponseEntity<Map<String, String>> stopDemo() {
        simulationService.stopDemoMode();
        return ResponseEntity.ok(Map.of("status", "Demo Stopped"));
    }

    @GetMapping("/demo/status")
    public ResponseEntity<Map<String, Boolean>> getDemoStatus() {
        return ResponseEntity.ok(Map.of("active", simulationService.isDemoModeActive()));
    }

    @PostMapping("/trigger/random")
    public ResponseEntity<Incident> triggerRandom() {
        Incident incident = simulationService.triggerRandomScenario();
        if (incident == null) return ResponseEntity.internalServerError().build();
        return ResponseEntity.ok(incident);
    }

    @GetMapping("/scenarios")
    public ResponseEntity<java.util.List<com.astra.backend.dto.ScenarioDto>> getAllScenarios() {
        return ResponseEntity.ok(simulationService.getAllScenarios());
    }

    @PostMapping("/trigger/{threatId}")
    public ResponseEntity<Incident> triggerScenarioById(@PathVariable String threatId) {
        Incident incident = simulationService.triggerScenarioById(threatId);
        if (incident == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(incident);
    }
}
