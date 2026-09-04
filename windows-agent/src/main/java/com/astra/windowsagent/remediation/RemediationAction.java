package com.astra.windowsagent.remediation;

public enum RemediationAction {
    // UI & Visual Controls
    SHOW_THREAT_ALERT,
    SHOW_MATRIX_OVERLAY,
    CLEAR_MATRIX,
    SIMULATE_WALLPAPER_HIJACK,
    SIMULATE_GHOST_TYPER,
    SHOW_TEST_ENFORCEMENT,

    // Safe Demo Attack Controls
    EXECUTE_SAFE_ATTACK,
    START_SAFE_ATTACK,
    STOP_SAFE_ATTACK,

    // Sandbox & File Remediation
    QUARANTINE_DEMO_FILE,
    QUARANTINE_TEST_FILE,
    RESTORE_DEMO_FILE,
    RESTORE_TEST_FILE,
    REMOVE_DEMO_ARTIFACTS,
    REMOVE_TEST_PERSISTENCE,

    // Process & Network Remediation
    STOP_DEMO_PROCESS,
    STOP_TEST_PROCESS,
    KILL_PROCESS,
    STOP_DEMO_LISTENER,
    STOP_TEST_LISTENER,
    STOP_TEST_EXFILTRATION,
    RESTORE_DEMO_REGISTRY,
    RESTORE_TEST_REGISTRY,

    // Windows Defensive Operations
    RESTORE_FIREWALL,
    ENABLE_DEFENDER_REALTIME,
    ENABLE_REALTIME,
    DISABLE_RDP,
    ISOLATE_DEVICE,
    RESTORE_NETWORK,
    FULL_DEFENDER_SCAN,

    // Lifecycle & Verification
    RECOVERY_STEP,
    FINAL_VERIFICATION,
    FINAL_RESOLUTION;

    public static RemediationAction fromString(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String clean = text.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        try {
            return RemediationAction.valueOf(clean);
        } catch (IllegalArgumentException e) {
            // Handle aliases
            return switch (clean) {
                case "SIMULATE_RANSOMWARE", "ASTRA_END_TO_END_SAFE_TEST" -> EXECUTE_SAFE_ATTACK;
                case "WALLPAPER_HIJACK", "SIMULATED_WALLPAPER" -> SIMULATE_WALLPAPER_HIJACK;
                case "GHOST_TYPER", "SIMULATED_GHOST_TYPER" -> SIMULATE_GHOST_TYPER;
                case "ENABLE_REALTIME_MONITORING" -> ENABLE_DEFENDER_REALTIME;
                default -> null;
            };
        }
    }
}
