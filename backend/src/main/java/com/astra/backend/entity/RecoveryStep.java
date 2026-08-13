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

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
