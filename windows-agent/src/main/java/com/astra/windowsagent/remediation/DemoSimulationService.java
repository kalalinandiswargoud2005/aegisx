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

    public String executeSimulatedDarksidePayload(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[DEMO-SIMULATION] Triggering DarkSide Rogue Payload simulation for incident: {}", safeIncidentId);

        try {
            Path incidentDir = Paths.get(DEMO_BASE_DIR, safeIncidentId, "attack");
            Files.createDirectories(incidentDir);
            Files.writeString(incidentDir.resolve("darkside_stager.bin"), "SIMULATED_DARKSIDE_RANSOMWARE_PAYLOAD_HASH_99214");

            // Write registry persistence
            String keyPath = "HKCU\\Software\\ASTRA\\Demo\\" + safeIncidentId;
            CommandRunner.runCmd("reg add \"" + keyPath + "\" /v DarkSidePersistence /t REG_SZ /d \"C:\\Astra\\Demo\\" + safeIncidentId + "\\darkside_stager.bin\" /f");

            // Spawn a visual rogue console window with red background
            String batContent = "@echo off\r\ntitle [CRITICAL_MALICIOUS_PROCESS_ASTRA]\r\ncolor 4F\r\ncls\r\n"
                    + "echo =====================================================================\r\n"
                    + "echo  [!] CRITICAL THREAT SIMULATION: DARKSIDE INJECTION ACTIVE\r\n"
                    + "echo  [!] INCIDENT ID: " + safeIncidentId + "\r\n"
                    + "echo  [!] HOST PROCESS: rogue_darkside_stager.exe [PID: SIMULATED]\r\n"
                    + "echo  [*] INJECTING PERSISTENCE HOOKS INTO HKCU\\Software\\ASTRA\\Demo...\r\n"
                    + "echo  [*] ATTEMPTING LATERAL PRIVILEGE ESCALATION...\r\n"
                    + "echo =====================================================================\r\n"
                    + "echo  NOTICE: THIS IS A SAFE EDR THREAT SIMULATION.\r\n"
                    + "echo  DO NOT CLOSE MANUALLY - EXECUTE REMEDIATION STEP FROM DASHBOARD!\r\n"
                    + "echo =====================================================================\r\n"
                    + ":loop\r\necho [*] Threat vector active - beaconing memory state... (Press Ctrl+C to stop or Remediate)\r\ntimeout /t 3 >nul\r\ngoto loop\r\n";

            Path batFile = incidentDir.resolve("darkside_runner.bat");
            Files.writeString(batFile, batContent);

            CommandRunner.runPowerShell("Start-Process cmd.exe -ArgumentList '/c', '\"" + batFile.toAbsolutePath() + "\"'");

            // Trigger visual UI overlays
            overlay.showThreatAlert("DarkSide Rogue Window & Injection (" + safeIncidentId + ")", safeIncidentId, "CRITICAL");

            return "VERIFIED_SUCCESS: DarkSide rogue window spawned and persistence sandbox active";
        } catch (Exception e) {
            log.error("[DEMO-SIMULATION] DarkSide simulation error", e);
            return "FAILED: " + e.getMessage();
        }
    }

    public String executeSimulatedStealthRat(String incidentId) {
        String safeIncidentId = sanitizeIncidentId(incidentId);
        log.info("[DEMO-SIMULATION] Triggering Stealth RAT Backdoor simulation for incident: {}", safeIncidentId);
        try {
            // Bind strictly to loopback 127.0.0.1:44444
            String ps = "$ip = [System.Net.IPAddress]::Parse('127.0.0.1'); $listener = New-Object System.Net.Sockets.TcpListener($ip, 44444); $listener.Start(); Write-Host '[ASTRA_SAFE_DEMO_LISTENER] RAT Backdoor Active'; while($true) { Start-Sleep -Seconds 1 }";
            CommandRunner.runPowerShell("Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-Command', \"" + ps + "\"");

            // Add registry artifact
            String keyPath = "HKCU\\Software\\ASTRA\\Demo\\" + safeIncidentId;
            CommandRunner.runCmd("reg add \"" + keyPath + "\" /v StealthRatPort /t REG_DWORD /d 44444 /f");

            // Trigger Matrix HUD
            overlay.showThreatAlert("Stealth RAT Backdoor Socket Opened (TCP 44444)", safeIncidentId, "CRITICAL");
            overlay.showMatrixOverlay();

            return "VERIFIED_SUCCESS: Stealth RAT listener active on 127.0.0.1:44444";
        } catch (Exception e) {
            log.error("[DEMO-SIMULATION] Stealth RAT simulation error", e);
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
