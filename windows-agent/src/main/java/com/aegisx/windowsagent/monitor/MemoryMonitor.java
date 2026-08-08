package com.aegisx.windowsagent.monitor;

import com.aegisx.windowsagent.dispatcher.ThreatDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemoryMonitor {

    private final ThreatDispatcher dispatcher;
    private final Random random = new Random();

    @Scheduled(fixedRateString = "${agent.monitor.rate:60000}")
    public void check() {
        // Lightweight Mock Implementation
        // In a real scenario, this would query WMI, PowerShell, or OSHI
        if (random.nextDouble() < 0.05) { // 5% chance to trigger an anomaly for demonstration
            log.warn("MemoryMonitor detected an anomaly!");
            dispatcher.dispatch("MemoryExhaustion", "MemoryMonitor detected suspicious activity");
        }
    }
}
