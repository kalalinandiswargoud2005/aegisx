package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.util.HexFormat;

@Slf4j
@Component
@RequiredArgsConstructor
public class HostsMonitor {

    private final ThreatDispatcher dispatcher;
    private static final String HOSTS_PATH = System.getenv("SystemRoot") != null 
            ? System.getenv("SystemRoot") + "\\System32\\drivers\\etc\\hosts" 
            : "C:\\Windows\\System32\\drivers\\etc\\hosts";

    private String lastHostsHash = "";

    @PostConstruct
    public void init() {
        lastHostsHash = computeHostsHash();
        log.info("Initialized hosts file baseline hash: {}", lastHostsHash);
    }

    @Scheduled(fixedRateString = "${agent.monitors.hosts-rate:${agent.monitors.rate:1500}}")
    public void check() {
        try {
            String currentHash = computeHostsHash();
            if (!currentHash.isEmpty() && !lastHostsHash.isEmpty() && !currentHash.equals(lastHostsHash)) {
                log.warn("Windows hosts file was modified/tampered!");
                dispatcher.dispatch("HostsFileChanged", "Windows hosts file modification detected (DNS Hijack vector)");
                lastHostsHash = currentHash;
            }
        } catch (Exception e) {
            log.error("Failed to check hosts file integrity", e);
        }
    }

    private String computeHostsHash() {
        try {
            File hostsFile = new File(HOSTS_PATH);
            if (hostsFile.exists()) {
                byte[] bytes = Files.readAllBytes(hostsFile.toPath());
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(bytes);
                return HexFormat.of().formatHex(hash);
            }
        } catch (Exception e) {
            log.error("Failed to read hosts file hash", e);
        }
        return "";
    }
}
