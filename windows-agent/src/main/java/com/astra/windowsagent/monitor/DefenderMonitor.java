package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class DefenderMonitor {

    private final ThreatDispatcher dispatcher;
    private boolean wasRtpDisabled = false;
    private final Set<String> knownReportedThreats = new HashSet<>();

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            String rtpStatus = CommandRunner.runPowerShell("(Get-MpPreference).DisableRealtimeMonitoring");
            if (rtpStatus != null) {
                wasRtpDisabled = "True".equalsIgnoreCase(rtpStatus.trim());
            }
            String activeThreats = CommandRunner.runPowerShell("Get-MpThreat | Select-Object -ExpandProperty ThreatName");
            if (activeThreats != null && !activeThreats.trim().isEmpty()) {
                String[] threats = activeThreats.split("\\r?\\n");
                for (String threat : threats) {
                    if (!threat.trim().isEmpty()) {
                        knownReportedThreats.add(threat.trim());
                    }
                }
            }
            log.info("Initialized baseline Defender threats: {}", knownReportedThreats.size());
        } catch (Exception e) {
            log.warn("Could not initialize Defender baseline: {}", e.getMessage());
        }
    }

    @Scheduled(fixedRateString = "${agent.monitors.defender-rate:${agent.monitors.rate:1500}}")
    public void check() {
        try {
            // Check if Real-Time Protection is disabled
            String rtpStatus = CommandRunner.runPowerShell("(Get-MpPreference).DisableRealtimeMonitoring");
            if (rtpStatus != null) {
                boolean isCurrentlyDisabled = "True".equalsIgnoreCase(rtpStatus.trim());
                if (isCurrentlyDisabled && !wasRtpDisabled) {
                    log.warn("Real-Time Protection is DISABLED!");
                    dispatcher.dispatch("AntivirusDisabled", "Windows Defender Real-Time Protection is turned off.");
                    wasRtpDisabled = true;
                } else if (!isCurrentlyDisabled && wasRtpDisabled) {
                    log.info("Windows Defender Real-Time Protection has been re-enabled.");
                    wasRtpDisabled = false;
                }
            }

            // Check for active threats
            String activeThreats = CommandRunner.runPowerShell("Get-MpThreat | Select-Object -ExpandProperty ThreatName");
            if (activeThreats != null && !activeThreats.trim().isEmpty()) {
                String[] threats = activeThreats.split("\\r?\\n");
                for (String threat : threats) {
                    String cleanThreat = threat.trim();
                    if (!cleanThreat.isEmpty() && !knownReportedThreats.contains(cleanThreat)) {
                        log.warn("Windows Defender detected new threat: {}", cleanThreat);
                        dispatcher.dispatch("SecurityCenterAlert", "Defender detected: " + cleanThreat);
                        knownReportedThreats.add(cleanThreat);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to check Defender status", e);
        }
    }
}
