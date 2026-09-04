package com.astra.windowsagent.remediation;

import com.astra.windowsagent.service.AstraEnforcerOverlay;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoSimulationService {

    private final AstraEnforcerOverlay overlay;
    private static final String DEMO_BASE_DIR = "C:\\Astra\\Demo";

    public String executeSimulatedRansomware(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        Path incidentDir = Paths.get(DEMO_BASE_DIR, safeIncidentId);
        Path baselineDir = incidentDir.resolve("baseline");
        Path attackDir = incidentDir.resolve("attack");
        Path recoveryDir = incidentDir.resolve("recovery");

        try {
            Files.createDirectories(baselineDir);
            Files.createDirectories(attackDir);
            Files.createDirectories(recoveryDir);

            Path file1 = attackDir.resolve("financials.txt");
            Path file2 = attackDir.resolve("passwords.txt");
            Path file3 = attackDir.resolve("report.txt");

            String content1 = "ASTRA DEMO FINANCIAL RECORDS 2026";
            String content2 = "ASTRA DEMO ADMIN PASSWORD VAULT";
            String content3 = "ASTRA ENTERPRISE SECURITY REPORT";

            // Save baseline clean copies
            Files.writeString(baselineDir.resolve("financials.txt"), content1);
            Files.writeString(baselineDir.resolve("passwords.txt"), content2);
            Files.writeString(baselineDir.resolve("report.txt"), content3);

            // Write active attack sandbox files
            Files.writeString(file1, content1);
            Files.writeString(file2, content2);
            Files.writeString(file3, content3);

            // Simulate encryption strictly by renaming to .encrypted in sandbox
            Files.move(file1, attackDir.resolve("financials.txt.encrypted"), StandardCopyOption.REPLACE_EXISTING);
            Files.move(file2, attackDir.resolve("passwords.txt.encrypted"), StandardCopyOption.REPLACE_EXISTING);
            Files.move(file3, attackDir.resolve("report.txt.encrypted"), StandardCopyOption.REPLACE_EXISTING);

            log.info("[DEMO-SIMULATION] Simulated Ransomware: test files encrypted in {}", attackDir);

            // Trigger visual UI overlays
            overlay.showThreatAlert("Simulated Ransomware (Incident " + safeIncidentId + ")");
            overlay.showMatrixOverlay();

            return "VERIFIED_SUCCESS: Simulated ransomware executed in " + attackDir;
        } catch (Exception e) {
            log.error("[DEMO-SIMULATION] Simulated ransomware error", e);
            return "FAILED: " + e.getMessage();
        }
    }

    public String executeSimulatedWallpaperHijack(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[DEMO-SIMULATION] Triggering Safe Wallpaper Hijack Demo for incident: {}", safeIncidentId);

        // Does NOT modify actual Windows wallpaper; displays visual UI card and containment
        overlay.showWallpaperHijackSimulation(safeIncidentId);

        return "VERIFIED_SUCCESS: Safe wallpaper hijack simulation active in UI";
    }

    public String executeSimulatedGhostTyper(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[DEMO-SIMULATION] Triggering Safe Ghost-Typer Simulation for incident: {}", safeIncidentId);

        // Visual keystroke simulation rendered directly in ASTRA UI HUD
        overlay.showGhostTyperSimulation(safeIncidentId);

        return "VERIFIED_SUCCESS: Safe ghost-typer simulation active in UI";
    }

    public String executeSimulatedBackdoor(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        try {
            // Bind strictly to loopback 127.0.0.1:44444 (never external)
            String ps = "$ip = [System.Net.IPAddress]::Parse('127.0.0.1'); $listener = New-Object System.Net.Sockets.TcpListener($ip, 44444); $listener.Start(); Write-Host '[ASTRA_SAFE_DEMO_LISTENER] Backdoor Port TCP 44444 Active'; while($true) { Start-Sleep -Seconds 1 }";
            CommandRunner.runPowerShell("Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-Command', \"" + ps + "\"");

            log.info("[DEMO-SIMULATION] Simulated Backdoor Listener active on 127.0.0.1:44444");
            overlay.showThreatAlert("Simulated Backdoor Port Opened (TCP 44444)");

            return "VERIFIED_SUCCESS: Safe local backdoor port opened on 127.0.0.1:44444";
        } catch (Exception e) {
            log.error("[DEMO-SIMULATION] Backdoor simulation error", e);
            return "FAILED: " + e.getMessage();
        }
    }

    public String executeSimulatedRegistryHijack(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        try {
            String keyPath = "HKCU\\Software\\ASTRA\\Demo\\" + safeIncidentId;
            CommandRunner.runCmd("reg add \"" + keyPath + "\" /v DemoThreatActive /t REG_DWORD /d 1 /f");

            log.info("[DEMO-SIMULATION] Simulated Registry Hijack key active at {}", keyPath);
            overlay.showThreatAlert("ASTRA Registry Tamper Demo (" + safeIncidentId + ")");

            return "VERIFIED_SUCCESS: Registry hijack demo active at " + keyPath;
        } catch (Exception e) {
            log.error("[DEMO-SIMULATION] Registry demo error", e);
            return "FAILED: " + e.getMessage();
        }
    }

    private String sanitizeIncidentId(String incidentId) {
        if (incidentId != null && !incidentId.isBlank()) {
            return incidentId.replaceAll("[^a-zA-Z0-9_-]", "");
        }
        return "INC-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
