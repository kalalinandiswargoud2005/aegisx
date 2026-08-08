package com.aegisx.backend.websocket;

import com.aegisx.backend.entity.Incident;
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
}
