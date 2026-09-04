package com.astra.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(schema = "recovery", name = "steps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String incidentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer stepOrder;

    @Column(nullable = false)
    private String status; // Pending, In Progress, Completed

    @Column(length = 2048)
    private String script;

    @Column(name = "verification_status")
    private String verificationStatus; // UNVERIFIED, VERIFYING, VERIFIED, FAILED

    @Column(name = "verification_message", columnDefinition = "TEXT")
    private String verificationMessage;

    @Column(name = "started_at")
    private java.time.LocalDateTime startedAt;

    @Column(name = "completed_at")
    private java.time.LocalDateTime completedAt;

    @Column(name = "sequence_number")
    private Integer sequenceNumber;
}
