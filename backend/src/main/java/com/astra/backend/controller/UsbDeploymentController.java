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
        private String customFolderName;
    }

    @PostMapping("/deploy")
    public ResponseEntity<Map<String, Object>> deployToUsb(@RequestBody DeployRequest request) {
        if (request.getDrivePath() == null || request.getDrivePath().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "drivePath is required"));
        }

        boolean success = usbDeploymentService.deployAgentToUsb(
            request.getDrivePath(),
            request.getTargetHostname(),
            request.getServerUrl(),
            request.getCustomFolderName()
        );

        if (success) {
            String dirName;
            if (request.getCustomFolderName() != null && !request.getCustomFolderName().trim().isEmpty()) {
                dirName = request.getCustomFolderName().replaceAll("[^a-zA-Z0-9-_]", "_");
            } else {
                String hostname = request.getTargetHostname() != null && !request.getTargetHostname().trim().isEmpty() 
                        ? request.getTargetHostname() 
                        : "Target-Laptop";
                String safeHostname = hostname.replaceAll("[^a-zA-Z0-9-_]", "_");
                dirName = "ASTRA_AGENT_" + safeHostname;
            }

            String fullPath = request.getDrivePath();
            if (!fullPath.endsWith("\\") && !fullPath.endsWith("/")) {
                fullPath += "\\";
            }
            fullPath += dirName;
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "folderName", dirName,
                "fullPath", fullPath,
                "targetHostname", request.getTargetHostname() != null ? request.getTargetHostname() : "Target-Laptop",
                "message", "Agent deployment bundle successfully created at " + fullPath,
                "instructions", "1. Connect USB drive to target laptop.\n2. Open '" + dirName + "' folder.\n3. Right-click 'Deploy-Target-Agent.bat' and select 'Run as Administrator'."
            ));
        } else {
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "FAILED",
                "message", "Failed to write agent package to USB drive."
            ));
        }
    }
}
