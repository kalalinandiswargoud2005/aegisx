package com.astra.windowsagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartbeatDto {
    private String deviceId;
    private String hostname;
    private String agentVersion;
    private String os;
    private String username;
    private String ipAddress;
    private String status; // ONLINE, OFFLINE, DEGRADED
    private String serviceStatus; // RUNNING
    private String companionStatus; // CONNECTED, DISCONNECTED
    private String overlayStatus; // AVAILABLE, UNAVAILABLE
    private double cpuUsage;
    private double ramUsage;
    private String timestamp;
    private String lastCommandId;
    private String lastCommandStatus;
}
