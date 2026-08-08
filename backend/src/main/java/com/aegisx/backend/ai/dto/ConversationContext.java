package com.aegisx.backend.ai.dto;

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
}
