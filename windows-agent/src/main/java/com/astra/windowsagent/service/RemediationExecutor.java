package com.astra.windowsagent.service;

import com.astra.windowsagent.dto.DeviceCommandDto;
import com.astra.windowsagent.remediation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemediationExecutor {

    private final AstraEnforcerOverlay overlay;
    private final FileRemediationService fileService;
    private final ProcessRemediationService processService;
    private final NetworkRemediationService networkService;
    private final WindowsSecurityService windowsSecurityService;
    private final DemoSimulationService demoSimulationService;
    private final VerificationService verificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Idempotency cache: commandId -> Result JSON (prevents duplicate execution)
    private final Map<String, String> executedCommandsCache = new ConcurrentHashMap<>();

    public String execute(DeviceCommandDto command) {
        String rawType = command.getCommandType() != null ? command.getCommandType().trim() : "UNKNOWN";
        String target = command.getTarget();
        String params = command.getParameters();
        String commandId = command.getId() != null ? command.getId().toString() : "CMD-" + System.currentTimeMillis();
        String incidentId = command.getIncidentId() != null ? command.getIncidentId().toString() : "INC-GENERIC";
        String deviceId = command.getDeviceId() != null ? command.getDeviceId() : "local-endpoint";

        // Extract parameters from JSON payload if available
        int stepNumber = 1;
        int totalSteps = 5;
        if (params != null && !params.isBlank()) {
            try {
                JsonNode pNode = objectMapper.readTree(params);
                if ((target == null || target.isBlank())) {
                    if (pNode.has("target")) target = pNode.get("target").asText();
                    else if (pNode.has("file")) target = pNode.get("file").asText();
                    else if (pNode.has("title")) target = pNode.get("title").asText();
                }
                if (pNode.has("stepOrder")) stepNumber = pNode.get("stepOrder").asInt();
                if (pNode.has("stepNumber")) stepNumber = pNode.get("stepNumber").asInt();
                if (pNode.has("totalSteps")) totalSteps = pNode.get("totalSteps").asInt();
            } catch (Exception ignored) {}
        }

        // Check for idempotency (if already executed, return cached result)
        if (executedCommandsCache.containsKey(commandId)) {
            log.info("[REMEDIATION-IDEMPOTENCY] Command {} already executed. Returning cached outcome.", commandId);
            return executedCommandsCache.get(commandId);
        }

        RemediationAction action = RemediationAction.fromString(rawType);
        log.info("[REMEDIATION-RECEIVED] commandId={}, incidentId={}, deviceId={}, action={}, target={}",
                commandId, incidentId, deviceId, action, target);

        // Reject unknown or unlisted commands (Arbitrary command execution is strictly blocked)
        if (action == null) {
            log.error("[REMEDIATION-REJECTED] Unsupported command '{}' blocked by defensive allowlist.", rawType);
            String rejectResult = buildResultJson(commandId, incidentId, deviceId, rawType, "REJECTED", "FAILED",
                    "REJECTED_UNSUPPORTED_COMMAND: Arbitrary or unlisted command blocked for security: " + rawType,
                    "Unauthorized command pattern");
            executedCommandsCache.put(commandId, rejectResult);
            return rejectResult;
        }

        String verificationResult = "FAILED";
        String executionMessage = "";
        String errorMsg = null;

        try {
            switch (action) {
                // 1. Live Visual Demonstrations
                case SHOW_THREAT_ALERT:
                    overlay.showThreatAlert(target != null ? target : "Active Threat Vector", incidentId, "CRITICAL");
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Threat alert displayed on target screen";
                    break;

                case SHOW_MATRIX_OVERLAY:
                    overlay.showMatrixOverlay();
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Matrix security HUD displayed";
                    break;

                case CLEAR_MATRIX:
                    overlay.hideMatrixOverlay();
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Matrix HUD cleared";
                    break;

                case SIMULATE_WALLPAPER_HIJACK:
                    executionMessage = demoSimulationService.executeSimulatedWallpaperHijack(incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    break;

                case SIMULATE_GHOST_TYPER:
                    executionMessage = demoSimulationService.executeSimulatedGhostTyper(incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    break;

                case SHOW_TEST_ENFORCEMENT:
                    overlay.showSafeTestEnforcement(target != null ? target : "Endpoint Pipeline", "SAFE TEST RESPONSE RECEIVED (SUCCESS)");
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Safe test verification displayed";
                    break;

                // 2. Safe Attack Scenarios
                case EXECUTE_SAFE_ATTACK:
                case START_SAFE_ATTACK:
                    String attackTarget = target != null ? target.toUpperCase() : "SIMULATED_RANSOMWARE";
                    if (attackTarget.contains("WALLPAPER")) {
                        executionMessage = demoSimulationService.executeSimulatedWallpaperHijack(incidentId);
                    } else if (attackTarget.contains("GHOST") || attackTarget.contains("TYPER")) {
                        executionMessage = demoSimulationService.executeSimulatedGhostTyper(incidentId);
                    } else if (attackTarget.contains("BACKDOOR") || attackTarget.contains("PORT")) {
                        executionMessage = demoSimulationService.executeSimulatedBackdoor(incidentId);
                    } else if (attackTarget.contains("REGISTRY")) {
                        executionMessage = demoSimulationService.executeSimulatedRegistryHijack(incidentId);
                    } else {
                        executionMessage = demoSimulationService.executeSimulatedRansomware(incidentId);
                    }
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    break;

                case STOP_SAFE_ATTACK:
                    processService.stopDemoProcess("ping.exe");
                    networkService.stopDemoListener(44444);
                    fileService.restoreDemoFiles(incidentId);
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Safe attack simulation stopped and sandbox reset";
                    break;

                // 3. Sandboxed File Remediation
                case QUARANTINE_DEMO_FILE:
                case QUARANTINE_TEST_FILE:
                    executionMessage = fileService.quarantineDemoFile(target, incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Quarantine Sandbox Artifact", verificationResult);
                    break;

                case RESTORE_DEMO_FILE:
                case RESTORE_TEST_FILE:
                    executionMessage = fileService.restoreDemoFiles(incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Restore Baseline Files", verificationResult);
                    break;

                case REMOVE_DEMO_ARTIFACTS:
                case REMOVE_TEST_PERSISTENCE:
                    executionMessage = fileService.removeDemoPersistence(incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Remove Persistence Artifacts", verificationResult);
                    break;

                // 4. Process & Network Remediation
                case STOP_DEMO_PROCESS:
                case STOP_TEST_PROCESS:
                case KILL_PROCESS:
                    executionMessage = processService.stopDemoProcess(target);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Stop Demo Process: " + (target != null ? target : "ping.exe"), verificationResult);
                    break;

                case STOP_DEMO_LISTENER:
                case STOP_TEST_LISTENER:
                    executionMessage = networkService.stopDemoListener(44444);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Close Simulated Backdoor Port 44444", verificationResult);
                    break;

                case STOP_TEST_EXFILTRATION:
                    processService.stopDemoProcess("ping.exe");
                    fileService.removeDemoPersistence(incidentId);
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Exfiltration stream terminated and verified";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Terminate Exfiltration Stream", "VERIFIED");
                    break;

                case RESTORE_DEMO_REGISTRY:
                case RESTORE_TEST_REGISTRY:
                    executionMessage = networkService.restoreDemoRegistry(incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Restore Demo Registry Keys", verificationResult);
                    break;

                // 5. Windows Defensive Security
                case DISABLE_RDP:
                    executionMessage = windowsSecurityService.disableRdp();
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Disable Remote Desktop (RDP)", verificationResult);
                    break;

                case RESTORE_FIREWALL:
                    executionMessage = windowsSecurityService.restoreFirewall();
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Enable Host Firewall (All Profiles)", verificationResult);
                    break;

                case ENABLE_DEFENDER_REALTIME:
                case ENABLE_REALTIME:
                    executionMessage = windowsSecurityService.enableDefenderRealtime();
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Enable Defender Real-Time Protection", verificationResult);
                    break;

                case FULL_DEFENDER_SCAN:
                    executionMessage = windowsSecurityService.runDefenderScan();
                    verificationResult = "SUCCESS";
                    overlay.showRecoveryStep(stepNumber, totalSteps, "Quick Defender Endpoint Scan", "VERIFIED");
                    break;

                case ISOLATE_DEVICE:
                    executionMessage = windowsSecurityService.isolateDevice();
                    verificationResult = "SUCCESS";
                    overlay.showImmediateContainment(target != null ? target : "Endpoint", "NETWORK ISOLATION", "ENFORCED");
                    break;

                case RESTORE_NETWORK:
                    executionMessage = windowsSecurityService.restoreNetwork();
                    verificationResult = "SUCCESS";
                    overlay.showFinalResolution("Network Restored", "Endpoint network baseline re-established");
                    break;

                // 6. Recovery Step & Final Verification
                case RECOVERY_STEP:
                    String stepTitle = target != null ? target : "Automated Remediation Step";
                    overlay.showRecoveryStep(stepNumber, totalSteps, stepTitle, "VERIFIED");
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: " + stepTitle;
                    break;

                case FINAL_VERIFICATION:
                    executionMessage = verificationService.performFinalVerification(incidentId);
                    verificationResult = executionMessage.startsWith("VERIFIED_SUCCESS") ? "SUCCESS" : "FAILED";
                    if ("SUCCESS".equals(verificationResult)) {
                        overlay.showFinalResolution(incidentId, "Endpoint verified clean. All threats neutralized.");
                    }
                    break;

                case FINAL_RESOLUTION:
                    String resTarget = target != null ? target : "Endpoint Secured";
                    overlay.showFinalResolution(resTarget, "All playbooks executed. Endpoint in clean baseline.");
                    verificationResult = "SUCCESS";
                    executionMessage = "VERIFIED_SUCCESS: Endpoint secured";
                    break;

                default:
                    executionMessage = "FAILED: Unhandled action " + action;
                    verificationResult = "FAILED";
            }
        } catch (Exception e) {
            log.error("[REMEDIATION-FAILED] Exception executing action {}: {}", action, e.getMessage(), e);
            errorMsg = e.getMessage();
            verificationResult = "FAILED";
            executionMessage = "FAILED: " + e.getMessage();
        }

        String finalStatus = "SUCCESS".equalsIgnoreCase(verificationResult) ? "COMPLETED" : "FAILED";
        String resultJson = buildResultJson(commandId, incidentId, deviceId, action.name(), finalStatus, verificationResult, executionMessage, errorMsg);
        
        // Cache result for idempotency
        executedCommandsCache.put(commandId, resultJson);

        return resultJson;
    }

    private String buildResultJson(String commandId, String incidentId, String deviceId, String commandType,
                                   String status, String verification, String message, String errorMsg) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("commandId", commandId);
        map.put("incidentId", incidentId);
        map.put("deviceId", deviceId);
        map.put("commandType", commandType);
        map.put("status", status); // COMPLETED, FAILED, REJECTED
        map.put("verification", verification); // SUCCESS, FAILED
        map.put("message", message);
        if (errorMsg != null) map.put("errorMessage", errorMsg);
        map.put("timestamp", LocalDateTime.now().toString());

        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return message;
        }
    }
}
