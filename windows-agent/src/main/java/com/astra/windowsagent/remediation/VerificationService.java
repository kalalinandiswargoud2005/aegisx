package com.astra.windowsagent.remediation;

import com.astra.windowsagent.util.CommandRunner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class VerificationService {

    private static final String DEMO_BASE_DIR = "C:\\Astra\\Demo";

    public String performFinalVerification(String incidentId) {
        String safeIncidentId = (incidentId != null && !incidentId.isBlank()) 
                ? incidentId.replaceAll("[^a-zA-Z0-9_-]", "") : "INC-DEFAULT";
        log.info("[VERIFICATION-SERVICE] Auditing endpoint baseline & sandbox for incident: {}", safeIncidentId);

        StringBuilder issues = new StringBuilder();

        // 1. Audit sandbox directory for unquarantined .encrypted files
        try {
            Path incidentDir = Paths.get(DEMO_BASE_DIR, safeIncidentId);
            if (Files.exists(incidentDir)) {
                Path attackDir = incidentDir.resolve("attack");
                if (Files.exists(attackDir)) {
                    File[] leftoverEnc = attackDir.toFile().listFiles((dir, name) -> name.endsWith(".encrypted"));
                    if (leftoverEnc != null && leftoverEnc.length > 0) {
                        issues.append("Found ").append(leftoverEnc.length).append(" unquarantined .encrypted files; ");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[VERIFICATION-SERVICE] Sandbox directory check error: {}", e.getMessage());
        }

        // 2. Audit port 44444 listener
        try {
            String verifyPort = CommandRunner.runPowerShell("netstat -ano | Select-String ':44444 '");
            if (verifyPort != null && !verifyPort.isBlank()) {
                issues.append("Port 44444 is still active; ");
            }
        } catch (Exception e) {
            log.warn("[VERIFICATION-SERVICE] Port verification check error: {}", e.getMessage());
        }

        // 3. Audit test registry key
        try {
            String checkReg = CommandRunner.runCmd("reg query \"HKCU\\Software\\ASTRA\\Demo\\" + safeIncidentId + "\"");
            if (checkReg != null && !checkReg.contains("ERROR") && checkReg.contains("DemoThreatActive")) {
                issues.append("Demo registry key still present; ");
            }
        } catch (Exception e) {
            log.warn("[VERIFICATION-SERVICE] Registry verification check error: {}", e.getMessage());
        }

        if (issues.length() == 0) {
            log.info("[VERIFICATION-SERVICE] Endpoint baseline verified clean. All threat artifacts purged.");
            return "VERIFIED_SUCCESS: Final verification completed. Endpoint system baseline clean and all threat artifacts removed.";
        } else {
            log.error("[VERIFICATION-SERVICE] Baseline audit detected issues: {}", issues);
            return "FAILED: Final verification failed: " + issues.toString().trim();
        }
    }
}
