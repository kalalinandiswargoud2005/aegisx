package com.astra.backend.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryDto {
    private String deviceId;
    private double cpuUsage;
    private double ramUsage;
    private double temperature;
    private long timestamp;
}
