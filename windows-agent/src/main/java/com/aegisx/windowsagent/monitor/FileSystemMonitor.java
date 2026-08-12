package com.aegisx.windowsagent.monitor;

import com.aegisx.windowsagent.dispatcher.ThreatDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileSystemMonitor {

    private final ThreatDispatcher dispatcher;
    private final Random random = new Random();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PostConstruct
    public void init() {
        executor.submit(this::watchStartupFolder);
    }

    private void watchStartupFolder() {
        try {
            String appData = System.getenv("APPDATA");
            if (appData == null) {
                log.warn("APPDATA environment variable not found. Cannot monitor startup folder.");
                return;
            }
            Path startupPath = Paths.get(appData, "Microsoft\\Windows\\Start Menu\\Programs\\Startup");
            
            if (!Files.exists(startupPath)) {
                log.warn("Startup path does not exist: {}", startupPath);
                return;
            }

            WatchService watchService = FileSystems.getDefault().newWatchService();
            startupPath.register(watchService, StandardWatchEventKinds.ENTRY_CREATE);

            log.info("Monitoring Startup folder: {}", startupPath);

            while (!Thread.currentThread().isInterrupted()) {
                WatchKey key = watchService.take();
                for (WatchEvent<?> event : key.pollEvents()) {
                    if (event.kind() == StandardWatchEventKinds.ENTRY_CREATE) {
                        Path filename = (Path) event.context();
                        String name = filename.toString().toLowerCase();
                        if (name.endsWith(".bat") || name.endsWith(".exe") || name.endsWith(".vbs") || name.endsWith(".ps1")) {
                            log.warn("Suspicious file created in Startup folder: {}", filename);
                            dispatcher.dispatch("SuspiciousStartup", "Suspicious file created in Startup: " + filename);
                        }
                    }
                }
                if (!key.reset()) {
                    break;
                }
            }
        } catch (Exception e) {
            log.error("FileSystemMonitor failed", e);
        }
    }
}
