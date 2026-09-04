package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupMonitor {

    private final ThreatDispatcher dispatcher;

    @Scheduled(fixedRateString = "${agent.monitor.rate:60000}")
    public void check() {
        // Startup programs polling; real-time startup monitoring handled by FileSystemMonitor
    }
}
