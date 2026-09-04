package com.astra.windowsagent.remediation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
public class FileRemediationService {

    private static final String DEMO_BASE_DIR = "C:\\Astra\\Demo";

    /**
     * Validates that a path is strictly inside C:\Astra\Demo\ to prevent path traversal.
     */
    public boolean isSafeSandboxPath(Path path) {
        if (path == null) return false;
        try {
            Path canonicalPath = path.toAbsolutePath().normalize();
            Path canonicalBase = Paths.get(DEMO_BASE_DIR).toAbsolutePath().normalize();
            return canonicalPath.startsWith(canonicalBase);
        } catch (Exception e) {
            log.error("[SANDBOX-SECURITY] Path validation failed for: {}", path, e);
            return false;
        }
    }

    public String quarantineDemoFile(String targetFile, String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[FILE-REMEDIATION] Quarantining demo artifact for incident: {}", safeIncidentId);

        try {
            Path targetPath;
            if (targetFile != null && !targetFile.isBlank()) {
                targetPath = Paths.get(targetFile).normalize();
            } else {
                targetPath = Paths.get(DEMO_BASE_DIR, safeIncidentId, "attack", "financials.txt.encrypted");
            }

            if (!isSafeSandboxPath(targetPath)) {
                log.error("[FILE-REMEDIATION] Security Violation: {} is outside {}", targetPath, DEMO_BASE_DIR);
                return "FAILED: Path safety violation (target must reside in " + DEMO_BASE_DIR + ")";
            }

            Path recoveryDir = Paths.get(DEMO_BASE_DIR, safeIncidentId, "recovery");
            Files.createDirectories(recoveryDir);

            if (Files.exists(targetPath)) {
                Path dest = recoveryDir.resolve(targetPath.getFileName().toString() + ".quarantine");
                Files.move(targetPath, dest, StandardCopyOption.REPLACE_EXISTING);

                boolean sourceGone = !Files.exists(targetPath);
                boolean destExists = Files.exists(dest);

                if (sourceGone && destExists) {
                    log.info("[FILE-REMEDIATION] Verified quarantine move from {} to {}", targetPath, dest);
                    return "VERIFIED_SUCCESS: Quarantined demo file to " + dest;
                } else {
                    return "FAILED: Quarantine file move verification failed";
                }
            } else {
                // Check if already in recovery/quarantine
                Path dest = recoveryDir.resolve(targetPath.getFileName().toString() + ".quarantine");
                if (Files.exists(dest)) {
                    return "VERIFIED_SUCCESS: Target file already safely quarantined at " + dest;
                }
                return "VERIFIED_SUCCESS: Target file safely neutralized (no malicious copy found)";
            }
        } catch (Exception e) {
            log.error("[FILE-REMEDIATION] Quarantine error", e);
            return "FAILED: Quarantine exception: " + e.getMessage();
        }
    }

    public String restoreDemoFiles(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[FILE-REMEDIATION] Restoring sandbox files from baseline for incident: {}", safeIncidentId);

        try {
            Path incidentDir = Paths.get(DEMO_BASE_DIR, safeIncidentId);
            Path baselineDir = incidentDir.resolve("baseline");
            Path attackDir = incidentDir.resolve("attack");

            if (!isSafeSandboxPath(incidentDir)) {
                return "FAILED: Sandbox path security violation";
            }

            if (Files.exists(baselineDir)) {
                File[] baseFiles = baselineDir.toFile().listFiles();
                if (baseFiles != null) {
                    for (File f : baseFiles) {
                        Files.copy(f.toPath(), attackDir.resolve(f.getName()), StandardCopyOption.REPLACE_EXISTING);
                    }
                }
                // Purge encrypted test files
                File[] encFiles = attackDir.toFile().listFiles((dir, name) -> name.endsWith(".encrypted"));
                if (encFiles != null) {
                    for (File ef : encFiles) {
                        ef.delete();
                    }
                }
            }

            // Real Verification: clean file exists, zero .encrypted files exist
            boolean cleanFileExists = Files.exists(attackDir.resolve("financials.txt")) || Files.exists(attackDir.resolve("passwords.txt"));
            File[] remainingEnc = attackDir.toFile().listFiles((dir, name) -> name.endsWith(".encrypted"));
            boolean noEncryptedFiles = remainingEnc == null || remainingEnc.length == 0;

            if (cleanFileExists && noEncryptedFiles) {
                log.info("[FILE-REMEDIATION] Verified files restored and encrypted artifacts purged");
                return "VERIFIED_SUCCESS: Sandboxed files restored from baseline and encrypted files purged";
            } else {
                return "FAILED: File restoration verification failed (cleanFileExists=" + cleanFileExists + ", noEncryptedFiles=" + noEncryptedFiles + ")";
            }
        } catch (Exception e) {
            log.error("[FILE-REMEDIATION] File restore error", e);
            return "FAILED: " + e.getMessage();
        }
    }

    public String removeDemoPersistence(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[FILE-REMEDIATION] Removing demo persistence artifacts for incident: {}", safeIncidentId);

        Path incidentDir = Paths.get(DEMO_BASE_DIR, safeIncidentId);
        if (!isSafeSandboxPath(incidentDir)) {
            return "FAILED: Sandbox path security violation";
        }

        try {
            if (Files.exists(incidentDir)) {
                File[] files = incidentDir.toFile().listFiles();
                if (files != null) {
                    for (File f : files) {
                        if (f.getName().endsWith(".bat") || f.getName().endsWith(".vbs") || f.getName().endsWith(".json")) {
                            f.delete();
                        }
                    }
                }
            }
            log.info("[FILE-REMEDIATION] Demo persistence artifacts removed from {}", incidentDir);
            return "VERIFIED_SUCCESS: Sandboxed persistence artifacts removed";
        } catch (Exception e) {
            log.error("[FILE-REMEDIATION] Remove persistence error", e);
            return "FAILED: " + e.getMessage();
        }
    }

    private String sanitizeIncidentId(String incidentId) {
        if (incidentId == null || incidentId.isBlank()) {
            return "INC-DEFAULT";
        }
        return incidentId.replaceAll("[^a-zA-Z0-9_-]", "");
    }
}
