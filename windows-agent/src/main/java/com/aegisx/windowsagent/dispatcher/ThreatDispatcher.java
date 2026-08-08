package com.aegisx.windowsagent.dispatcher;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Component
public class ThreatDispatcher {
    
    private Map<String, String> threatMapping = new HashMap<>();
    private final com.aegisx.windowsagent.communication.EventSender eventSender;

    public ThreatDispatcher(com.aegisx.windowsagent.communication.EventSender eventSender) {
        this.eventSender = eventSender;
    }

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("threat-mapping.json").getInputStream();
            threatMapping = mapper.readValue(is, new TypeReference<Map<String, String>>(){});
            log.info("Loaded {} threat mappings.", threatMapping.size());
        } catch (Exception e) {
            log.error("Failed to load threat-mapping.json", e);
        }
    }

    public void dispatch(String monitorEvent, String details) {
        String threatId = threatMapping.get(monitorEvent);
        if (threatId != null) {
            log.warn("Dispatched Threat: {} -> {}", monitorEvent, threatId);
            eventSender.sendEvent(threatId, details);
        } else {
            log.debug("Unmapped monitor event: {}", monitorEvent);
        }
    }
}
