package com.aegisx.backend.entity;

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
}
