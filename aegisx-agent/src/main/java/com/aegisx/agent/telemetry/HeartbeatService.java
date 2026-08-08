package com.aegisx.agent.telemetry;

import com.aegisx.agent.collector.TelemetryCollector;
import com.aegisx.agent.dto.TelemetryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeartbeatService {

    private final TelemetryCollector telemetryCollector;
    private final com.aegisx.agent.database.TelemetryRepository telemetryRepository;

    @Scheduled(fixedRateString = "${aegisx.agent.heartbeat-interval:30000}")
    public void sendHeartbeat() {
        try {
            log.debug("Collecting telemetry for heartbeat...");
            TelemetryDto telemetry = telemetryCollector.collectTelemetry();
            
            // Save to SQLite
            com.aegisx.agent.models.TelemetryCache cacheEntity = com.aegisx.agent.models.TelemetryCache.builder()
                    .deviceId(telemetry.getDeviceId())
                    .timestamp(telemetry.getTimestamp())
                    .cpuUsage(telemetry.getCpuUsage())
                    .ramTotal(telemetry.getRamTotal())
                    .ramUsed(telemetry.getRamUsed())
                    .diskTotal(telemetry.getDiskTotal())
                    .diskUsed(telemetry.getDiskUsed())
                    .uptime(telemetry.getUptime())
                    .networkConnected(telemetry.isNetworkConnected())
                    .activeNetworkAdapter(telemetry.getActiveNetworkAdapter())
                    .wifiStatus(telemetry.isWifiStatus())
                    .bluetoothStatus(telemetry.isBluetoothStatus())
                    .osVersion(telemetry.getOsVersion())
                    .loggedInUser(telemetry.getLoggedInUser())
                    .agentHealth(telemetry.getAgentHealth())
                    .aegisxServiceStatus(telemetry.getAegisxServiceStatus())
                    .installedSoftwareCount(telemetry.getInstalledSoftwareCount())
                    .runningProcessCount(telemetry.getRunningProcessCount())
                    .batteryStatus(telemetry.getBatteryStatus())
                    .temperature(telemetry.getTemperature())
                    .syncStatus("PENDING")
                    .build();
            telemetryRepository.save(cacheEntity);
            
            log.info("Heartbeat telemetry cached to SQLite. CPU {}%, RAM Used {}MB", 
                     String.format("%.2f", telemetry.getCpuUsage()), 
                     telemetry.getRamUsed() / (1024 * 1024));
                     
        } catch (Exception e) {
            log.error("Failed to collect and cache telemetry", e);
        }
    }
}
