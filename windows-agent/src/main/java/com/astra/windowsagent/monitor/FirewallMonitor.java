package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FirewallMonitor {

    private final ThreatDispatcher dispatcher;
    private boolean wasFirewallDisabled = false;

    @Scheduled(fixedRateString = "${agent.monitors.firewall-rate:${agent.monitors.rate:1500}}")
    public void check() {
        try {
            String output = CommandRunner.runPowerShell("(Get-NetFirewallProfile).Enabled");
            if (output != null && !output.isEmpty()) {
                boolean hasDisabledProfile = output.toLowerCase().contains("false");
                if (hasDisabledProfile && !wasFirewallDisabled) {
                    log.warn("Windows Firewall profile was disabled!");
                    dispatcher.dispatch("FirewallDisabled", "One or more Windows Firewall profiles (Domain/Private/Public) were turned off");
                    wasFirewallDisabled = true;
                } else if (!hasDisabledProfile && wasFirewallDisabled) {
                    log.info("Windows Firewall profiles restored to enabled.");
                    wasFirewallDisabled = false;
                }
            }
        } catch (Exception e) {
            log.error("Failed to check Firewall status", e);
        }
    }
}
