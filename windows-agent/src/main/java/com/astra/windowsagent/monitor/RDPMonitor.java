package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Slf4j
@Component
@RequiredArgsConstructor
public class RDPMonitor {

    private final ThreatDispatcher dispatcher;
    private boolean wasRdpEnabled = false;

    @PostConstruct
    public void init() {
        wasRdpEnabled = isRdpCurrentlyEnabled();
        log.info("Initialized baseline RDP enabled state: {}", wasRdpEnabled);
    }

    @Scheduled(fixedRateString = "${agent.monitors.rdp-rate:${agent.monitors.rate:1500}}")
    public void check() {
        try {
            boolean isRdpEnabled = isRdpCurrentlyEnabled();
            if (isRdpEnabled && !wasRdpEnabled) {
                log.warn("Remote Desktop (RDP) was enabled on endpoint!");
                dispatcher.dispatch("RDPEnabled", "Remote Desktop (Terminal Services) was enabled unexpectedly");
                wasRdpEnabled = true;
            } else if (!isRdpEnabled && wasRdpEnabled) {
                log.info("Remote Desktop (RDP) was disabled.");
                wasRdpEnabled = false;
            }
        } catch (Exception e) {
            log.error("Failed to check RDP status", e);
        }
    }

    private boolean isRdpCurrentlyEnabled() {
        try {
            String output = CommandRunner.runPowerShell("(Get-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name 'fDenyTSConnections' -ErrorAction SilentlyContinue).fDenyTSConnections");
            if (output != null && !output.trim().isEmpty()) {
                return "0".equals(output.trim());
            }
        } catch (Exception e) {
            log.error("Failed to query RDP registry setting", e);
        }
        return false;
    }
}
