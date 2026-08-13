package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventLogMonitor {

    private final ThreatDispatcher dispatcher;
    private final Random random = new Random();

    @Scheduled(fixedRateString = "${agent.monitor.rate:15000}")
    public void check() {
        try {
            // Check for Event ID 4625 (Failed Logon)
            String script = "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddMinutes(-1)} -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count";
            String output = CommandRunner.runPowerShell(script);
            
            if (output != null && !output.isEmpty()) {
                try {
                    int count = Integer.parseInt(output.trim());
                    if (count >= 5) {
                        log.warn("Brute force detected: {} failed logins in the last minute", count);
                        dispatcher.dispatch("EventLogCleared", "Excessive failed logins detected: " + count);
                    }
                } catch (NumberFormatException ignored) {}
            }

            if (random.nextDouble() < 0.02) { 
                log.info("EventLogMonitor triggered mock anomaly for demonstration");
                dispatcher.dispatch("EventLogCleared", "Mock brute force attack detected");
            }

        } catch (Exception e) {
            log.error("Failed to check event logs", e);
        }
    }
}
