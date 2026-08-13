package com.astra.windowsagent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class HeartbeatService {
    @Value("${astra.backend.url}")
    private String backendUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        try {
            restTemplate.postForEntity(backendUrl + "/api/v1/agent/heartbeat", null, String.class);
            log.debug("Heartbeat sent.");
        } catch (Exception e) {
            log.debug("Heartbeat failed: {}", e.getMessage());
        }
    }
}
