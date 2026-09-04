package com.astra.windowsagent.service;

import com.astra.windowsagent.config.AgentConfigHelper;
import com.astra.windowsagent.dto.TelemetryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.hardware.Sensors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HardwareTelemetryService {

    private final AgentConfigHelper configHelper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final SystemInfo systemInfo = new SystemInfo();
    
    private long[] prevTicks = new long[CentralProcessor.TickType.values().length];

    @Scheduled(fixedRate = 5000)
    public void sendTelemetry() {
        String generatedDeviceId = configHelper.getDeviceId();
        if (generatedDeviceId == null || generatedDeviceId.isBlank()) {
            return;
        }

        try {
            HardwareAbstractionLayer hal = systemInfo.getHardware();
            CentralProcessor processor = hal.getProcessor();
            GlobalMemory memory = hal.getMemory();
            Sensors sensors = hal.getSensors();

            // CPU Usage
            double cpuUsage = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100;
            prevTicks = processor.getSystemCpuLoadTicks();

            // RAM Usage
            long availableRam = memory.getAvailable();
            long totalRam = memory.getTotal();
            double ramUsagePercent = ((double) (totalRam - availableRam) / totalRam) * 100;

            // Temperature
            double temperature = sensors.getCpuTemperature();

            TelemetryDto telemetry = TelemetryDto.builder()
                    .deviceId(generatedDeviceId)
                    .cpuUsage(Math.round(cpuUsage * 10.0) / 10.0)
                    .ramUsage(Math.round(ramUsagePercent * 10.0) / 10.0)
                    .temperature(Math.round(temperature * 10.0) / 10.0)
                    .timestamp(System.currentTimeMillis())
                    .build();

            String backendUrl = configHelper.getBackendUrl();
            String deviceToken = configHelper.getDeviceToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (deviceToken != null && !deviceToken.isBlank()) {
                headers.set("X-Device-Token", deviceToken);
            }
            HttpEntity<TelemetryDto> request = new HttpEntity<>(telemetry, headers);

            restTemplate.postForObject(backendUrl + "/api/v1/telemetry/" + generatedDeviceId, request, Void.class);
            log.trace("Sent telemetry for device {}: CPU {}% RAM {}%", 
                      generatedDeviceId, telemetry.getCpuUsage(), telemetry.getRamUsage());

        } catch (Exception e) {
            log.debug("Telemetry dispatch error: {}", e.getMessage());
        }
    }
}
