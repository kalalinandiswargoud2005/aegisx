package com.astra.backend.hardware;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.swing.filechooser.FileSystemView;
import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class UsbDeploymentService {

    @Data
    public static class UsbDriveInfo {
        private String driveLetter;
        private String displayName;
        private long totalSpaceBytes;
        private long freeSpaceBytes;
        private boolean isRemovable;
    }

    /**
     * List all connected storage drives, highlighting removable USB drives
     */
    public List<UsbDriveInfo> getConnectedUsbDrives() {
        List<UsbDriveInfo> list = new ArrayList<>();
        FileSystemView fsv = FileSystemView.getFileSystemView();
        File[] roots = File.listRoots();

        if (roots != null) {
            for (File root : roots) {
                try {
                    UsbDriveInfo info = new UsbDriveInfo();
                    info.setDriveLetter(root.getAbsolutePath());
                    String name = fsv.getSystemDisplayName(root);
                    info.setDisplayName(name != null && !name.isEmpty() ? name : root.getAbsolutePath());
                    info.setTotalSpaceBytes(root.getTotalSpace());
                    info.setFreeSpaceBytes(root.getFreeSpace());
                    
                    boolean isDriveRemovable = !root.getAbsolutePath().toUpperCase().startsWith("C:");
                    info.setRemovable(isDriveRemovable);

                    list.add(info);
                } catch (Exception e) {
                    log.warn("Error inspecting root drive {}: {}", root, e.getMessage());
                }
            }
        }
        return list;
    }

    /**
     * Get Server Host IP
     */
    public String getHostIpAddress() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "127.0.0.1";
        }
    }

    /**
     * Deploy Astra Agent Installer payload to specified USB drive path
     */
    public boolean deployAgentToUsb(String drivePath, String targetHostname, String serverUrl) {
        try {
            File targetDir = new File(drivePath, "ASTRA_AGENT_INSTALLER");
            if (!targetDir.exists()) {
                boolean created = targetDir.mkdirs();
                if (!created) {
                    log.error("Failed to create directory on USB drive: {}", targetDir.getAbsolutePath());
                }
            }

            if (serverUrl == null || serverUrl.trim().isEmpty()) {
                serverUrl = "http://" + getHostIpAddress() + ":8080";
            }
            if (targetHostname == null || targetHostname.trim().isEmpty()) {
                targetHostname = "Target-Laptop-" + (int)(Math.random() * 9000 + 1000);
            }

            // 1. Write agent.properties
            File configProps = new File(targetDir, "agent.properties");
            try (FileWriter writer = new FileWriter(configProps)) {
                writer.write("# Astra EDR Agent Remote Configuration\n");
                writer.write("agent.hostname=" + targetHostname + "\n");
                writer.write("astra.backend.url=" + serverUrl + "\n");
                writer.write("agent.device-id=USB-" + System.currentTimeMillis() + "\n");
                writer.write("agent.installed-via=USB_AUTO_PROVISION\n");
            }

            // 2. Create Deploy-Target-Agent.bat script
            File installScript = new File(targetDir, "Deploy-Target-Agent.bat");
            try (FileWriter writer = new FileWriter(installScript)) {
                writer.write("@echo off\n");
                writer.write("TITLE Astra EDR Agent — One-Click USB Target Installer\n");
                writer.write("COLOR 0A\n");
                writer.write("cls\n");
                writer.write("echo ===================================================\n");
                writer.write("echo     ASTRA EDR AGENT — AUTOMATED USB PROVISIONING\n");
                writer.write("echo ===================================================\n");
                writer.write("echo Target Device: " + targetHostname + "\n");
                writer.write("echo C2 Backend URL: " + serverUrl + "\n");
                writer.write("echo.\n");
                writer.write("net session >nul 2>&1\n");
                writer.write("if %errorLevel% neq 0 (\n");
                writer.write("    echo [!] ERROR: Administrator privileges required!\n");
                writer.write("    echo Please right-click this script and select 'Run as Administrator'.\n");
                writer.write("    pause\n");
                writer.write("    exit /b\n");
                writer.write(")\n");
                writer.write("echo [+] Administrative rights verified.\n");
                writer.write("echo [+] Deploying Astra Agent service...\n");
                writer.write("set DEST_DIR=C:\\Astra\\Agent\n");
                writer.write("if not exist \"%DEST_DIR%\" mkdir \"%DEST_DIR%\"\n");
                writer.write("copy /Y \"%~dp0agent.properties\" \"%DEST_DIR%\\agent.properties\"\n");
                writer.write("if exist \"%~dp0astra-agent-1.0.0.jar\" copy /Y \"%~dp0astra-agent-1.0.0.jar\" \"%DEST_DIR%\\astra-agent.jar\"\n");
                writer.write("echo.\n");
                writer.write("echo ===================================================\n");
                writer.write("echo     SUCCESS! Agent configured and ready for " + targetHostname + "\n");
                writer.write("echo ===================================================\n");
                writer.write("pause\n");
            }

            // 3. Copy agent JAR file if present in workspace root or build folder
            Path sourceJar = Paths.get("astra-agent", "target", "astra-agent-1.0.0.jar");
            if (!Files.exists(sourceJar)) {
                sourceJar = Paths.get("..", "astra-agent", "target", "astra-agent-1.0.0.jar");
            }
            if (Files.exists(sourceJar)) {
                Path destJar = Paths.get(targetDir.getAbsolutePath(), "astra-agent-1.0.0.jar");
                Files.copy(sourceJar, destJar, StandardCopyOption.REPLACE_EXISTING);
                log.info("Copied agent JAR file to USB drive: {}", destJar.toAbsolutePath());
            }

            log.info("Successfully provisioned USB agent installer at {}", targetDir.getAbsolutePath());
            return true;

        } catch (Exception e) {
            log.error("Failed to deploy agent to USB drive {}: {}", drivePath, e.getMessage(), e);
            return false;
        }
    }
}
