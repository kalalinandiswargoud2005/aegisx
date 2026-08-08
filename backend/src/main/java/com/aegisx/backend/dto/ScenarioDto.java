package com.aegisx.backend.dto;

import lombok.Data;

@Data
public class ScenarioDto {
    private String threatId;
    private String threatName;
    private String category;
    private String mitreMapping;
    private String severity;
    private String description;
    private String businessImpact;
    private String detectionLogic;
    private String dashboardAnimation;
    private String immediateAction;
    private String recoveryWorkflow;
    private String aiSummary;
    private String estimatedResolutionTime;
}

