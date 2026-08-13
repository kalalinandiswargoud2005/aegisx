package com.astra.backend.controller;

import com.astra.backend.entity.Incident;
import com.astra.backend.service.ThreatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/threats")
@RequiredArgsConstructor
public class ThreatController {

    private final ThreatService threatService;

    @GetMapping
    public ResponseEntity<List<Incident>> getThreats() {
        return ResponseEntity.ok(threatService.getActiveThreats());
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<Incident>> getThreatHistory() {
        return ResponseEntity.ok(threatService.getResolvedThreats());
    }
    
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveThreat(@PathVariable UUID id) {
        threatService.resolveThreat(id);
        return ResponseEntity.ok().build();
    }
}

