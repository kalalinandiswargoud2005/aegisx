package com.aegisx.agent.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TelemetryDto {
    private String deviceId;
    private long timestamp;
    private double cpuUsage;
    private long ramTotal;
    private long ramUsed;
    private long diskTotal;
    private long diskUsed;
    private long uptime;
    private boolean networkConnected;
    private String activeNetworkAdapter;
    private boolean wifiStatus;
    private boolean bluetoothStatus;
    private String osVersion;
    private String loggedInUser;
    private String agentHealth;
    private String aegisxServiceStatus;
    private int installedSoftwareCount;
    private int runningProcessCount;
    private double batteryStatus;
    private double temperature;
}
