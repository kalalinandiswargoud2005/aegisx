package com.aegisx.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ThreatCatalogDto {
    private UUID id;
    private String threatId;
    private String threatName;
    private String category;
    private String severity;
    private String description;
    private String howAttackHappens;
    private String detectionMethod;
    private String immediateAction;
    private String recoveryStep1;
    private String recoveryStep2;
    private String recoveryStep3;
    private String recoveryStep4;
    private String recoveryStep5;
}
