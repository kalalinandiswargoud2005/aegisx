package com.astra.windowsagent.communication;

import com.astra.windowsagent.dto.ThreatEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventSender {

    @Value("${agent.device-id}")
    private String deviceId;

    @Value("${agent.hostname}")
    private String hostname;
    
    @Value("${astra.backend.url}")
    private String backendUrl;

    // We can use a simple RestTemplate for fallback
    private final RestTemplate restTemplate = new RestTemplate();
    private final com.astra.windowsagent.service.MockHardwareService hardwareService;

    public void sendEvent(String threatId, String details) {
        ThreatEventDto event = ThreatEventDto.builder()
                .deviceId(deviceId)
                .hostname(hostname)
                .timestamp(Instant.now().toString())
                .threatId(threatId)
                .status("ACTIVE")
                .severity("HIGH")
                .metadata(Map.of("user", System.getProperty("user.name"), "details", details))
                .build();
                
        // 1. Hardware Mock Print
        hardwareService.triggerHardwareAlert(threatId, details);

        // 2. Send to backend via REST (Fallback mechanism implemented first for simplicity)
        try {
            restTemplate.postForEntity(backendUrl + "/api/v1/agent/incident", event, Map.class);
            log.info("Sent event to backend: {}", threatId);
        } catch (Exception e) {
            log.error("Failed to send event to backend, caching offline (Not implemented fully): {}", e.getMessage());
        }
    }
}
