package com.astra.backend.controller;

import com.astra.backend.entity.Device;
import com.astra.backend.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final com.astra.backend.service.CommandDispatchService commandDispatchService;

    @GetMapping
    public ResponseEntity<List<Device>> getDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable UUID id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/command")
    public ResponseEntity<Map<String, String>> sendCommand(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        
        Device device = deviceService.getDeviceById(id);
        if (device == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "TARGET DEVICE NOT FOUND — ACTION NOT EXECUTED"));
        }

        if (!"ONLINE".equalsIgnoreCase(device.getStatus())) {
            log.warn("[ASTRA-DISPATCH] Rejected command for device {} because status is {}", device.getName(), device.getStatus());
            return ResponseEntity.badRequest().body(Map.of("error", "TARGET OFFLINE — ACTION NOT EXECUTED"));
        }

        String rawCommandType = payload.getOrDefault("commandType", "UNKNOWN");
        String target = payload.get("target");
        
        // Normalize command type
        String commandType = rawCommandType;
        if ("EXECUTE_WOW_FEATURE".equalsIgnoreCase(rawCommandType)) {
            if ("GHOST_TYPER".equalsIgnoreCase(target)) {
                commandType = "GHOST_TYPER";
            } else if ("MATRIX_OVERLAY".equalsIgnoreCase(target) || "SHOW_MATRIX_OVERLAY".equalsIgnoreCase(target)) {
                commandType = "SHOW_MATRIX_OVERLAY";
            } else if ("CLEAR_MATRIX".equalsIgnoreCase(target)) {
                commandType = "CLEAR_MATRIX";
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "UNSUPPORTED_DEMO_FEATURE: " + target));
            }
        } else if ("RECOVERY_STEP".equalsIgnoreCase(rawCommandType) || "EXECUTE_DYNAMIC_SCRIPT".equalsIgnoreCase(rawCommandType)) {
            String lowerTarget = (target != null ? target : "").toLowerCase();
            if (lowerTarget.contains("firewall")) {
                commandType = "RESTORE_FIREWALL";
            } else if (lowerTarget.contains("registry")) {
                commandType = "RESTORE_TEST_REGISTRY";
            } else if (lowerTarget.contains("antivirus") || lowerTarget.contains("defender") || lowerTarget.contains("realtime")) {
                commandType = "ENABLE_REALTIME";
            } else if (lowerTarget.contains("rdp") || lowerTarget.contains("remote desktop")) {
                commandType = "DISABLE_RDP";
            } else if (lowerTarget.contains("quarantine")) {
                commandType = "QUARANTINE_TEST_FILE";
            } else if (lowerTarget.contains("rollback") || lowerTarget.contains("decrypt") || lowerTarget.contains("restore file")) {
                commandType = "RESTORE_TEST_FILE";
            } else if (lowerTarget.contains("backdoor") || lowerTarget.contains("listener") || lowerTarget.contains("port")) {
                commandType = "STOP_TEST_LISTENER";
            } else if (lowerTarget.contains("exfiltration")) {
                commandType = "STOP_TEST_EXFILTRATION";
            } else if (lowerTarget.contains("process") || lowerTarget.contains("kill") || lowerTarget.contains("freeze")) {
                commandType = "STOP_TEST_PROCESS";
            } else {
                commandType = "FINAL_VERIFICATION";
            }
        }
        
        UUID incidentId = null;
        if (payload.containsKey("incidentId")) {
            try {
                incidentId = UUID.fromString(payload.get("incidentId"));
            } catch (Exception ignored) {}
        }

        String params = payload.get("parameters");
        if (params == null || params.isBlank() || !params.trim().startsWith("{")) {
            java.util.Map<String, Object> pMap = new java.util.HashMap<>();
            if (target != null && !target.isBlank()) {
                pMap.put("target", target);
            }
            try {
                params = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(pMap);
            } catch (Exception e) {
                params = "{}";
            }
        }
        
        log.info("[ASTRA-DISPATCH] Queuing command for Device: {} ({}), Type: {}, Target: {}", 
                device.getName(), id, commandType, target);

        commandDispatchService.queueCommand(id, incidentId, commandType, params);
        return ResponseEntity.ok(Map.of("status", "queued", "command", commandType, "deviceId", id.toString()));
    }
}
