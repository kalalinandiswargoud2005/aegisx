package com.astra.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationContext {
    private String currentPage;
    private String userRole;
    private Object deviceStatus; // Can be a map or detailed object
    private List<Object> currentThreats;
    private Object analyticsSummary;

    public String getCurrentPage() { return currentPage; }
    public void setCurrentPage(String currentPage) { this.currentPage = currentPage; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public Object getDeviceStatus() { return deviceStatus; }
    public void setDeviceStatus(Object deviceStatus) { this.deviceStatus = deviceStatus; }

    public List<Object> getCurrentThreats() { return currentThreats; }
    public void setCurrentThreats(List<Object> currentThreats) { this.currentThreats = currentThreats; }

    public Object getAnalyticsSummary() { return analyticsSummary; }
    public void setAnalyticsSummary(Object analyticsSummary) { this.analyticsSummary = analyticsSummary; }
}
