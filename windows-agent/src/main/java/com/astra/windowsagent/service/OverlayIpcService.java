package com.astra.windowsagent.service;

import com.astra.windowsagent.dto.AstraOverlayEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class OverlayIpcService {

    private final List<SseEmitter> activeEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter registerClient() {
        // Create emitter with no timeout (or high timeout like 1 day)
        SseEmitter emitter = new SseEmitter(86400000L);
        activeEmitters.add(emitter);
        log.info("Registered new user session overlay client. Total active clients: {}", activeEmitters.size());

        emitter.onCompletion(() -> {
            activeEmitters.remove(emitter);
            log.info("User session overlay client completed. Remaining: {}", activeEmitters.size());
        });

        emitter.onTimeout(() -> {
            activeEmitters.remove(emitter);
            log.info("User session overlay client timed out. Remaining: {}", activeEmitters.size());
        });

        emitter.onError(e -> {
            activeEmitters.remove(emitter);
            log.debug("User session overlay client disconnected: {}", e.getMessage());
        });

        // Send an initial handshake ping event
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("ASTRA_EDR_SERVICE_ONLINE"));
        } catch (IOException e) {
            activeEmitters.remove(emitter);
        }

        return emitter;
    }

    public void publishEvent(AstraOverlayEvent event) {
        event.setTimestamp(System.currentTimeMillis());
        log.info("Publishing IPC overlay event to {} user session client(s): type={}, command={}", 
                activeEmitters.size(), event.getType(), event.getCommandType());

        for (SseEmitter emitter : activeEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("OVERLAY_EVENT")
                        .data(event));
            } catch (Exception e) {
                log.debug("Removing disconnected overlay emitter");
                activeEmitters.remove(emitter);
            }
        }
    }

    public boolean hasActiveClients() {
        return !activeEmitters.isEmpty();
    }
}
