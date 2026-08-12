package com.aegisx.windowsagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceCommandDto {
    private UUID id;
    private String deviceId;
    private String commandType;
    private String target;
    private String parameters;
    private String status;
}
