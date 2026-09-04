package com.astra.windowsagent.dto;

public class TelemetryDto {
    private String deviceId;
    private double cpuUsage;
    private double ramUsage;
    private double storageUsage;
    private double temperature;
    private long timestamp;

    public TelemetryDto() {}

    public TelemetryDto(String deviceId, double cpuUsage, double ramUsage, double storageUsage, double temperature, long timestamp) {
        this.deviceId = deviceId;
        this.cpuUsage = cpuUsage;
        this.ramUsage = ramUsage;
        this.storageUsage = storageUsage;
        this.temperature = temperature;
        this.timestamp = timestamp;
    }

    public static TelemetryDtoBuilder builder() {
        return new TelemetryDtoBuilder();
    }

    public static class TelemetryDtoBuilder {
        private String deviceId;
        private double cpuUsage;
        private double ramUsage;
        private double storageUsage;
        private double temperature;
        private long timestamp;

        public TelemetryDtoBuilder deviceId(String deviceId) { this.deviceId = deviceId; return this; }
        public TelemetryDtoBuilder cpuUsage(double cpuUsage) { this.cpuUsage = cpuUsage; return this; }
        public TelemetryDtoBuilder ramUsage(double ramUsage) { this.ramUsage = ramUsage; return this; }
        public TelemetryDtoBuilder storageUsage(double storageUsage) { this.storageUsage = storageUsage; return this; }
        public TelemetryDtoBuilder temperature(double temperature) { this.temperature = temperature; return this; }
        public TelemetryDtoBuilder timestamp(long timestamp) { this.timestamp = timestamp; return this; }

        public TelemetryDto build() {
            return new TelemetryDto(deviceId, cpuUsage, ramUsage, storageUsage, temperature, timestamp);
        }
    }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(double cpuUsage) { this.cpuUsage = cpuUsage; }

    public double getRamUsage() { return ramUsage; }
    public void setRamUsage(double ramUsage) { this.ramUsage = ramUsage; }

    public double getStorageUsage() { return storageUsage; }
    public void setStorageUsage(double storageUsage) { this.storageUsage = storageUsage; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
