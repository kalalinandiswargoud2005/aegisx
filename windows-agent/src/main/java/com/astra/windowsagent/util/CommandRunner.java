package com.astra.windowsagent.util;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@Slf4j
public class CommandRunner {

    @Getter
    public static class CommandResult {
        private final int exitCode;
        private final String stdout;
        private final String stderr;
        private final boolean timedOut;

        public CommandResult(int exitCode, String stdout, String stderr, boolean timedOut) {
            this.exitCode = exitCode;
            this.stdout = stdout != null ? stdout.trim() : "";
            this.stderr = stderr != null ? stderr.trim() : "";
            this.timedOut = timedOut;
        }

        public boolean isSuccess() {
            return exitCode == 0 && !timedOut;
        }

        public String getCombinedOutput() {
            if (stderr.isEmpty()) return stdout;
            if (stdout.isEmpty()) return stderr;
            return stdout + "\n" + stderr;
        }
    }

    public static String runPowerShell(String command) {
        return runPowerShellWithResult(command, 10).getStdout();
    }

    public static CommandResult runPowerShellWithResult(String command) {
        return runPowerShellWithResult(command, 10);
    }

    public static CommandResult runPowerShellWithResult(String command, int timeoutSeconds) {
        return executeProcess(new String[]{"powershell.exe", "-ExecutionPolicy", "Bypass", "-NoProfile", "-NonInteractive", "-Command", command}, timeoutSeconds);
    }

    public static String runCmd(String command) {
        return runCmdWithResult(command, 10).getStdout();
    }

    public static CommandResult runCmdWithResult(String command) {
        return runCmdWithResult(command, 10);
    }

    public static CommandResult runCmdWithResult(String command, int timeoutSeconds) {
        return executeProcess(new String[]{"cmd.exe", "/c", command}, timeoutSeconds);
    }

    public static boolean isRunningAsAdministrator() {
        try {
            CommandResult res = runPowerShellWithResult(
                    "([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)",
                    5
            );
            return "True".equalsIgnoreCase(res.getStdout());
        } catch (Exception e) {
            log.warn("Failed to check administrator privilege status: {}", e.getMessage());
            return false;
        }
    }

    private static CommandResult executeProcess(String[] commandParts, int timeoutSeconds) {
        StringBuilder stdoutBuilder = new StringBuilder();
        StringBuilder stderrBuilder = new StringBuilder();
        boolean timedOut = false;
        int exitCode = -1;

        try {
            ProcessBuilder builder = new ProcessBuilder(commandParts);
            Process process = builder.start();

            Thread stdoutReader = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        stdoutBuilder.append(line).append("\n");
                    }
                } catch (Exception ignored) {}
            });

            Thread stderrReader = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        stderrBuilder.append(line).append("\n");
                    }
                } catch (Exception ignored) {}
            });

            stdoutReader.setDaemon(true);
            stderrReader.setDaemon(true);
            stdoutReader.start();
            stderrReader.start();

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                log.warn("[COMMAND-TIMEOUT] Command timed out after {}s: {}", timeoutSeconds, String.join(" ", commandParts));
                timedOut = true;
                process.destroyForcibly();
            } else {
                exitCode = process.exitValue();
            }

            stdoutReader.join(1000);
            stderrReader.join(1000);

        } catch (Exception e) {
            log.error("[COMMAND-FAILED] Execution failed for command: {}", String.join(" ", commandParts), e);
            stderrBuilder.append(e.getMessage());
        }

        return new CommandResult(exitCode, stdoutBuilder.toString(), stderrBuilder.toString(), timedOut);
    }
}
