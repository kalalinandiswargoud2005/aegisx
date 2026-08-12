package com.aegisx.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "threats", name = "device_commands")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceCommand {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_id", nullable = false)
    private UUID deviceId;

    @Column(name = "incident_id")
    private UUID incidentId;

    @Column(name = "command_type", nullable = false)
    private String commandType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String parameters;

    @Column
    private String status;

    @Column(columnDefinition = "TEXT")
    private String result;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
