package com.aegisx.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "threats", name = "incidents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // Ransomware, SQL Injection, etc.

    @Column(nullable = false)
    private String severity; // Critical, High, Medium, Low

    @Column(nullable = false)
    private String status; // Active, Blocked, Mitigated, Resolved

    @Column
    private String target; // The affected device name or IP

    @Column
    private String aiExplanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
