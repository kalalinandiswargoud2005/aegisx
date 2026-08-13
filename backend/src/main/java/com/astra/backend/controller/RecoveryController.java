package com.astra.backend.controller;

import com.astra.backend.entity.RecoveryStep;
import com.astra.backend.service.RecoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recovery")
@RequiredArgsConstructor
public class RecoveryController {

    private final RecoveryService recoveryService;

    @GetMapping("/{incidentId}")
    public ResponseEntity<List<RecoveryStep>> getWorkflow(@PathVariable String incidentId) {
        return ResponseEntity.ok(recoveryService.getRecoveryWorkflow(UUID.fromString(incidentId)));
    }
}
