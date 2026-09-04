package com.astra.windowsagent.communication;

import com.astra.windowsagent.config.AgentConfigHelper;
import com.astra.windowsagent.dto.ThreatEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventSender {

    private final AgentConfigHelper configHelper;
    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEvent(String threatId, String details) {
        String deviceId = configHelper.getDeviceId();
        if (deviceId == null || deviceId.isBlank()) {
            log.warn("[ASTRA-EVENT] Cannot send incident before device registration completes.");
            return;
        }

        String hostname = configHelper.getHostname();
        String backendUrl = configHelper.getBackendUrl();
        String deviceToken = configHelper.getDeviceToken();

        ThreatEventDto event = ThreatEventDto.builder()
                .deviceId(deviceId)
                .hostname(hostname)
                .timestamp(Instant.now().toString())
                .threatId(threatId)
                .status("ACTIVE")
                .severity("HIGH")
                .metadata(Map.of("user", System.getProperty("user.name"), "details", details != null ? details : ""))
                .build();

        log.info("[ASTRA-EVENT] Reporting Incident: ThreatID={}, DeviceID={}, Hostname={}", threatId, deviceId, hostname);

        // Send to backend via REST
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (deviceToken != null && !deviceToken.isBlank()) {
                headers.set("X-Device-Token", deviceToken);
            }
            HttpEntity<ThreatEventDto> request = new HttpEntity<>(event, headers);

            restTemplate.postForEntity(backendUrl + "/api/v1/agent/incident", request, Map.class);
            log.info("[ASTRA-EVENT] Incident reported to backend successfully ({})", threatId);
        } catch (Exception e) {
            log.warn("[ASTRA-EVENT] Failed to send incident to backend ({}): {}", threatId, e.getMessage());
        }
    }
}
