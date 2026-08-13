package com.astra.backend.controller;

import com.astra.backend.hardware.UsbDeploymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usb")
@RequiredArgsConstructor
@CrossOrigin
public class UsbDeploymentController {

    private final UsbDeploymentService usbDeploymentService;

    @GetMapping("/drives")
    public ResponseEntity<Map<String, Object>> getUsbDrives() {
        List<UsbDeploymentService.UsbDriveInfo> drives = usbDeploymentService.getConnectedUsbDrives();
        String hostIp = usbDeploymentService.getHostIpAddress();
        return ResponseEntity.ok(Map.of(
            "drives", drives,
            "hostIp", hostIp,
            "defaultServerUrl", "http://" + hostIp + ":8080"
        ));
    }

    @Data
    public static class DeployRequest {
        private String drivePath;
        private String targetHostname;
        private String serverUrl;
    }

    @PostMapping("/deploy")
    public ResponseEntity<Map<String, Object>> deployToUsb(@RequestBody DeployRequest request) {
        if (request.getDrivePath() == null || request.getDrivePath().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "drivePath is required"));
        }

        boolean success = usbDeploymentService.deployAgentToUsb(
            request.getDrivePath(),
            request.getTargetHostname(),
            request.getServerUrl()
        );

        if (success) {
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Agent installer staged successfully to " + request.getDrivePath() + "ASTRA_AGENT_INSTALLER",
                "instructions", "1. Connect USB drive to target laptop.\n2. Open 'ASTRA_AGENT_INSTALLER' directory.\n3. Right-click 'Deploy-Target-Agent.bat' and select 'Run as Administrator'."
            ));
        } else {
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "FAILED",
                "message", "Failed to write agent package to USB drive."
            ));
        }
    }
}
