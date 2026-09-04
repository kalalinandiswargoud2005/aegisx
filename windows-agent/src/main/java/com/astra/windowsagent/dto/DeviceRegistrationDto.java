package com.astra.windowsagent.dto;

public class DeviceRegistrationDto {
    private String deviceId;
    private String hostname;
    private String osName;
    private String windowsVersion;
    private String ipAddress;
    private String macAddress;
    private String version;
    private String agentVersion;
    private String status;

    public DeviceRegistrationDto() {}

    public DeviceRegistrationDto(String deviceId, String hostname, String osName, String windowsVersion, String ipAddress, String macAddress, String version, String agentVersion, String status) {
        this.deviceId = deviceId;
        this.hostname = hostname;
        this.osName = osName;
        this.windowsVersion = windowsVersion;
        this.ipAddress = ipAddress;
        this.macAddress = macAddress;
        this.version = version;
        this.agentVersion = agentVersion;
        this.status = status;
    }

    public static DeviceRegistrationDtoBuilder builder() {
        return new DeviceRegistrationDtoBuilder();
    }

    public static class DeviceRegistrationDtoBuilder {
        private String deviceId;
        private String hostname;
        private String osName;
        private String windowsVersion;
        private String ipAddress;
        private String macAddress;
        private String version;
        private String agentVersion;
        private String status;

        public DeviceRegistrationDtoBuilder deviceId(String deviceId) { this.deviceId = deviceId; return this; }
        public DeviceRegistrationDtoBuilder hostname(String hostname) { this.hostname = hostname; return this; }
        public DeviceRegistrationDtoBuilder osName(String osName) { this.osName = osName; return this; }
        public DeviceRegistrationDtoBuilder windowsVersion(String windowsVersion) { this.windowsVersion = windowsVersion; return this; }
        public DeviceRegistrationDtoBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public DeviceRegistrationDtoBuilder macAddress(String macAddress) { this.macAddress = macAddress; return this; }
        public DeviceRegistrationDtoBuilder version(String version) { this.version = version; return this; }
        public DeviceRegistrationDtoBuilder agentVersion(String agentVersion) { this.agentVersion = agentVersion; return this; }
        public DeviceRegistrationDtoBuilder status(String status) { this.status = status; return this; }

        public DeviceRegistrationDto build() {
            return new DeviceRegistrationDto(deviceId, hostname, osName, windowsVersion, ipAddress, macAddress, version, agentVersion, status);
        }
    }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getHostname() { return hostname; }
    public void setHostname(String hostname) { this.hostname = hostname; }

    public String getOsName() { return osName; }
    public void setOsName(String osName) { this.osName = osName; }

    public String getWindowsVersion() { return windowsVersion; }
    public void setWindowsVersion(String windowsVersion) { this.windowsVersion = windowsVersion; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getMacAddress() { return macAddress; }
    public void setMacAddress(String macAddress) { this.macAddress = macAddress; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getAgentVersion() { return agentVersion; }
    public void setAgentVersion(String agentVersion) { this.agentVersion = agentVersion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
