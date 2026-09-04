package com.astra.windowsagent.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AstraOverlayEvent {
    public enum EventType {
        THREAT_ALERT,
        SHOW_MATRIX_OVERLAY,
        CLEAR_MATRIX,
        WALLPAPER_HIJACK_SIMULATION,
        GHOST_TYPER_SIMULATION,
        IMMEDIATE_CONTAINMENT,
        RECOVERY_STEP,
        FINAL_RESOLUTION,
        SAFE_TEST_ENFORCEMENT,
        ENFORCEMENT,
        MATRIX_SHOW,
        MATRIX_HIDE,
        HEARTBEAT,
        ACK
    }

    private EventType type;
    private String eventId;
    private String incidentId;
    private String deviceId;
    private String threatType;
    private String severity;
    private String title;
    private String commandType;
    private String target;
    private String details;
    private String message;
    private String status;
    private Integer stepNumber;
    private Integer totalSteps;
    private long timestamp;

    public AstraOverlayEvent() {
        this.timestamp = System.currentTimeMillis();
    }

    public AstraOverlayEvent(EventType type, String eventId, String incidentId, String deviceId,
                             String threatType, String severity, String title, String commandType,
                             String target, String details, String message, String status,
                             Integer stepNumber, Integer totalSteps, long timestamp) {
        this.type = type;
        this.eventId = eventId;
        this.incidentId = incidentId;
        this.deviceId = deviceId;
        this.threatType = threatType;
        this.severity = severity;
        this.title = title;
        this.commandType = commandType;
        this.target = target;
        this.details = details;
        this.message = message;
        this.status = status;
        this.stepNumber = stepNumber;
        this.totalSteps = totalSteps;
        this.timestamp = timestamp != 0 ? timestamp : System.currentTimeMillis();
    }

    public static AstraOverlayEventBuilder builder() {
        return new AstraOverlayEventBuilder();
    }

    public static class AstraOverlayEventBuilder {
        private EventType type;
        private String eventId;
        private String incidentId;
        private String deviceId;
        private String threatType;
        private String severity;
        private String title;
        private String commandType;
        private String target;
        private String details;
        private String message;
        private String status;
        private Integer stepNumber;
        private Integer totalSteps;
        private long timestamp = System.currentTimeMillis();

        public AstraOverlayEventBuilder type(EventType type) { this.type = type; return this; }
        public AstraOverlayEventBuilder eventId(String eventId) { this.eventId = eventId; return this; }
        public AstraOverlayEventBuilder incidentId(String incidentId) { this.incidentId = incidentId; return this; }
        public AstraOverlayEventBuilder deviceId(String deviceId) { this.deviceId = deviceId; return this; }
        public AstraOverlayEventBuilder threatType(String threatType) { this.threatType = threatType; return this; }
        public AstraOverlayEventBuilder severity(String severity) { this.severity = severity; return this; }
        public AstraOverlayEventBuilder title(String title) { this.title = title; return this; }
        public AstraOverlayEventBuilder commandType(String commandType) { this.commandType = commandType; return this; }
        public AstraOverlayEventBuilder target(String target) { this.target = target; return this; }
        public AstraOverlayEventBuilder details(String details) { this.details = details; return this; }
        public AstraOverlayEventBuilder message(String message) { this.message = message; return this; }
        public AstraOverlayEventBuilder status(String status) { this.status = status; return this; }
        public AstraOverlayEventBuilder stepNumber(Integer stepNumber) { this.stepNumber = stepNumber; return this; }
        public AstraOverlayEventBuilder totalSteps(Integer totalSteps) { this.totalSteps = totalSteps; return this; }
        public AstraOverlayEventBuilder timestamp(long timestamp) { this.timestamp = timestamp; return this; }

        public AstraOverlayEvent build() {
            return new AstraOverlayEvent(type, eventId, incidentId, deviceId, threatType, severity,
                    title, commandType, target, details, message, status, stepNumber, totalSteps, timestamp);
        }
    }

    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getThreatType() { return threatType; }
    public void setThreatType(String threatType) { this.threatType = threatType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCommandType() { return commandType; }
    public void setCommandType(String commandType) { this.commandType = commandType; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public Integer getTotalSteps() { return totalSteps; }
    public void setTotalSteps(Integer totalSteps) { this.totalSteps = totalSteps; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
