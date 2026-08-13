package com.astra.windowsagent.service;

import com.astra.windowsagent.dto.DeviceCommandDto;
import com.astra.windowsagent.util.CommandRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemediationExecutor {

    private final AstraEnforcerOverlay overlay;

    public boolean execute(DeviceCommandDto command) {
        String type = command.getCommandType();
        String target = command.getTarget();
        String params = command.getParameters();

        log.info("Executing remediation command: type={}, target={}, params={}", type, target, params);

        // Show visual overlay on target laptop for audience
        overlay.showEnforcement(type, target != null ? target : "System", params != null ? params : "Executing policy enforcement");

        try {
            switch (type) {
                case "KILL_PROCESS":
                    return killProcess(target);
                case "DISABLE_USER":
                    return disableUser(target);
                case "QUARANTINE_FILE":
                    return quarantineFile(target);
                case "ENABLE_REALTIME":
                    return enableRealtime();
                case "RESTORE_FIREWALL":
                    return restoreFirewall();
                case "REMOVE_TASK":
                    return removeTask(target);
                case "DISABLE_RDP":
                    return disableRdp();
                case "RESTORE_HOSTS":
                    return restoreHosts();
                case "ISOLATE_DEVICE":
                    log.warn("Device isolation simulated.");
                    return true;
                case "FULL_DEFENDER_SCAN":
                    return runDefenderScan();
                default:
                    log.warn("Unknown or generic command: {}", type);
                    return true;
            }
        } catch (Exception e) {
            log.error("Execution of command {} failed", type, e);
            return false;
        }
    }

    private boolean killProcess(String processName) {
        if (processName == null || processName.isBlank()) return false;
        String cleanName = processName.endsWith(".exe") ? processName : processName + ".exe";
        String res = CommandRunner.runCmd("taskkill /F /IM " + cleanName);
        log.info("Kill process result: {}", res);
        return true;
    }

    private boolean disableUser(String username) {
        if (username == null || username.isBlank()) username = "evilhacker";
        String ps = String.format("Disable-LocalUser -Name '%s' -ErrorAction SilentlyContinue; Remove-LocalGroupMember -Group 'Administrators' -Member '%s' -ErrorAction SilentlyContinue", username, username);
        CommandRunner.runPowerShell(ps);
        log.info("Disabled user: {}", username);
        return true;
    }

    private boolean quarantineFile(String filePath) {
        try {
            if (filePath == null || filePath.isBlank()) return true;
            File src = new File(filePath);
            if (!src.exists()) return true;

            File qDir = new File("C:\\Astra\\Quarantine");
            if (!qDir.exists()) qDir.mkdirs();

            File dest = new File(qDir, src.getName() + ".quarantine");
            Files.move(src.toPath(), dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
            log.info("Quarantined file {} to {}", filePath, dest.getAbsolutePath());
            return true;
        } catch (Exception e) {
            log.error("Quarantine failed", e);
            return false;
        }
    }

    private boolean enableRealtime() {
        CommandRunner.runPowerShell("Set-MpPreference -DisableRealtimeMonitoring $false");
        log.info("Re-enabled Windows Defender Real-Time Monitoring");
        return true;
    }

    private boolean restoreFirewall() {
        CommandRunner.runCmd("netsh advfirewall set allprofiles state on");
        log.info("Restored Windows Firewall");
        return true;
    }

    private boolean removeTask(String taskName) {
        if (taskName == null || taskName.isBlank()) taskName = "WindowsUpdate_Malicious";
        CommandRunner.runCmd("schtasks /delete /tn \"" + taskName + "\" /f");
        log.info("Removed scheduled task: {}", taskName);
        return true;
    }

    private boolean disableRdp() {
        CommandRunner.runCmd("reg add \"HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 1 /f");
        log.info("Disabled Remote Desktop");
        return true;
    }

    private boolean restoreHosts() {
        try {
            String defaultHosts = "# Copyright (c) 1993-2009 Microsoft Corp.\n127.0.0.1 localhost\n::1 localhost\n";
            Files.writeString(Paths.get("C:\\Windows\\System32\\drivers\\etc\\hosts"), defaultHosts);
            log.info("Restored hosts file");
            return true;
        } catch (Exception e) {
            log.error("Failed to restore hosts file", e);
            return false;
        }
    }

    private boolean runDefenderScan() {
        CommandRunner.runPowerShell("Start-MpScan -ScanType QuickScan");
        log.info("Triggered Defender Quick Scan");
        return true;
    }
}
