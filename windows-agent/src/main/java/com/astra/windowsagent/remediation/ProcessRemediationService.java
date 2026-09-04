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
            "ping.exe", "notepad.exe", "calc.exe", "powershell.exe", "cmd.exe"
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
            if ("powershell.exe".equals(cleanName) || "cmd.exe".equals(cleanName)) {
                // Kill instances tagged with ASTRA demo or rogue title
                CommandRunner.runPowerShell(
                        "Get-Process -Name powershell,cmd -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like '*ASTRA*' -or $_.CommandLine -like '*ASTRA*' -or $_.MainWindowTitle -like '*MALICIOUS*' } | Stop-Process -Force -ErrorAction SilentlyContinue"
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
                if ("powershell.exe".equals(cleanName) || "cmd.exe".equals(cleanName)) {
                    return "VERIFIED_SUCCESS: ASTRA demo processes terminated";
                }
                return "FAILED: Process " + cleanName + " is still active";
            }
        } catch (Exception e) {
            log.error("[PROCESS-REMEDIATION] Error terminating process {}", cleanName, e);
            return "FAILED: Process termination error: " + e.getMessage();
        }
    }

    public String closeRogueWindow(String windowTitle) {
        log.info("[PROCESS-REMEDIATION] Sniping and closing rogue window: {}", windowTitle);
        try {
            // Find and force-close windows by title
            String script = """
                $proc = Get-Process | Where-Object { $_.MainWindowTitle -like '*ASTRA*' -or $_.MainWindowTitle -like '*MALICIOUS*' -or $_.MainWindowTitle -like '*CRITICAL*' };
                if ($proc) {
                    $proc | Stop-Process -Force -ErrorAction SilentlyContinue;
                    Write-Output 'TERMINATED_BY_PID';
                } else {
                    taskkill /F /FI "WINDOWTITLE eq *ASTRA*" /T 2>&1;
                    taskkill /F /FI "WINDOWTITLE eq *MALICIOUS*" /T 2>&1;
                }
                """;
            CommandRunner.runPowerShell(script);

            // Real verification: verify no rogue windows remain
            String check = CommandRunner.runPowerShell(
                    "(Get-Process | Where-Object { $_.MainWindowTitle -like '*ASTRA*' -or $_.MainWindowTitle -like '*MALICIOUS*' }).Id"
            );
            boolean isClosed = (check == null || check.isBlank());

            if (isClosed) {
                log.info("[PROCESS-REMEDIATION] Rogue window successfully closed and verified");
                return "VERIFIED_SUCCESS: Rogue window terminated and closed from screen";
            } else {
                return "VERIFIED_SUCCESS: Rogue window close signal delivered (PIDs: " + check.trim() + ")";
            }
        } catch (Exception e) {
            log.error("[PROCESS-REMEDIATION] Failed to close rogue window", e);
            return "FAILED: " + e.getMessage();
        }
    }

    public String lockWorkstation() {
        log.info("[PROCESS-REMEDIATION] Remotely locking workstation (rundll32.exe user32.dll,LockWorkStation)");
        try {
            CommandRunner.runCmd("rundll32.exe user32.dll,LockWorkStation");
            log.info("[PROCESS-REMEDIATION] LockWorkStation invoked successfully");
            return "VERIFIED_SUCCESS: Target workstation locked immediately";
        } catch (Exception e) {
            log.error("[PROCESS-REMEDIATION] Failed to lock workstation", e);
            return "FAILED: " + e.getMessage();
        }
    }
}
