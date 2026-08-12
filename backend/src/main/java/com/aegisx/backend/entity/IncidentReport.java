package com.aegisx.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "reports", name = "incident_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "report_content", columnDefinition = "jsonb", nullable = false)
    private String reportContent;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
