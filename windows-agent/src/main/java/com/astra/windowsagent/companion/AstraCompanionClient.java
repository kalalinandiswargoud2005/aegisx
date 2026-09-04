package com.astra.windowsagent.companion;

import com.astra.windowsagent.dto.AstraOverlayEvent;
import com.astra.windowsagent.service.AstraEnforcerOverlay;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.ServerSocket;
import java.net.URI;
import java.net.URL;

@Slf4j
public class AstraCompanionClient {

    private final String ipcUrl;
    private final AstraEnforcerOverlay overlayRenderer = new AstraEnforcerOverlay();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile boolean running = true;
    private ServerSocket instanceLockSocket;

    public AstraCompanionClient(String ipcUrl) {
        this.ipcUrl = ipcUrl != null ? ipcUrl : "http://127.0.0.1:8082/api/v1/agent/ipc/overlay-stream";
    }

    public void start() {
        // Enforce single-instance companion per user session
        try {
            instanceLockSocket = new ServerSocket(58082, 0, java.net.InetAddress.getByName("127.0.0.1"));
        } catch (Exception e) {
            log.info("Another ASTRA UI Companion instance is already active. Exiting duplicate process.");
            return;
        }

        log.info("[COMPANION] ASTRA Desktop Session UI Companion active. Connecting to: {}", ipcUrl);

        Thread clientThread = new Thread(() -> {
            while (running) {
                try {
                    connectAndListen();
                } catch (Exception e) {
                    log.warn("Lost connection to ASTRA EDR Service ({}). Reconnecting in 3s...", e.getMessage());
                }

                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "AstraCompanionListener");

        clientThread.setDaemon(false);
        clientThread.start();
    }

    private void connectAndListen() throws Exception {
        URL url = URI.create(ipcUrl).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(0); // Infinite read timeout for SSE

        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new RuntimeException("HTTP " + responseCode + " from ASTRA Service");
        }

        log.info("Successfully connected to ASTRA EDR Windows Service IPC Bridge.");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            StringBuilder dataBuffer = new StringBuilder();

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("data:")) {
                    dataBuffer.append(line.substring(5).trim());
                } else if (line.isEmpty() && dataBuffer.length() > 0) {
                    processEventPayload(dataBuffer.toString());
                    dataBuffer.setLength(0);
                }
            }
        }
    }

    private void processEventPayload(String payload) {
        if ("ASTRA_EDR_SERVICE_ONLINE".equalsIgnoreCase(payload)) {
            log.info("Handshake acknowledged: ASTRA EDR Windows Service is online.");
            return;
        }

        try {
            AstraOverlayEvent event = objectMapper.readValue(payload, AstraOverlayEvent.class);
            log.info("[COMPANION-EVENT] type={}, target={}, incident={}", 
                    event.getType(), event.getTarget(), event.getIncidentId());

            if (event.getType() == null) return;

            switch (event.getType()) {
                case THREAT_ALERT:
                    overlayRenderer.renderThreatAlertGui(
                            event.getTarget(),
                            event.getIncidentId(),
                            event.getSeverity()
                    );
                    break;

                case SHOW_MATRIX_OVERLAY:
                case MATRIX_SHOW:
                    overlayRenderer.renderMatrixOverlayGui();
                    break;

                case CLEAR_MATRIX:
                case MATRIX_HIDE:
                    overlayRenderer.renderHideMatrixGui();
                    break;

                case WALLPAPER_HIJACK_SIMULATION:
                    overlayRenderer.renderWallpaperHijackGui(event.getIncidentId());
                    break;

                case GHOST_TYPER_SIMULATION:
                    overlayRenderer.renderGhostTyperGui(event.getIncidentId());
                    break;

                case IMMEDIATE_CONTAINMENT:
                    overlayRenderer.renderContainmentGui(
                            event.getTarget(),
                            event.getCommandType(),
                            event.getDetails()
                    );
                    break;

                case RECOVERY_STEP:
                    overlayRenderer.renderRecoveryStepGui(
                            event.getStepNumber() != null ? event.getStepNumber() : 1,
                            event.getTotalSteps() != null ? event.getTotalSteps() : 5,
                            event.getTarget(),
                            event.getDetails()
                    );
                    break;

                case FINAL_RESOLUTION:
                    overlayRenderer.renderFinalResolutionGui(
                            event.getTarget(),
                            event.getDetails()
                    );
                    break;

                case SAFE_TEST_ENFORCEMENT:
                    overlayRenderer.renderSafeTestEnforcementGui(event.getTarget(), event.getDetails());
                    break;

                case ENFORCEMENT:
                    overlayRenderer.renderRecoveryStepGui(1, 1, event.getCommandType(), event.getDetails());
                    break;

                default:
                    log.debug("Unhandled overlay event: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Failed to parse IPC overlay event payload: {}", payload, e);
        }
    }

    public void stop() {
        this.running = false;
    }
}
