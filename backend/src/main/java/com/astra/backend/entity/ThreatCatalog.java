package com.astra.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "threat_catalog", schema = "threats")
public class ThreatCatalog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "threat_id", unique = true, nullable = false)
    private String threatId;

    @Column(name = "threat_name", nullable = false)
    private String threatName;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "how_attack_happens", columnDefinition = "TEXT")
    private String howAttackHappens;

    @Column(name = "detection_method", columnDefinition = "TEXT")
    private String detectionMethod;

    @Column(name = "immediate_action", columnDefinition = "TEXT")
    private String immediateAction;

    @Column(name = "recovery_step_1", columnDefinition = "TEXT")
    private String recoveryStep1;

    @Column(name = "recovery_step_2", columnDefinition = "TEXT")
    private String recoveryStep2;

    @Column(name = "recovery_step_3", columnDefinition = "TEXT")
    private String recoveryStep3;

    @Column(name = "recovery_step_4", columnDefinition = "TEXT")
    private String recoveryStep4;

    @Column(name = "recovery_step_5", columnDefinition = "TEXT")
    private String recoveryStep5;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getThreatId() { return threatId; }
    public void setThreatId(String threatId) { this.threatId = threatId; }

    public String getThreatName() { return threatName; }
    public void setThreatName(String threatName) { this.threatName = threatName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHowAttackHappens() { return howAttackHappens; }
    public void setHowAttackHappens(String howAttackHappens) { this.howAttackHappens = howAttackHappens; }

    public String getDetectionMethod() { return detectionMethod; }
    public void setDetectionMethod(String detectionMethod) { this.detectionMethod = detectionMethod; }

    public String getImmediateAction() { return immediateAction; }
    public void setImmediateAction(String immediateAction) { this.immediateAction = immediateAction; }

    public String getRecoveryStep1() { return recoveryStep1; }
    public void setRecoveryStep1(String recoveryStep1) { this.recoveryStep1 = recoveryStep1; }

    public String getRecoveryStep2() { return recoveryStep2; }
    public void setRecoveryStep2(String recoveryStep2) { this.recoveryStep2 = recoveryStep2; }

    public String getRecoveryStep3() { return recoveryStep3; }
    public void setRecoveryStep3(String recoveryStep3) { this.recoveryStep3 = recoveryStep3; }

    public String getRecoveryStep4() { return recoveryStep4; }
    public void setRecoveryStep4(String recoveryStep4) { this.recoveryStep4 = recoveryStep4; }

    public String getRecoveryStep5() { return recoveryStep5; }
    public void setRecoveryStep5(String recoveryStep5) { this.recoveryStep5 = recoveryStep5; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
