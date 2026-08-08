package com.aegisx.windowsagent.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ThreatEventDto {
    private String deviceId;
    private String hostname;
    private String timestamp;
    private String threatId;
    private String status;
    private String severity;
    private Map<String, String> metadata;
}
