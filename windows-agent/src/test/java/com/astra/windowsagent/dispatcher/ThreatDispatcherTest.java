package com.astra.windowsagent.dispatcher;

import com.astra.windowsagent.communication.EventSender;
import com.astra.windowsagent.service.AstraEnforcerOverlay;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class ThreatDispatcherTest {

    private EventSender eventSender;
    private AstraEnforcerOverlay overlay;
    private ThreatDispatcher dispatcher;

    @BeforeEach
    void setUp() {
        eventSender = mock(EventSender.class);
        overlay = mock(AstraEnforcerOverlay.class);
        dispatcher = new ThreatDispatcher(eventSender, overlay);
        dispatcher.init();
    }

    @Test
    void testDispatchTriggersLocalAlertAndEventSender() {
        dispatcher.dispatch("SimulatedRansomware", "Ransomware encryption detected in sandbox");

        verify(overlay, times(1)).showThreatAlert(eq("SimulatedRansomware"), anyString(), eq("HIGH"));
        verify(eventSender, times(1)).sendEvent(eq("THREAT-001"), eq("Ransomware encryption detected in sandbox"));
    }

    @Test
    void testDeduplicationSuppressesRapidDuplicateEvents() {
        dispatcher.dispatch("FirewallDisabled", "Firewall turned off");
        dispatcher.dispatch("FirewallDisabled", "Firewall turned off duplicate");

        // First call goes through; duplicate within 5s is suppressed
        verify(overlay, times(1)).showThreatAlert(eq("FirewallDisabled"), anyString(), eq("HIGH"));
        verify(eventSender, times(1)).sendEvent(eq("THREAT-2026-018"), anyString());
    }
}
