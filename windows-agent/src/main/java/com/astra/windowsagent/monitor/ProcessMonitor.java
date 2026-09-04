package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProcessMonitor {

    private final ThreatDispatcher dispatcher;
    private final List<String> maliciousProcesses = Arrays.asList(
        "mimikatz", "nc", "nmap", "ransomware_sim", "netcat", 
        "wireshark", "hydra", "metasploit", "msfconsole", 
        "attack_simulation", "simulated_malware"
    );
    private final Set<String> activeAlertedProcesses = new HashSet<>();

    @Scheduled(fixedRateString = "${agent.monitor.rate:10000}")
    public void check() {
        try {
            String output = CommandRunner.runPowerShell("Get-Process | Select-Object -ExpandProperty Name");
            if (output != null && !output.isEmpty()) {
                String[] runningProcesses = output.split("\\r?\\n");
                Set<String> currentlyRunning = new HashSet<>();
                for (String p : runningProcesses) {
                    currentlyRunning.add(p.trim().toLowerCase());
                }

                for (String process : currentlyRunning) {
                    for (String malicious : maliciousProcesses) {
                        if (process.equals(malicious) || process.startsWith(malicious + ".")) {
                            if (!activeAlertedProcesses.contains(process)) {
                                log.warn("Malicious process detected: {}", process);
                                dispatcher.dispatch("SuspiciousProcess", "Detected known malicious/attack process: " + process);
                                activeAlertedProcesses.add(process);
                            }
                        }
                    }
                }
                
                // Cleanup terminated processes
                activeAlertedProcesses.retainAll(currentlyRunning);
            }
        } catch (Exception e) {
            log.error("Failed to check processes", e);
        }
    }
}
