package com.astra.windowsagent.util;

import lombok.extern.slf4j.Slf4j;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Slf4j
public class CommandRunner {

    public static String runPowerShell(String command) {
        return runCommand("powershell.exe", "-ExecutionPolicy", "Bypass", "-NoProfile", "-Command", command);
    }
    
    public static String runCmd(String command) {
        return runCommand("cmd.exe", "/c", command);
    }

    private static String runCommand(String... commandParts) {
        StringBuilder output = new StringBuilder();
        try {
            ProcessBuilder builder = new ProcessBuilder(commandParts);
            builder.redirectErrorStream(true);
            Process process = builder.start();
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            process.waitFor();
        } catch (Exception e) {
            log.error("Command execution failed", e);
        }
        return output.toString().trim();
    }
}
