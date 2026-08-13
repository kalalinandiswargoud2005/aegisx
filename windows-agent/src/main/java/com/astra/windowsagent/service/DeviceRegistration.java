package com.astra.windowsagent.service;

import com.astra.windowsagent.dto.DeviceRegistrationDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.UUID;

@Slf4j
@Service
public class DeviceRegistration {
    @Value("${astra.backend.url}")
    private String backendUrl;
    
    @Value("${agent.device-id}")
    private String deviceId;
    
    @Value("${agent.hostname}")
    private String hostname;
    
    @Value("${agent.version}")
    private String version;

    private final RestTemplate restTemplate = new RestTemplate();

    @EventListener(ApplicationReadyEvent.class)
    public void registerDevice() {
        DeviceRegistrationDto dto = DeviceRegistrationDto.builder()
                .deviceId(UUID.nameUUIDFromBytes(deviceId.getBytes()).toString())
                .hostname(hostname)
                .windowsVersion(System.getProperty("os.name"))
                .agentVersion(version)
                .ipAddress("127.0.0.1")
                .macAddress("00:00:00:00:00:00")
                .status("Online")
                .build();
                
        try {
            restTemplate.postForEntity(backendUrl + "/api/v1/agent/register", dto, Object.class);
            log.info("Successfully registered device with ASTRA Backend.");
        } catch (Exception e) {
            log.error("Failed to register device: {}", e.getMessage());
        }
    }
}
