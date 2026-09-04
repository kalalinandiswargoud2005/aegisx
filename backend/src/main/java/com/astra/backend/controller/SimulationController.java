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

    @PostMapping("/trigger/random")
    public ResponseEntity<Incident> triggerRandom(@RequestParam(required = false) String target) {
        Incident incident = simulationService.triggerRandomScenario(target);
        if (incident == null) return ResponseEntity.internalServerError().build();
        return ResponseEntity.ok(incident);
    }

    @GetMapping("/scenarios")
    public ResponseEntity<java.util.List<com.astra.backend.dto.ScenarioDto>> getAllScenarios() {
        return ResponseEntity.ok(simulationService.getAllScenarios());
    }

    @PostMapping("/trigger/{threatId}")
    public ResponseEntity<?> triggerScenarioById(@PathVariable String threatId, @RequestParam(required = false) String target) {
        try {
            Incident incident = simulationService.triggerScenarioById(threatId, target);
            if (incident == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(incident);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
