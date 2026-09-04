package com.astra.windowsagent.monitor;

import com.astra.windowsagent.dispatcher.ThreatDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VPNMonitor {

    private final ThreatDispatcher dispatcher;

    @Scheduled(fixedRateString = "${agent.monitor.rate:60000}")
    public void check() {
        // VPN interface monitoring; mock anomalies disabled
    }
}
