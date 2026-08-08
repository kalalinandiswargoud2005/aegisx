package com.aegisx.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.aegisx.backend.entity.Device;
import com.aegisx.backend.entity.Incident;
import com.aegisx.backend.repository.DeviceRepository;
import com.aegisx.backend.repository.IncidentRepository;
import com.aegisx.backend.websocket.WebSocketPublisher;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentController {

    private final DeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;
    private final WebSocketPublisher webSocketPublisher;
    private final com.aegisx.backend.service.ThreatCatalogService threatCatalogService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, Object> payload) {
        UUID deviceId = UUID.fromString(payload.get("deviceId").toString());
        String name = (String) payload.getOrDefault("hostname", "Unknown Device");
        String osName = (String) payload.getOrDefault("osName", "Windows");
        String ip = (String) payload.getOrDefault("ipAddress", "127.0.0.1");

        Device device = deviceRepository.findById(deviceId).orElse(new Device());
        device.setId(deviceId);
        device.setName(name);
        device.setType("WINDOWS_AGENT");
        device.setIpAddress(ip);
        device.setStatus("ONLINE");
        device.setHealth("EXCELLENT");
        deviceRepository.save(device);

        return ResponseEntity.ok(Map.of("status", "registered"));
    }

    @PostMapping("/telemetry")
    public ResponseEntity<Map<String, String>> receiveTelemetry(@RequestBody Map<String, Object> payload) {
        webSocketPublisher.broadcastTelemetry(payload);
        return ResponseEntity.ok(Map.of("status", "received"));
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, String>> heartbeat() {
        return ResponseEntity.ok(Map.of("status", "alive"));
    }

    @PostMapping("/incident")
    public ResponseEntity<Map<String, String>> reportIncident(@RequestBody Map<String, Object> payload) {
        UUID deviceId = UUID.fromString(payload.get("deviceId").toString());
        String threatId = (String) payload.getOrDefault("threatId", "UNKNOWN");
        
        Incident incident = new Incident();
        incident.setId(UUID.randomUUID());
        incident.setTarget(deviceId.toString());
        incident.setStatus("BLOCKED"); // Agent blocks it locally
        
        threatCatalogService.getThreatById(threatId).ifPresentOrElse(
            catalog -> {
                incident.setName(catalog.getThreatName());
                incident.setType(catalog.getCategory());
                incident.setSeverity(catalog.getSeverity());
            },
            () -> {
                incident.setName("Unknown Threat: " + threatId);
                incident.setType("Unknown");
                incident.setSeverity("LOW");
            }
        );

        incidentRepository.save(incident);
        webSocketPublisher.broadcastNewThreat(incident);

        return ResponseEntity.ok(Map.of("status", "reported"));
    }
}
