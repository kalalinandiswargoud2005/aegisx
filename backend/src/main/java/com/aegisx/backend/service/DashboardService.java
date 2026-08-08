package com.aegisx.backend.service;

import com.aegisx.backend.repository.DeviceRepository;
import com.aegisx.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;
    
    public Map<String, Object> getDashboardMetrics() {
        long activeThreats = incidentRepository.count();
        long connectedDevices = deviceRepository.count();
        
        return Map.of(
            "threatLevel", activeThreats > 0 ? "HIGH" : "LOW",
            "activeThreats", activeThreats,
            "connectedDevices", connectedDevices,
            "systemHealth", 98,
            "cpuUsage", 45,
            "ramUsage", 62,
            "storage", 71,
            "uptime", "2d 14h",
            "recoveryStatus", 65
        );
    }
}
