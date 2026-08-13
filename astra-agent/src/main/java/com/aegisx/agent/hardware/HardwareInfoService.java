package com.astra.agent.hardware;

import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.software.os.OperatingSystem;

import java.util.HashMap;
import java.util.Map;

@Service
public class HardwareInfoService {

    private final SystemInfo systemInfo;
    private final HardwareAbstractionLayer hardware;
    private final OperatingSystem os;

    public HardwareInfoService() {
        this.systemInfo = new SystemInfo();
        this.hardware = systemInfo.getHardware();
        this.os = systemInfo.getOperatingSystem();
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // CPU
        CentralProcessor processor = hardware.getProcessor();
        long[] prevTicks = processor.getSystemCpuLoadTicks();
        try {
            Thread.sleep(1000); // Wait to calculate load over 1s
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double cpuLoad = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100;
        metrics.put("cpuUsage", String.format("%.2f", cpuLoad));

        // Memory
        GlobalMemory memory = hardware.getMemory();
        double usedMemory = (double) (memory.getTotal() - memory.getAvailable()) / memory.getTotal() * 100;
        metrics.put("ramUsage", String.format("%.2f", usedMemory));

        // OS
        metrics.put("osFamily", os.getFamily());
        metrics.put("osVersion", os.getVersionInfo().getVersion());
        metrics.put("uptime", os.getSystemUptime());

        return metrics;
    }
}
