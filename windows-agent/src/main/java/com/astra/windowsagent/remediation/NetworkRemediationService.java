package com.astra.windowsagent.remediation;

import com.astra.windowsagent.util.CommandRunner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NetworkRemediationService {

    public String stopDemoListener(int port) {
        log.info("[NETWORK-REMEDIATION] Closing demo listener on TCP {}", port);

        try {
            // Find and terminate process owning local loopback port 44444
            String killScript = "$conns = Get-NetTCPConnection -LocalPort " + port + " -ErrorAction SilentlyContinue; " +
                    "if ($conns) { foreach ($c in $conns) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }; " +
                    "Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*ASTRA_SAFE_DEMO_LISTENER*' } | Stop-Process -Force -ErrorAction SilentlyContinue";
            
            CommandRunner.runPowerShell(killScript);

            // Real Verification: verify port is no longer in LISTENING state
            String verify = CommandRunner.runPowerShell("netstat -ano | Select-String ':" + port + " '");
            boolean closed = (verify == null || verify.isBlank());

            if (closed) {
                log.info("[NETWORK-REMEDIATION] TCP port {} verified closed", port);
                return "VERIFIED_SUCCESS: Port " + port + " closed and verified";
            } else {
                return "FAILED: Port " + port + " still active: " + verify.trim();
            }
        } catch (Exception e) {
            log.error("[NETWORK-REMEDIATION] Error stopping listener on port {}", port, e);
            return "FAILED: Network remediation exception: " + e.getMessage();
        }
    }

    public String restoreDemoRegistry(String incidentId) {
        String safeIncidentId = (incidentId != null && !incidentId.isBlank()) 
                ? incidentId.replaceAll("[^a-zA-Z0-9_-]", "") : "INC-DEFAULT";
        log.info("[NETWORK-REMEDIATION] Removing demo registry key for incident: {}", safeIncidentId);

        try {
            String keyPath = "HKCU\\Software\\ASTRA\\Demo\\" + safeIncidentId;
            CommandRunner.runCmd("reg delete \"" + keyPath + "\" /f");

            // Real Verification: query registry key to confirm deletion
            String check = CommandRunner.runCmd("reg query \"" + keyPath + "\"");
            boolean deleted = check == null || check.contains("ERROR") || !check.contains("DemoThreatActive");

            if (deleted) {
                log.info("[NETWORK-REMEDIATION] Registry key {} confirmed removed", keyPath);
                return "VERIFIED_SUCCESS: ASTRA demo registry key deleted and verified";
            } else {
                return "FAILED: Registry key still exists after deletion attempt";
            }
        } catch (Exception e) {
            log.error("[NETWORK-REMEDIATION] Registry restore error", e);
            return "FAILED: " + e.getMessage();
        }
    }
}
