package com.astra.windowsagent.dto;

import java.util.UUID;

public class DeviceCommandDto {
    private UUID id;
    private UUID incidentId;
    private String deviceId;
    private String commandType;
    private String target;
    private String parameters;
    private String status;

    public DeviceCommandDto() {}

    public DeviceCommandDto(UUID id, UUID incidentId, String deviceId, String commandType, String target, String parameters, String status) {
        this.id = id;
        this.incidentId = incidentId;
        this.deviceId = deviceId;
        this.commandType = commandType;
        this.target = target;
        this.parameters = parameters;
        this.status = status;
    }

    public static DeviceCommandDtoBuilder builder() {
        return new DeviceCommandDtoBuilder();
    }

    public static class DeviceCommandDtoBuilder {
        private UUID id;
        private UUID incidentId;
        private String deviceId;
        private String commandType;
        private String target;
        private String parameters;
        private String status;

        public DeviceCommandDtoBuilder id(UUID id) { this.id = id; return this; }
        public DeviceCommandDtoBuilder incidentId(UUID incidentId) { this.incidentId = incidentId; return this; }
        public DeviceCommandDtoBuilder deviceId(String deviceId) { this.deviceId = deviceId; return this; }
        public DeviceCommandDtoBuilder commandType(String commandType) { this.commandType = commandType; return this; }
        public DeviceCommandDtoBuilder target(String target) { this.target = target; return this; }
        public DeviceCommandDtoBuilder parameters(String parameters) { this.parameters = parameters; return this; }
        public DeviceCommandDtoBuilder status(String status) { this.status = status; return this; }

        public DeviceCommandDto build() {
            return new DeviceCommandDto(id, incidentId, deviceId, commandType, target, parameters, status);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getCommandType() { return commandType; }
    public void setCommandType(String commandType) { this.commandType = commandType; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
