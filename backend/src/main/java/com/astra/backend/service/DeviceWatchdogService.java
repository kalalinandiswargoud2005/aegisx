package com.astra.backend.service;

import com.astra.backend.entity.Device;
import com.astra.backend.repository.DeviceRepository;
import com.astra.backend.websocket.WebSocketPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceWatchdogService {

    private final DeviceRepository deviceRepository;
    private final WebSocketPublisher webSocketPublisher;

    @Scheduled(fixedRate = 5000) // Check device heartbeat liveness every 5 seconds
    public void monitorDeviceLiveness() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(60);
        List<Device> onlineDevices = deviceRepository.findAll();

        for (Device device : onlineDevices) {
            LocalDateTime last = device.getLastHeartbeat() != null ? device.getLastHeartbeat() : device.getLastSeen();
            if (last != null && last.isBefore(threshold)) {
                if (!"OFFLINE".equalsIgnoreCase(device.getStatus())) {
                    device.setStatus("OFFLINE");
                    device.setHealth("POOR");
                    device.setCompanionStatus("DISCONNECTED");
                    device.setOverlayStatus("UNAVAILABLE");
                    deviceRepository.save(device);
                    log.warn("[WATCHDOG] Device {} ({}) marked OFFLINE due to missed heartbeat (last: {})", 
                            device.getName(), device.getId(), last);
                    webSocketPublisher.broadcastDeviceStatus(device);
                }
            }
        }
    }
}
