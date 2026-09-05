package com.astra.windowsagent.remediation;

public enum RemediationAction {
    // UI & Visual Controls
    SHOW_THREAT_ALERT,
    SHOW_MATRIX_OVERLAY,
    CLEAR_MATRIX,
    SIMULATE_WALLPAPER_HIJACK,
    SIMULATE_GHOST_TYPER,
    SHOW_TEST_ENFORCEMENT,
    SHOW_HACKER_SKULL,
    SHOW_RADAR_BEACON,
    SHOW_GLITCH_BREACH,
    SHOW_HEX_SHIELD,
    SHOW_EMERGENCY_STROBE,
    SHOW_CLEAN_VICTORY,

    // Safe Demo Attack Controls
    EXECUTE_SAFE_ATTACK,
    START_SAFE_ATTACK,
    STOP_SAFE_ATTACK,
    SIMULATE_DARKSIDE_PAYLOAD,
    SIMULATE_STEALTH_RAT,

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
    SNIPE_ROGUE_WINDOW,
    CLOSE_ROGUE_WINDOW,
    LOCK_WORKSTATION,
    LOCK_ENDPOINT,
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
    FINAL_RESOLUTION,

    // Dynamic Remote Agent Management & OTA Updates
    RESTART_AGENT,
    UPDATE_AGENT;

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
                case "SIMULATE_RANSOMWARE", "ASTRA_END_TO_END_SAFE_TEST", "DARKSIDE_PAYLOAD", "STEALTH_RAT_BACKDOOR" -> EXECUTE_SAFE_ATTACK;
                case "WALLPAPER_HIJACK", "SIMULATED_WALLPAPER", "HACKER_WALLPAPER" -> SHOW_HACKER_SKULL;
                case "GHOST_TYPER", "SIMULATED_GHOST_TYPER" -> SIMULATE_GHOST_TYPER;
                case "ENABLE_REALTIME_MONITORING" -> ENABLE_DEFENDER_REALTIME;
                case "TERMINATE_ROGUE_WINDOW", "CLOSE_WINDOW", "KILL_WINDOW" -> SNIPE_ROGUE_WINDOW;
                case "LOCK_SCREEN", "LOCK_DESKTOP", "LOCK_DEVICE" -> LOCK_WORKSTATION;
                case "CYBER_GLITCH", "GLITCH_OVERLAY" -> SHOW_GLITCH_BREACH;
                case "RADAR_BEACON", "NETWORK_RADAR" -> SHOW_RADAR_BEACON;
                case "HEX_SHIELD", "DEFENSE_SHIELD" -> SHOW_HEX_SHIELD;
                case "EMERGENCY_STROBE", "RED_ALERT" -> SHOW_EMERGENCY_STROBE;
                case "CLEAN_VICTORY", "VERIFIED_VICTORY" -> SHOW_CLEAN_VICTORY;
                case "RESTART", "RELOAD_AGENT", "RESTART_SERVICE" -> RESTART_AGENT;
                case "UPDATE", "UPGRADE_AGENT", "OTA_UPDATE", "SYNC_FEATURES", "UPDATE_FEATURES" -> UPDATE_AGENT;
                default -> null;
            };
        }
    }
}
