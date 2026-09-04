package com.astra.windowsagent.service;

import com.astra.windowsagent.dto.DeviceCommandDto;
import com.astra.windowsagent.remediation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class RemediationExecutorTest {

    private AstraEnforcerOverlay overlay;
    private FileRemediationService fileService;
    private ProcessRemediationService processService;
    private NetworkRemediationService networkService;
    private WindowsSecurityService windowsSecurityService;
    private DemoSimulationService demoSimulationService;
    private VerificationService verificationService;
    private RemediationExecutor executor;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        overlay = mock(AstraEnforcerOverlay.class);
        fileService = mock(FileRemediationService.class);
        processService = mock(ProcessRemediationService.class);
        networkService = mock(NetworkRemediationService.class);
        windowsSecurityService = mock(WindowsSecurityService.class);
        demoSimulationService = mock(DemoSimulationService.class);
        verificationService = mock(VerificationService.class);

        executor = new RemediationExecutor(
                overlay,
                fileService,
                processService,
                networkService,
                windowsSecurityService,
                demoSimulationService,
                verificationService
        );
    }

    @Test
    void testRejectsArbitraryCommandExecution() throws Exception {
        UUID cmdId = UUID.randomUUID();
        UUID incId = UUID.randomUUID();

        DeviceCommandDto cmd = DeviceCommandDto.builder()
                .id(cmdId)
                .commandType("RUN_POWERSHELL")
                .target("Get-Process")
                .incidentId(incId)
                .deviceId("test-dev")
                .build();

        String result = executor.execute(cmd);
        JsonNode json = objectMapper.readTree(result);

        assertEquals("REJECTED", json.get("status").asText());
        assertEquals("FAILED", json.get("verification").asText());
        assertTrue(json.get("message").asText().contains("REJECTED_UNSUPPORTED_COMMAND"));
    }

    @Test
    void testExecutesTypedRdpRemediationWithVerification() throws Exception {
        when(windowsSecurityService.disableRdp()).thenReturn("VERIFIED_SUCCESS: Remote Desktop disabled (fDenyTSConnections = 1)");

        UUID cmdId = UUID.randomUUID();
        UUID incId = UUID.randomUUID();

        DeviceCommandDto cmd = DeviceCommandDto.builder()
                .id(cmdId)
                .commandType("DISABLE_RDP")
                .incidentId(incId)
                .deviceId("test-dev")
                .build();

        String result = executor.execute(cmd);
        JsonNode json = objectMapper.readTree(result);

        assertEquals("COMPLETED", json.get("status").asText());
        assertEquals("SUCCESS", json.get("verification").asText());
        verify(windowsSecurityService, times(1)).disableRdp();
    }

    @Test
    void testCommandIdempotency() throws Exception {
        when(windowsSecurityService.restoreFirewall()).thenReturn("VERIFIED_SUCCESS: Windows Firewall restored");

        UUID cmdId = UUID.randomUUID();
        UUID incId = UUID.randomUUID();

        DeviceCommandDto cmd = DeviceCommandDto.builder()
                .id(cmdId)
                .commandType("RESTORE_FIREWALL")
                .incidentId(incId)
                .deviceId("test-dev")
                .build();

        String result1 = executor.execute(cmd);
        String result2 = executor.execute(cmd);

        assertEquals(result1, result2);
        // Only executed once by the underlying service
        verify(windowsSecurityService, times(1)).restoreFirewall();
    }

    @Test
    void testSafeDemoAttackInvocation() throws Exception {
        when(demoSimulationService.executeSimulatedRansomware(anyString()))
                .thenReturn("VERIFIED_SUCCESS: Simulated ransomware executed");

        UUID cmdId = UUID.randomUUID();
        UUID incId = UUID.randomUUID();

        DeviceCommandDto cmd = DeviceCommandDto.builder()
                .id(cmdId)
                .commandType("EXECUTE_SAFE_ATTACK")
                .target("SIMULATED_RANSOMWARE")
                .incidentId(incId)
                .deviceId("test-dev")
                .build();

        String result = executor.execute(cmd);
        JsonNode json = objectMapper.readTree(result);

        assertEquals("COMPLETED", json.get("status").asText());
        assertEquals("SUCCESS", json.get("verification").asText());
        verify(demoSimulationService, times(1)).executeSimulatedRansomware(incId.toString());
    }
}
