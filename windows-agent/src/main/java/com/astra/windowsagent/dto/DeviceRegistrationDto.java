package com.astra.windowsagent.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceRegistrationDto {
    private String deviceId;
    private String hostname;
    private String windowsVersion;
    private String agentVersion;
    private String ipAddress;
    private String macAddress;
    private String status;
}
