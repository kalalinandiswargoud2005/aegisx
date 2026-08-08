package com.aegisx.backend.ai;

import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {
    
    public String buildIncidentPrompt(String incidentType, String severity) {
        return String.format("Analyze this %s incident with severity %s.", incidentType, severity);
    }
}
