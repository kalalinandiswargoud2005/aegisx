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
public class DefenderMonitor {

    private final ThreatDispatcher dispatcher;
    private final Random random = new Random();

    @Scheduled(fixedRateString = "${agent.monitor.rate:10000}")
    public void check() {
        try {
            // Check if Real-Time Protection is disabled
            String rtpStatus = CommandRunner.runPowerShell("(Get-MpPreference).DisableRealtimeMonitoring");
            if ("True".equalsIgnoreCase(rtpStatus.trim())) {
                log.warn("Real-Time Protection is DISABLED!");
                dispatcher.dispatch("AntivirusDisabled", "Windows Defender Real-Time Protection is turned off.");
            }

            // Check for active threats
            String activeThreats = CommandRunner.runPowerShell("Get-MpThreat | Select-Object -ExpandProperty ThreatName");
            if (activeThreats != null && !activeThreats.trim().isEmpty()) {
                log.warn("Windows Defender detected threats: {}", activeThreats.trim());
                dispatcher.dispatch("SecurityCenterAlert", "Defender detected: " + activeThreats.trim());
            }

            // Mock fallback for demonstration
            if (random.nextDouble() < 0.05) { 
                log.info("DefenderMonitor triggered mock anomaly for demonstration");
                dispatcher.dispatch("SecurityCenterAlert", "Mock EICAR Test File Detected");
            }
        } catch (Exception e) {
            log.error("Failed to check Defender status", e);
        }
    }
}
