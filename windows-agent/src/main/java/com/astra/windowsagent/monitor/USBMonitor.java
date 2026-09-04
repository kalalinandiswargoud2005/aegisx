package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class USBMonitor {

    private final ThreatDispatcher dispatcher;
    private Set<String> knownUsbDevices = new HashSet<>();

    @PostConstruct
    public void init() {
        knownUsbDevices = getCurrentUsbDevices();
        log.info("Initialized known USB storage devices: {}", knownUsbDevices);
    }

    @Scheduled(fixedRateString = "${agent.monitor.rate:10000}")
    public void check() {
        try {
            Set<String> currentDevices = getCurrentUsbDevices();

            for (String device : currentDevices) {
                if (!knownUsbDevices.contains(device)) {
                    log.warn("New USB storage device inserted: {}", device);
                    dispatcher.dispatch("USBInserted", "Unauthorized USB storage device detected: " + device);
                }
            }
            knownUsbDevices = currentDevices;
        } catch (Exception e) {
            log.error("Failed to check USB devices", e);
        }
    }

    private Set<String> getCurrentUsbDevices() {
        Set<String> devices = new HashSet<>();
        try {
            String output = CommandRunner.runPowerShell("Get-CimInstance Win32_DiskDrive | Where-Object { $_.InterfaceType -eq 'USB' } | Select-Object -ExpandProperty Caption");
            if (output != null && !output.isEmpty()) {
                Arrays.stream(output.split("\\r?\\n"))
                      .map(String::trim)
                      .filter(s -> !s.isEmpty())
                      .forEach(devices::add);
            }
        } catch (Exception e) {
            log.error("Failed to query USB devices", e);
        }
        return devices;
    }
}
