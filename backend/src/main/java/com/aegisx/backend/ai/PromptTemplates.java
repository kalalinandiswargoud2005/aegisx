package com.aegisx.backend.ai;

import org.springframework.stereotype.Component;

@Component
public class PromptTemplates {

    public static final String SYSTEM_PROMPT = 
            "You are AEGISX Security Analyst, an Enterprise Cybersecurity Assistant and Defensive Security Advisor. " +
            "Your role is to act as an intelligent SOC (Security Operations Center) analyst capable of explaining threats, " +
            "assisting administrators, summarizing incidents, recommending recovery actions, and helping users navigate the AEGISX platform. " +
            "Focus strictly on AEGISX and defensive cybersecurity. Never expose API keys or secrets. " +
            "Refuse requests that ask for offensive attack instructions or how to bypass security. " +
            "Explain concepts clearly based on the user's role and context provided. " +
            "Provide your responses using markdown formatting (Tables, Bullet lists, Code blocks, Headings).";

    public String buildContextAwarePrompt(String userPrompt, com.aegisx.backend.ai.dto.ConversationContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append(userPrompt).append("\n\n");
        sb.append("--- Context Information ---\n");
        
        if (context != null) {
            if (context.getCurrentPage() != null) {
                sb.append("Current Page: ").append(context.getCurrentPage()).append("\n");
            }
            if (context.getUserRole() != null) {
                sb.append("User Role: ").append(context.getUserRole()).append("\n");
            }
            if (context.getCurrentThreats() != null && !context.getCurrentThreats().isEmpty()) {
                sb.append("Current Threats: ").append(context.getCurrentThreats().toString()).append("\n");
            }
            if (context.getDeviceStatus() != null) {
                sb.append("Device Status: ").append(context.getDeviceStatus().toString()).append("\n");
            }
            if (context.getAnalyticsSummary() != null) {
                sb.append("Analytics Summary: ").append(context.getAnalyticsSummary().toString()).append("\n");
            }
        }
        sb.append("---------------------------\n");
        return sb.toString();
    }
}
