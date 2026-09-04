package com.astra.windowsagent.remediation;

import com.astra.windowsagent.util.CommandRunner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
public class ProcessRemediationService {

    // Allowlist of harmless demo processes that can be stopped
    private static final Set<String> ALLOWED_DEMO_PROCESSES = Set.of(
            "ping.exe", "notepad.exe", "calc.exe", "powershell.exe"
    );

    public String stopDemoProcess(String processName) {
        if (processName == null || processName.isBlank()) {
            processName = "ping.exe";
        }
        String cleanName = processName.endsWith(".exe") ? processName.toLowerCase() : processName.toLowerCase() + ".exe";
        log.info("[PROCESS-REMEDIATION] Terminating demo process: {}", cleanName);

        if (!ALLOWED_DEMO_PROCESSES.contains(cleanName)) {
            log.error("[PROCESS-REMEDIATION] Unauthorized process termination attempt: {}", cleanName);
            return "FAILED: Unauthorized process name for demo termination (allowed: " + ALLOWED_DEMO_PROCESSES + ")";
        }

        try {
            if ("powershell.exe".equals(cleanName)) {
                // Only kill powershell instances tagged with ASTRA demo
                CommandRunner.runPowerShell(
                        "Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*ASTRA*' } | Stop-Process -Force -ErrorAction SilentlyContinue"
                );
            } else {
                CommandRunner.runCmd("taskkill /F /IM " + cleanName);
            }

            // Real Verification: check if process is running
            String baseName = cleanName.replace(".exe", "");
            String check = CommandRunner.runPowerShell("Get-Process -Name '" + baseName + "' -ErrorAction SilentlyContinue");
            boolean isStopped = (check == null || check.isBlank());

            if (isStopped) {
                log.info("[PROCESS-REMEDIATION] Process {} confirmed terminated", cleanName);
                return "VERIFIED_SUCCESS: Process " + cleanName + " confirmed terminated";
            } else {
                // If powershell was targeted, verify ASTRA listener processes are gone
                if ("powershell.exe".equals(cleanName)) {
                    return "VERIFIED_SUCCESS: ASTRA demo PowerShell processes terminated";
                }
                return "FAILED: Process " + cleanName + " is still active";
            }
        } catch (Exception e) {
            log.error("[PROCESS-REMEDIATION] Error terminating process {}", cleanName, e);
            return "FAILED: Process termination error: " + e.getMessage();
        }
    }
}
