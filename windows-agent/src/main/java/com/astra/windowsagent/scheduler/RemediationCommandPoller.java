package com.astra.windowsagent.scheduler;

import com.astra.windowsagent.config.AgentConfigHelper;
import com.astra.windowsagent.dto.DeviceCommandDto;
import com.astra.windowsagent.service.RemediationExecutor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RemediationCommandPoller {

    private final AgentConfigHelper configHelper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final RemediationExecutor executor;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Scheduled(fixedRate = 3000) // Poll backend every 3 seconds
    public void pollCommands() {
        String deviceId = configHelper.getDeviceId();
        if (deviceId == null || deviceId.isBlank()) {
            return; // Wait until device identity is resolved via registration
        }

        String backendUrl = configHelper.getBackendUrl();
        String deviceToken = configHelper.getDeviceToken();

        try {
            String url = backendUrl + "/api/v1/agent/commands/" + deviceId;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (deviceToken != null && !deviceToken.isBlank()) {
                headers.set("X-Device-Token", deviceToken);
            }
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<List<DeviceCommandDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    request,
                    new ParameterizedTypeReference<List<DeviceCommandDto>>() {}
            );

            List<DeviceCommandDto> commands = response.getBody();
            if (commands != null && !commands.isEmpty()) {
                for (DeviceCommandDto cmd : commands) {
                    String cmdId = cmd.getId() != null ? cmd.getId().toString() : "UNKNOWN";
                    log.info("[ASTRA-CMD] RECEIVED commandId={}, deviceId={}, commandType={}, target={}",
                            cmdId, deviceId, cmd.getCommandType(), cmd.getTarget());
                    log.info("[ASTRA-CMD] CLAIMED commandId={}, deviceId={}", cmdId, deviceId);
                    log.info("[ASTRA-CMD] EXECUTION_STARTED commandId={}, deviceId={}", cmdId, deviceId);

                    String rawResult = executor.execute(cmd);

                    String reportedStatus = "COMPLETED";
                    String verificationOutcome = "SUCCESS";
                    String message = rawResult;

                    try {
                        JsonNode jsonNode = objectMapper.readTree(rawResult);
                        String statusField = jsonNode.path("status").asText("COMPLETED");
                        String verifyField = jsonNode.path("verification").asText("SUCCESS");
                        message = jsonNode.path("message").asText(rawResult);

                        if ("REJECTED".equalsIgnoreCase(statusField)) {
                            reportedStatus = "REJECTED";
                            verificationOutcome = "FAILED";
                        } else if ("FAILED".equalsIgnoreCase(statusField) || "FAILED".equalsIgnoreCase(verifyField)) {
                            reportedStatus = "FAILED";
                            verificationOutcome = "FAILED";
                        } else {
                            reportedStatus = "COMPLETED";
                            verificationOutcome = "SUCCESS";
                        }
                    } catch (Exception e) {
                        if (rawResult != null && (rawResult.startsWith("FAILED") || rawResult.contains("REJECTED"))) {
                            reportedStatus = "FAILED";
                            verificationOutcome = "FAILED";
                        }
                    }

                    log.info("[ASTRA-CMD] EXECUTION_VERIFICATION commandId={}, verificationOutcome={}, status={}",
                            cmdId, verificationOutcome, reportedStatus);

                    reportResult(cmdId, reportedStatus, rawResult, deviceToken, backendUrl);
                    log.info("[ASTRA-CMD] RESULT_SENT commandId={}, deviceId={}, status={}", cmdId, deviceId, reportedStatus);
                }
            }
        } catch (HttpStatusCodeException e) {
            log.warn("[ASTRA-POLL] Command polling HTTP error from {}: Status={} Message={}", 
                    backendUrl, e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.debug("[ASTRA-POLL] Command polling network error from {}: {}", backendUrl, e.getMessage());
        }
    }

    private void reportResult(String commandId, String status, String details, String deviceToken, String backendUrl) {
        if (commandId == null || commandId.isBlank()) return;
        try {
            String url = backendUrl + "/api/v1/agent/commands/" + commandId + "/result";
            Map<String, String> payload = new HashMap<>();
            payload.put("status", status);
            payload.put("details", details);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (deviceToken != null && !deviceToken.isBlank()) {
                headers.set("X-Device-Token", deviceToken);
            }
            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            log.error("[ASTRA-CMD] Failed to report result for command {}: {}", commandId, e.getMessage());
        }
    }
}
