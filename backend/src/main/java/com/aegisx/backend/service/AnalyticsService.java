package com.aegisx.backend.service;

import com.aegisx.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final IncidentRepository incidentRepository;

    public Map<String, Object> getAnalytics() {
        long totalThreats = incidentRepository.count();
        long blockedThreats = incidentRepository.countByStatus("Blocked");
        long resolved = incidentRepository.countByStatus("Resolved");
        long recoverySuccess = 100; // Simulated percentage if there are resolved threats

        return Map.of(
            "totalThreats", totalThreats,
            "blockedThreats", blockedThreats,
            "resolved", resolved,
            "recoverySuccess", resolved > 0 ? recoverySuccess : 0,
            "barData", List.of(
                Map.of("name", "Mon", "threats", Math.max(10, totalThreats / 7), "mitigated", blockedThreats / 7),
                Map.of("name", "Tue", "threats", Math.max(15, totalThreats / 5), "mitigated", blockedThreats / 5),
                Map.of("name", "Wed", "threats", Math.max(20, totalThreats / 3), "mitigated", blockedThreats / 4),
                Map.of("name", "Thu", "threats", totalThreats, "mitigated", blockedThreats)
            ),
            "pieData", List.of(
                Map.of("name", "Malware", "value", totalThreats > 0 ? totalThreats : 100),
                Map.of("name", "Phishing", "value", 50),
                Map.of("name", "Intrusion", "value", 20)
            )
        );
    }
}
