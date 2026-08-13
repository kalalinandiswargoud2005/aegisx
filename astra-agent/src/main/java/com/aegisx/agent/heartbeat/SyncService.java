package com.astra.agent.heartbeat;

import com.astra.agent.collector.TelemetryCollector;
import com.astra.agent.registration.RegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final TelemetryCollector telemetryCollector;
    private final RegistrationService registrationService;
    private final RestTemplate restTemplate;

    @Value("${astra.backend.url}")
    private String backendUrl;

    @Scheduled(fixedRateString = "${astra.agent.sync.rate:10000}")
    public void syncTelemetry() {
        if (registrationService.getDeviceId() == null) {
            log.debug("Device ID not initialized yet. Skipping sync.");
            return;
        }

        try {
            var telemetry = telemetryCollector.collectTelemetry();
            telemetry.setDeviceId(registrationService.getDeviceId());
            
            restTemplate.postForObject(backendUrl + "/api/v1/agent/telemetry", telemetry, String.class);
            log.debug("Telemetry synced successfully for device: {}", telemetry.getDeviceId());
        } catch (Exception e) {
            log.error("Failed to sync telemetry", e);
        }
    }
}
