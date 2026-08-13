package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileIntegrityMonitor {

    private final ThreatDispatcher dispatcher;
    private final Random random = new Random();

    @Scheduled(fixedRateString = "${agent.monitor.rate:60000}")
    public void check() {
        // Lightweight Mock Implementation
        // In a real scenario, this would query WMI, PowerShell, or OSHI
        if (random.nextDouble() < 0.05) { // 5% chance to trigger an anomaly for demonstration
            log.warn("FileIntegrityMonitor detected an anomaly!");
            dispatcher.dispatch("FileIntegrityAlert", "FileIntegrityMonitor detected suspicious activity");
        }
    }
}
