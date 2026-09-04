package com.astra.backend.controller;

import com.astra.backend.dto.TelemetryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
@Slf4j
public class TelemetryController {

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/{deviceId}")
    public void receiveTelemetry(@PathVariable String deviceId, @RequestBody TelemetryDto telemetry) {
        telemetry.setDeviceId(deviceId);
        // Broadcast to WebSocket topic specific to this device
        messagingTemplate.convertAndSend("/topic/telemetry/" + deviceId, telemetry);
        // Also broadcast to a general topic if needed by the dashboard
        messagingTemplate.convertAndSend("/topic/telemetry", telemetry);
    }
}
