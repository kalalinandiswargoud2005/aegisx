package com.astra.windowsagent.controller;

import com.astra.windowsagent.dto.AstraOverlayEvent;
import com.astra.windowsagent.service.OverlayIpcService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/agent/ipc")
@RequiredArgsConstructor
public class OverlayIpcController {

    private final OverlayIpcService ipcService;

    @GetMapping(value = "/overlay-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOverlayEvents() {
        return ipcService.registerClient();
    }

    @PostMapping("/trigger-event")
    public ResponseEntity<Map<String, Object>> triggerEvent(@RequestBody AstraOverlayEvent event) {
        ipcService.publishEvent(event);
        return ResponseEntity.ok(Map.of("status", "dispatched", "clients", ipcService.hasActiveClients()));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "service", "ASTRA_EDR_WINDOWS_SERVICE",
                "status", "RUNNING",
                "overlayClientsConnected", ipcService.hasActiveClients()
        ));
    }
}
