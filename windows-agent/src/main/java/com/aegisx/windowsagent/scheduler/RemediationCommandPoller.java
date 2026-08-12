package com.aegisx.windowsagent.scheduler;

import com.aegisx.windowsagent.dto.DeviceCommandDto;
import com.aegisx.windowsagent.service.RemediationExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RemediationCommandPoller {

    @Value("${agent.device-id}")
    private String deviceId;

    @Value("${aegisx.backend.url}")
    private String backendUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final RemediationExecutor executor;

    @Scheduled(fixedRate = 3000) // Poll backend every 3 seconds
    public void pollCommands() {
        try {
            String url = backendUrl + "/api/v1/agent/commands/" + deviceId;
            ResponseEntity<List<DeviceCommandDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<DeviceCommandDto>>() {}
            );

            List<DeviceCommandDto> commands = response.getBody();
            if (commands != null && !commands.isEmpty()) {
                log.info("Received {} pending commands from backend", commands.size());
                for (DeviceCommandDto cmd : commands) {
                    boolean success = executor.execute(cmd);
                    reportResult(cmd.getId().toString(), success ? "COMPLETED" : "FAILED", success ? "Command executed successfully by agent" : "Execution failed");
                }
            }
        } catch (Exception e) {
            // Silently ignore connection errors during offline polling
            log.trace("Command polling error: {}", e.getMessage());
        }
    }

    private void reportResult(String commandId, String status, String details) {
        try {
            String url = backendUrl + "/api/v1/agent/commands/" + commandId + "/result";
            Map<String, String> body = Map.of("status", status, "details", details);
            restTemplate.postForEntity(url, body, Map.class);
            log.info("Reported command result for {}: {}", commandId, status);
        } catch (Exception e) {
            log.error("Failed to report command result for {}", commandId, e);
        }
    }
}
