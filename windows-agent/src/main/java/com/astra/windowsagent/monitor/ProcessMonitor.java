package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProcessMonitor {

    private final ThreatDispatcher dispatcher;
    private final Random random = new Random();
    private final List<String> maliciousProcesses = Arrays.asList("mimikatz", "nc", "nmap", "ransomware_sim", "netcat");

    @Scheduled(fixedRateString = "${agent.monitor.rate:10000}")
    public void check() {
        try {
            String output = CommandRunner.runPowerShell("Get-Process | Select-Object -ExpandProperty Name");
            if (output != null && !output.isEmpty()) {
                String[] runningProcesses = output.split("\\r?\\n");
                for (String process : runningProcesses) {
                    process = process.trim().toLowerCase();
                    for (String malicious : maliciousProcesses) {
                        if (process.equals(malicious) || process.startsWith(malicious + ".")) {
                            log.warn("Malicious process detected: {}", process);
                            dispatcher.dispatch("SuspiciousProcess", "Detected known malicious process: " + process);
                        }
                    }
                }
            }

            if (random.nextDouble() < 0.02) { 
                log.info("ProcessMonitor triggered mock anomaly for demonstration");
                dispatcher.dispatch("SuspiciousProcess", "Mock malicious process detected");
            }
        } catch (Exception e) {
            log.error("Failed to check processes", e);
        }
    }
}
