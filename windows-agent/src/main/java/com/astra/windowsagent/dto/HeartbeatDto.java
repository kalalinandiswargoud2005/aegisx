package com.astra.windowsagent.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeartbeatDto {
    private String deviceId;
    private String status;
    private double cpuUsage;
    private double ramUsage;
    private String timestamp;
}
