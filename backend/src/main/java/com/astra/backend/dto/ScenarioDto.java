package com.astra.backend.dto;

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
    private String attackScript;
    private java.util.List<java.util.Map<String, String>> dynamicRecovery;

    public String getThreatId() { return threatId; }
    public void setThreatId(String threatId) { this.threatId = threatId; }

    public String getThreatName() { return threatName; }
    public void setThreatName(String threatName) { this.threatName = threatName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMitreMapping() { return mitreMapping; }
    public void setMitreMapping(String mitreMapping) { this.mitreMapping = mitreMapping; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBusinessImpact() { return businessImpact; }
    public void setBusinessImpact(String businessImpact) { this.businessImpact = businessImpact; }

    public String getDetectionLogic() { return detectionLogic; }
    public void setDetectionLogic(String detectionLogic) { this.detectionLogic = detectionLogic; }

    public String getDashboardAnimation() { return dashboardAnimation; }
    public void setDashboardAnimation(String dashboardAnimation) { this.dashboardAnimation = dashboardAnimation; }

    public String getImmediateAction() { return immediateAction; }
    public void setImmediateAction(String immediateAction) { this.immediateAction = immediateAction; }

    public String getRecoveryWorkflow() { return recoveryWorkflow; }
    public void setRecoveryWorkflow(String recoveryWorkflow) { this.recoveryWorkflow = recoveryWorkflow; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public String getEstimatedResolutionTime() { return estimatedResolutionTime; }
    public void setEstimatedResolutionTime(String estimatedResolutionTime) { this.estimatedResolutionTime = estimatedResolutionTime; }
}
