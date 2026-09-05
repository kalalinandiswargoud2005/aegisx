package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.*;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileSystemMonitor {

    private final ThreatDispatcher dispatcher;
    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private final Set<String> knownEncryptedFiles = new HashSet<>();

    @PostConstruct
    public void init() {
        executor.submit(this::watchStartupFolder);
    }

    private void watchStartupFolder() {
        try {
            String appData = System.getenv("APPDATA");
            if (appData == null) {
                log.warn("[FILE-MONITOR] APPDATA environment variable not found. Startup folder watch skipped.");
                return;
            }
            Path startupPath = Paths.get(appData, "Microsoft\\Windows\\Start Menu\\Programs\\Startup");

            if (!Files.exists(startupPath)) {
                return;
            }

            WatchService watchService = FileSystems.getDefault().newWatchService();
            startupPath.register(watchService, StandardWatchEventKinds.ENTRY_CREATE);
            log.info("[FILE-MONITOR] Monitoring Startup folder: {}", startupPath);

            while (!Thread.currentThread().isInterrupted()) {
                WatchKey key = watchService.take();
                for (WatchEvent<?> event : key.pollEvents()) {
                    if (event.kind() == StandardWatchEventKinds.ENTRY_CREATE) {
                        Path filename = (Path) event.context();
                        String name = filename.toString().toLowerCase();
                        if (name.endsWith(".bat") || name.endsWith(".exe") || name.endsWith(".vbs") || name.endsWith(".ps1")) {
                            log.warn("[FILE-MONITOR] Suspicious file created in Startup folder: {}", filename);
                            dispatcher.dispatch("SuspiciousStartup", "Suspicious file created in Startup: " + filename);
                        }
                    }
                }
                if (!key.reset()) break;
            }
        } catch (Exception e) {
            log.debug("[FILE-MONITOR] Startup watcher stopped: {}", e.getMessage());
        }
    }

    /**
     * Periodic scan across C:\Astra\Demo to guarantee subdirectories (like INC-xxxx\attack)
     * are reliably detected even if native non-recursive WatchService misses them.
     */
    @Scheduled(fixedRate = 1000)
    public void scanDemoSandbox() {
        try {
            Path demoBase = Paths.get("C:\\Astra\\Demo");
            if (!Files.exists(demoBase)) {
                return;
            }

            File[] incidentDirs = demoBase.toFile().listFiles(File::isDirectory);
            if (incidentDirs == null) return;

            Set<String> currentEncrypted = new HashSet<>();

            for (File incDir : incidentDirs) {
                File attackDir = new File(incDir, "attack");
                if (attackDir.exists() && attackDir.isDirectory()) {
                    File[] encFiles = attackDir.listFiles((d, name) -> name.endsWith(".encrypted"));
                    if (encFiles != null) {
                        for (File ef : encFiles) {
                            String pathStr = ef.getAbsolutePath();
                            currentEncrypted.add(pathStr);
                            if (!knownEncryptedFiles.contains(pathStr)) {
                                log.warn("[FILE-MONITOR] Autonomous detection: Encrypted demo file found: {}", ef.getName());
                                dispatcher.dispatch("SimulatedRansomware", "Ransomware encryption detected in sandbox: " + ef.getName());
                            }
                        }
                    }
                }
            }

            knownEncryptedFiles.clear();
            knownEncryptedFiles.addAll(currentEncrypted);

        } catch (Exception e) {
            log.debug("[FILE-MONITOR] Sandbox scan exception: {}", e.getMessage());
        }
    }
}
