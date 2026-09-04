package com.astra.windowsagent.dispatcher;

import com.astra.windowsagent.communication.EventSender;
import com.astra.windowsagent.service.AstraEnforcerOverlay;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@Getter
@Setter
public class ThreatDispatcher {

    private Map<String, String> threatMapping = new HashMap<>();
    private final EventSender eventSender;
    private final AstraEnforcerOverlay overlay;

    @Value("${agent.monitors.auto-dispatch:true}")
    private boolean autoDispatchMonitors = true;

    @Value("${agent.monitors.dedup-window-ms:5000}")
    private long dedupWindowMs = 5000L;

    // Deduplication cache: eventKey -> lastDispatchedTimestamp
    private final Map<String, Long> lastDispatchedCache = new ConcurrentHashMap<>();

    public ThreatDispatcher(EventSender eventSender, AstraEnforcerOverlay overlay) {
        this.eventSender = eventSender;
        this.overlay = overlay;
    }

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("threat-mapping.json").getInputStream();
            threatMapping = mapper.readValue(is, new TypeReference<Map<String, String>>() {});
            log.info("[THREAT-DISPATCHER] Initialized {} threat mappings. Auto-dispatch: {}, Dedup Window: {}ms",
                    threatMapping.size(), autoDispatchMonitors, dedupWindowMs);
        } catch (Exception e) {
            log.error("[THREAT-DISPATCHER] Failed to load threat-mapping.json", e);
        }
    }

    public void dispatch(String monitorEvent, String details) {
        if (monitorEvent == null || monitorEvent.isBlank()) return;

        long now = System.currentTimeMillis();
        Long lastTime = lastDispatchedCache.get(monitorEvent);

        // Deduplication check: drop duplicate events within dedupWindowMs
        if (lastTime != null && (now - lastTime) < dedupWindowMs) {
            log.debug("[THREAT-DEDUP] Suppressing duplicate event: {} (within {}ms)", monitorEvent, dedupWindowMs);
            return;
        }

        lastDispatchedCache.put(monitorEvent, now);

        String threatId = threatMapping.get(monitorEvent);
        if (threatId == null) {
            threatId = "THREAT-GENERIC";
        }

        log.warn("[THREAT-DISPATCH] Active Threat Triggered: {} -> ThreatID: {}", monitorEvent, threatId);

        // 1. Immediately trigger target laptop visual threat notification
        overlay.showThreatAlert(monitorEvent, threatId, "HIGH");

        // 2. Report incident event to backend C2
        eventSender.sendEvent(threatId, details);
    }
}
