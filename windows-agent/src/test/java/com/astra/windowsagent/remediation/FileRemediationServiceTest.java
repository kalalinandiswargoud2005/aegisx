package com.astra.windowsagent.remediation;

import org.junit.jupiter.api.Test;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

public class FileRemediationServiceTest {

    private final FileRemediationService service = new FileRemediationService();

    @Test
    void testSandboxPathValidation() {
        // Valid sandbox paths
        assertTrue(service.isSafeSandboxPath(Paths.get("C:\\Astra\\Demo\\INC-001\\attack\\file.txt")));
        assertTrue(service.isSafeSandboxPath(Paths.get("C:\\Astra\\Demo\\baseline\\passwords.txt")));
        assertTrue(service.isSafeSandboxPath(Paths.get("C:\\Astra\\Demo\\recovery\\financials.txt.quarantine")));

        // Invalid paths outside C:\Astra\Demo
        assertFalse(service.isSafeSandboxPath(Paths.get("C:\\Windows\\System32\\cmd.exe")));
        assertFalse(service.isSafeSandboxPath(Paths.get("C:\\Users\\Administrator\\Desktop\\file.txt")));
        assertFalse(service.isSafeSandboxPath(Paths.get("C:\\Astra\\Demo\\..\\..\\Windows\\System32")));
        assertFalse(service.isSafeSandboxPath(null));
    }

    @Test
    void testQuarantineRejectsPathOutsideSandbox() {
        String result = service.quarantineDemoFile("C:\\Windows\\System32\\notepad.exe", "INC-TEST");
        assertTrue(result.startsWith("FAILED: Path safety violation"));
    }
}
