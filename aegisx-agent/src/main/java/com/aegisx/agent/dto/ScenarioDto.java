package com.aegisx.agent.dto;

import lombok.Data;

@Data
public class ScenarioDto {
    private String threatId;
    private String category;
    private String severity;
    private String description;
    private String timeline;
    private String recoverySteps;
    private String aiSummary;
    private String dashboardPayload;
}
