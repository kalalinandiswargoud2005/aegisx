package com.astra.agent.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "telemetry_cache")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId;
    private long timestamp;
    private double cpuUsage;
    private long ramTotal;
    private long ramUsed;
    private long diskTotal;
    private long diskUsed;
    private long uptime;
    private boolean networkConnected;
    private String activeNetworkAdapter;
    private boolean wifiStatus;
    private boolean bluetoothStatus;
    private String osVersion;
    private String loggedInUser;
    private String agentHealth;
    private String astraServiceStatus;
    private int installedSoftwareCount;
    private int runningProcessCount;
    private double batteryStatus;
    private double temperature;
    
    // Status flag: PENDING, UPLOADED, FAILED
    @Column(length = 20)
    @Builder.Default
    private String syncStatus = "PENDING";
}
