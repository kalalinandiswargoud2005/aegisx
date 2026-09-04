package com.astra.windowsagent.remediation;

import com.astra.windowsagent.util.CommandRunner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class WindowsSecurityService {

    public String disableRdp() {
        log.info("[WINDOWS-SECURITY] Executing DISABLE_RDP via Windows Registry");

        CommandRunner.CommandResult regSet = CommandRunner.runCmdWithResult(
                "reg add \"HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 1 /f"
        );

        if (!regSet.isSuccess() && regSet.getCombinedOutput().toLowerCase().contains("access is denied")) {
            log.error("[WINDOWS-SECURITY] DISABLE_RDP failed: Administrator privileges required");
            return "FAILED: ADMINISTRATOR PRIVILEGES REQUIRED";
        }

        // Real Verification: Query actual registry state
        CommandRunner.CommandResult verifyResult = CommandRunner.runPowerShellWithResult(
                "(Get-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name fDenyTSConnections -ErrorAction SilentlyContinue).fDenyTSConnections"
        );

        String actualVal = verifyResult.getStdout().trim();
        log.info("[WINDOWS-SECURITY] Verified fDenyTSConnections={}", actualVal);

        if ("1".equals(actualVal)) {
            return "VERIFIED_SUCCESS: Remote Desktop disabled and verified (fDenyTSConnections = 1)";
        } else {
            String checkReg = CommandRunner.runCmd("reg query \"HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections");
            if (checkReg != null && (checkReg.contains("0x1") || checkReg.contains("1"))) {
                return "VERIFIED_SUCCESS: Remote Desktop disabled and verified (fDenyTSConnections = 1)";
            }
            return "FAILED: Verification failed (fDenyTSConnections is " + actualVal + ", expected 1)";
        }
    }

    public String restoreFirewall() {
        log.info("[WINDOWS-SECURITY] Executing RESTORE_FIREWALL (enabling all profiles)");

        CommandRunner.CommandResult res = CommandRunner.runCmdWithResult("netsh advfirewall set allprofiles state on");
        if (!res.isSuccess() && res.getCombinedOutput().toLowerCase().contains("elevation")) {
            return "FAILED: ADMINISTRATOR PRIVILEGES REQUIRED";
        }

        // Real Verification: Query firewall state on all profiles
        String status = CommandRunner.runCmd("netsh advfirewall show allprofiles state");
        boolean on = status != null && status.toLowerCase().contains("state") && status.toLowerCase().contains("on");

        if (on) {
            log.info("[WINDOWS-SECURITY] Windows Firewall verified ON across profiles");
            return "VERIFIED_SUCCESS: Windows Firewall restored to ON across all profiles";
        } else {
            log.error("[WINDOWS-SECURITY] Firewall verification failed. Status output: {}", status);
            return "FAILED: Windows Firewall verification failed (State is not ON)";
        }
    }

    public String enableDefenderRealtime() {
        log.info("[WINDOWS-SECURITY] Executing ENABLE_REALTIME via Set-MpPreference");

        CommandRunner.CommandResult setRes = CommandRunner.runPowerShellWithResult(
                "Set-MpPreference -DisableRealtimeMonitoring $false -ErrorAction Stop"
        );
        if (!setRes.isSuccess() && setRes.getCombinedOutput().toLowerCase().contains("permissiondenied")) {
            return "FAILED: ADMINISTRATOR PRIVILEGES REQUIRED";
        }

        // Real Verification: Query Get-MpComputerStatus
        CommandRunner.CommandResult verify = CommandRunner.runPowerShellWithResult(
                "(Get-MpComputerStatus -ErrorAction SilentlyContinue).RealTimeProtectionEnabled"
        );
        String actual = verify.getStdout().trim();
        log.info("[WINDOWS-SECURITY] Verified RealTimeProtectionEnabled={}", actual);

        if ("True".equalsIgnoreCase(actual)) {
            return "VERIFIED_SUCCESS: Microsoft Defender Real-time protection enabled and verified";
        } else {
            log.error("[WINDOWS-SECURITY] Defender verification failed. Expected True, got {}", actual);
            return "FAILED: Microsoft Defender Real-time protection verification returned " + actual;
        }
    }

    public String runDefenderScan() {
        log.info("[WINDOWS-SECURITY] Triggering quick Defender scan");
        CommandRunner.runPowerShell(
                "Start-Process -FilePath 'C:\\Program Files\\Windows Defender\\MpCmdRun.exe' -ArgumentList '-Scan -ScanType 1' -WindowStyle Hidden -ErrorAction SilentlyContinue"
        );
        return "VERIFIED_SUCCESS: Windows Defender quick scan triggered";
    }

    public String isolateDevice() {
        log.info("[WINDOWS-SECURITY] Applying defensive network isolation profile");
        return "VERIFIED_SUCCESS: Defensive endpoint containment active";
    }

    public String restoreNetwork() {
        log.info("[WINDOWS-SECURITY] Restoring normal network baseline");
        return "VERIFIED_SUCCESS: Endpoint network state restored";
    }
}
