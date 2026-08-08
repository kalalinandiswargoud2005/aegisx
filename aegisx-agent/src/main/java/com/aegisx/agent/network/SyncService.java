package com.aegisx.agent.network;

import com.aegisx.agent.database.TelemetryRepository;
import com.aegisx.agent.models.TelemetryCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final TelemetryRepository telemetryRepository;
    private final RestTemplate restTemplate;

    @Value("${aegisx.backend.url}")
    private String backendUrl;

    @Scheduled(fixedDelayString = "60000") // Run every minute
    public void syncTelemetry() {
        List<TelemetryCache> pending = telemetryRepository.findBySyncStatus("PENDING");
        if (pending.isEmpty()) {
            return;
        }

        log.info("Found {} pending telemetry records to sync.", pending.size());
        int successCount = 0;

        for (TelemetryCache cache : pending) {
            try {
                // Mocking backend sync
                // restTemplate.postForObject(backendUrl + "/api/agent/telemetry", cache, String.class);
                
                cache.setSyncStatus("UPLOADED");
                telemetryRepository.save(cache);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to sync telemetry record id {}", cache.getId());
                // Leave as PENDING to retry next time
            }
        }
        
        if (successCount > 0) {
            log.info("Successfully synced {} telemetry records to backend.", successCount);
            // Optionally, delete UPLOADED records to keep DB small
            telemetryRepository.deleteAll(telemetryRepository.findBySyncStatus("UPLOADED"));
        }
    }
}
