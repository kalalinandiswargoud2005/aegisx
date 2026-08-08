package com.aegisx.backend.entity;

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
}
