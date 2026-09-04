package com.astra.windowsagent.dto;

import java.util.Map;

public class ThreatEventDto {
    private String threatId;
    private String deviceId;
    private String hostname;
    private String details;
    private String status;
    private String severity;
    private Map<String, String> metadata;
    private String timestamp;

    public ThreatEventDto() {}

    public ThreatEventDto(String threatId, String deviceId, String hostname, String details, String status, String severity, Map<String, String> metadata, String timestamp) {
        this.threatId = threatId;
        this.deviceId = deviceId;
        this.hostname = hostname;
        this.details = details;
        this.status = status;
        this.severity = severity;
        this.metadata = metadata;
        this.timestamp = timestamp;
    }

    public static ThreatEventDtoBuilder builder() {
        return new ThreatEventDtoBuilder();
    }

    public static class ThreatEventDtoBuilder {
        private String threatId;
        private String deviceId;
        private String hostname;
        private String details;
        private String status;
        private String severity;
        private Map<String, String> metadata;
        private String timestamp;

        public ThreatEventDtoBuilder threatId(String threatId) { this.threatId = threatId; return this; }
        public ThreatEventDtoBuilder deviceId(String deviceId) { this.deviceId = deviceId; return this; }
        public ThreatEventDtoBuilder hostname(String hostname) { this.hostname = hostname; return this; }
        public ThreatEventDtoBuilder details(String details) { this.details = details; return this; }
        public ThreatEventDtoBuilder status(String status) { this.status = status; return this; }
        public ThreatEventDtoBuilder severity(String severity) { this.severity = severity; return this; }
        public ThreatEventDtoBuilder metadata(Map<String, String> metadata) { this.metadata = metadata; return this; }
        public ThreatEventDtoBuilder timestamp(String timestamp) { this.timestamp = timestamp; return this; }

        public ThreatEventDto build() {
            return new ThreatEventDto(threatId, deviceId, hostname, details, status, severity, metadata, timestamp);
        }
    }

    public String getThreatId() { return threatId; }
    public void setThreatId(String threatId) { this.threatId = threatId; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getHostname() { return hostname; }
    public void setHostname(String hostname) { this.hostname = hostname; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
