package com.astra.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "devices", name = "registered_devices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // Windows Agent, Raspberry Pi

    @Column(name = "os_version")
    private String os;

    @Column
    private String ipAddress;

    @Column
    private String status; // Online, Offline

    @Column
    private String agentVersion;

    @Column
    private String health; // Healthy, Warning, Critical

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "ram_usage")
    private Double ramUsage;

    @Column(name = "username")
    private String username;

    @Column(name = "last_heartbeat")
    private LocalDateTime lastHeartbeat;

    @Column(name = "companion_status")
    private String companionStatus;

    @Column(name = "overlay_status")
    private String overlayStatus;

    @Column(name = "hardware_id")
    private String hardwareId;

    @Column(name = "device_token")
    private String deviceToken;

    @Column(name = "hostname")
    private String hostname;

    @Column(name = "mac_address")
    private String macAddress;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastSeen = LocalDateTime.now();
        if (status == null) status = "ONLINE";
        if (deviceToken == null || deviceToken.isBlank()) {
            deviceToken = "ast_" + UUID.randomUUID().toString().replace("-", "");
        }
    }
}
