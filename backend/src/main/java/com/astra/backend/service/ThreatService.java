package com.astra.backend.service;

import com.astra.backend.entity.Incident;
import com.astra.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ThreatService {

    private final IncidentRepository incidentRepository;

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
}

