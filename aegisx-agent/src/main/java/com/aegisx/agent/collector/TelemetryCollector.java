package com.aegisx.agent.collector;

import com.aegisx.agent.dto.TelemetryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.hardware.NetworkIF;
import oshi.hardware.PowerSource;
import oshi.hardware.Sensors;
import oshi.software.os.FileSystem;
import oshi.software.os.OSFileStore;
import oshi.software.os.OperatingSystem;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemetryCollector {

    private final SystemInfo systemInfo = new SystemInfo();

    @Value("${aegisx.agent.id:unknown-device}")
    private String deviceId;

    public TelemetryDto collectTelemetry() {
        HardwareAbstractionLayer hardware = systemInfo.getHardware();
        OperatingSystem os = systemInfo.getOperatingSystem();
        
        String dynamicDeviceId = System.getProperty("aegisx.agent.id", deviceId);

        // CPU
        CentralProcessor processor = hardware.getProcessor();
        long[] prevTicks = processor.getSystemCpuLoadTicks();
        try {
            Thread.sleep(100); // Give a small window to measure load
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double cpuUsage = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100;

        // RAM
        GlobalMemory memory = hardware.getMemory();
        long ramTotal = memory.getTotal();
        long ramUsed = ramTotal - memory.getAvailable();

        // Disk
        FileSystem fileSystem = os.getFileSystem();
        List<OSFileStore> fileStores = fileSystem.getFileStores();
        long diskTotal = 0;
        long diskUsed = 0;
        for (OSFileStore fs : fileStores) {
            diskTotal += fs.getTotalSpace();
            diskUsed += (fs.getTotalSpace() - fs.getUsableSpace());
        }

        // Uptime
        long uptime = os.getSystemUptime();

        // Network
        List<NetworkIF> networkIFs = hardware.getNetworkIFs();
        boolean networkConnected = false;
        String activeAdapter = "None";
        boolean wifiStatus = false;
        boolean bluetoothStatus = false;

        for (NetworkIF net : networkIFs) {
            net.updateAttributes();
            if (net.getBytesRecv() > 0 || net.getBytesSent() > 0) {
                networkConnected = true;
                activeAdapter = net.getDisplayName();
            }
            if (net.getDisplayName().toLowerCase().contains("wi-fi")) {
                wifiStatus = true;
            }
            if (net.getDisplayName().toLowerCase().contains("bluetooth")) {
                bluetoothStatus = true;
            }
        }

        // Battery
        List<PowerSource> powerSources = hardware.getPowerSources();
        double batteryStatus = 100.0;
        if (!powerSources.isEmpty()) {
            batteryStatus = powerSources.get(0).getRemainingCapacityPercent() * 100;
        }

        // Temperature
        Sensors sensors = hardware.getSensors();
        double temperature = sensors.getCpuTemperature();

        // OS Details
        String osVersion = os.getFamily() + " " + os.getVersionInfo().getVersion();
        
        // Other Metrics
        int runningProcessCount = os.getProcessCount();
        String loggedInUser = System.getProperty("user.name");

        return TelemetryDto.builder()
                .deviceId(dynamicDeviceId)
                .timestamp(System.currentTimeMillis())
                .cpuUsage(cpuUsage)
                .ramTotal(ramTotal)
                .ramUsed(ramUsed)
                .diskTotal(diskTotal)
                .diskUsed(diskUsed)
                .uptime(uptime)
                .networkConnected(networkConnected)
                .activeNetworkAdapter(activeAdapter)
                .wifiStatus(wifiStatus)
                .bluetoothStatus(bluetoothStatus)
                .osVersion(osVersion)
                .loggedInUser(loggedInUser)
                .agentHealth("HEALTHY")
                .aegisxServiceStatus("RUNNING")
                .installedSoftwareCount(0) // Needs WMI or Registry access to count correctly, placeholder for now
                .runningProcessCount(runningProcessCount)
                .batteryStatus(batteryStatus)
                .temperature(temperature)
                .build();
    }
}
