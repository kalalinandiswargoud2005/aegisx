package com.astra.backend.service;

import com.astra.backend.entity.Incident;
import com.astra.backend.repository.DeviceCommandRepository;
import com.astra.backend.repository.IncidentRepository;
import com.astra.backend.repository.RecoveryStepRepository;
import com.astra.backend.websocket.WebSocketPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ThreatService {

    private final IncidentRepository incidentRepository;
    private final RecoveryStepRepository recoveryStepRepository;
    private final DeviceCommandRepository deviceCommandRepository;
    private final WebSocketPublisher webSocketPublisher;

    public List<Incident> getActiveThreats() {
        return incidentRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }
    
    public List<Incident> getResolvedThreats() {
        return incidentRepository.findByStatusOrderByCreatedAtDesc("RESOLVED");
    }
    
    public void resolveThreat(UUID id) {
        incidentRepository.findById(id).ifPresent(incident -> {
            incident.setStatus("RESOLVED");
            incident.setResolvedAt(LocalDateTime.now());
            incidentRepository.save(incident);
        });
    }

    @Transactional
    public void clearAllThreats() {
        log.info("[THREAT-SERVICE] Purging all incidents, recovery steps, and commands queue...");
        try {
            recoveryStepRepository.deleteAll();
            deviceCommandRepository.deleteAll();
            incidentRepository.deleteAll();
            
            // Broadcast clear notification
            webSocketPublisher.broadcastTelemetry(Map.of("event", "ALL_THREATS_CLEARED", "timestamp", LocalDateTime.now().toString()));
            log.info("[THREAT-SERVICE] All threat records purged successfully.");
        } catch (Exception e) {
            log.error("[THREAT-SERVICE] Error clearing threats: {}", e.getMessage(), e);
        }
    }
}

