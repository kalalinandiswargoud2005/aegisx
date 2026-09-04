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
public class AdministratorMonitor {

    private final ThreatDispatcher dispatcher;
    private Set<String> knownAdmins = new HashSet<>();

    @PostConstruct
    public void init() {
        knownAdmins = getAdminGroupMembers();
        log.info("Initialized known administrators: {}", knownAdmins);
    }

    @Scheduled(fixedRateString = "${agent.monitor.rate:10000}")
    public void check() {
        try {
            Set<String> currentAdmins = getAdminGroupMembers();
            
            for (String admin : currentAdmins) {
                if (!knownAdmins.contains(admin)) {
                    log.warn("New unauthorized administrator detected: {}", admin);
                    dispatcher.dispatch("NewAdministrator", "Unauthorized admin created: " + admin);
                    // Add to known to prevent alert loop until remediated
                    knownAdmins.add(admin); 
                }
            }
        } catch (Exception e) {
            log.error("Failed to check Administrators group", e);
        }
    }

    private Set<String> getAdminGroupMembers() {
        String output = CommandRunner.runPowerShell("(Get-LocalGroupMember -Group 'Administrators' -ErrorAction SilentlyContinue).Name");
        Set<String> members = new HashSet<>();
        if (output != null && !output.isEmpty()) {
            Arrays.stream(output.split("\\r?\\n"))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .forEach(members::add);
        }
        return members;
    }
}
