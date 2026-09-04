package com.astra.backend.websocket;

import com.astra.backend.entity.Incident;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewThreat(Incident incident) {
        messagingTemplate.convertAndSend("/topic/threats", incident);
        // Also send to timeline as required by Threats.tsx
        messagingTemplate.convertAndSend("/topic/timeline", Map.of(
            "event", "NEW_INCIDENT",
            "incident", incident
        ));
    }

    public void broadcastTelemetry(Object telemetry) {
        messagingTemplate.convertAndSend("/topic/telemetry", telemetry);
    }

    public void broadcastCommandResult(java.util.UUID deviceId, String result) {
        messagingTemplate.convertAndSend("/topic/device/" + deviceId + "/terminal", Map.of("result", result));
    }

    public void broadcastCommandEvent(Object commandEvent) {
        messagingTemplate.convertAndSend("/topic/commands", commandEvent);
    }

    public void broadcastDeviceStatus(Object device) {
        messagingTemplate.convertAndSend("/topic/devices", device);
    }
}
