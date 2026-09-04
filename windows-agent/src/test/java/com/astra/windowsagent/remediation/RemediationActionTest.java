package com.astra.windowsagent.remediation;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class RemediationActionTest {

    @Test
    void testFromStringValidActions() {
        assertEquals(RemediationAction.SHOW_THREAT_ALERT, RemediationAction.fromString("SHOW_THREAT_ALERT"));
        assertEquals(RemediationAction.SHOW_MATRIX_OVERLAY, RemediationAction.fromString("SHOW_MATRIX_OVERLAY"));
        assertEquals(RemediationAction.CLEAR_MATRIX, RemediationAction.fromString("CLEAR_MATRIX"));
        assertEquals(RemediationAction.QUARANTINE_DEMO_FILE, RemediationAction.fromString("QUARANTINE_DEMO_FILE"));
        assertEquals(RemediationAction.RESTORE_DEMO_FILE, RemediationAction.fromString("RESTORE_DEMO_FILE"));
        assertEquals(RemediationAction.DISABLE_RDP, RemediationAction.fromString("DISABLE_RDP"));
        assertEquals(RemediationAction.RESTORE_FIREWALL, RemediationAction.fromString("RESTORE_FIREWALL"));
        assertEquals(RemediationAction.ENABLE_DEFENDER_REALTIME, RemediationAction.fromString("ENABLE_DEFENDER_REALTIME"));
        assertEquals(RemediationAction.FINAL_VERIFICATION, RemediationAction.fromString("FINAL_VERIFICATION"));
    }

    @Test
    void testFromStringAliases() {
        assertEquals(RemediationAction.EXECUTE_SAFE_ATTACK, RemediationAction.fromString("SIMULATE_RANSOMWARE"));
        assertEquals(RemediationAction.SIMULATE_WALLPAPER_HIJACK, RemediationAction.fromString("WALLPAPER_HIJACK"));
        assertEquals(RemediationAction.SIMULATE_GHOST_TYPER, RemediationAction.fromString("GHOST_TYPER"));
    }

    @Test
    void testArbitraryCommandsBlocked() {
        // Arbitrary command strings must return null (blocked from execution)
        assertNull(RemediationAction.fromString("RUN_CMD"));
        assertNull(RemediationAction.fromString("RUN_POWERSHELL"));
        assertNull(RemediationAction.fromString("EXECUTE_COMMAND"));
        assertNull(RemediationAction.fromString("EXECUTE_DYNAMIC_SCRIPT"));
        assertNull(RemediationAction.fromString("calc.exe"));
        assertNull(RemediationAction.fromString("whoami"));
    }
}
