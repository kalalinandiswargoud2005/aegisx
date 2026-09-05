package com.astra.windowsagent.service;

import com.astra.windowsagent.dto.AstraOverlayEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

@Slf4j
@Service
public class AstraEnforcerOverlay {

    private JFrame matrixFrame;

    @Autowired(required = false)
    private OverlayIpcService ipcService;

    // ==========================================
    // IPC Dispatch Methods
    // ==========================================

    public void showThreatAlert(String threatName) {
        showThreatAlert(threatName, "INC-2026-" + System.currentTimeMillis() % 10000, "CRITICAL");
    }

    public void showThreatAlert(String threatName, String incidentId, String severity) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.THREAT_ALERT)
                    .target(threatName)
                    .incidentId(incidentId)
                    .severity(severity != null ? severity : "CRITICAL")
                    .details("Autonomous threat detection triggered on endpoint")
                    .build());
        }

        if (!GraphicsEnvironment.isHeadless()) {
            renderThreatAlertGui(threatName, incidentId, severity);
        } else {
            log.info("[SESSION-0/HEADLESS] Dispatched THREAT_ALERT overlay event via local IPC.");
        }
    }

    public void showMatrixOverlay() {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.SHOW_MATRIX_OVERLAY)
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderMatrixOverlayGui();
        }
    }

    public void hideMatrixOverlay() {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.CLEAR_MATRIX)
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderHideMatrixGui();
        }
    }

    public void showWallpaperHijackSimulation(String incidentId) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.WALLPAPER_HIJACK_SIMULATION)
                    .incidentId(incidentId)
                    .target("Desktop Configuration")
                    .details("Simulated wallpaper modification blocked by ASTRA EDR")
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderWallpaperHijackGui(incidentId);
        }
    }

    public void showGhostTyperSimulation(String incidentId) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.GHOST_TYPER_SIMULATION)
                    .incidentId(incidentId)
                    .target("Interactive User Session")
                    .details("Simulated unauthorized keystroke injection contained")
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderGhostTyperGui(incidentId);
        }
    }

    public void showImmediateContainment(String threatName, String action, String status) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.IMMEDIATE_CONTAINMENT)
                    .target(threatName)
                    .details(action + " -> " + status)
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderContainmentGui(threatName, action, status);
        }
    }

    public void showRecoveryStep(int stepNum, int totalSteps, String title, String status) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.RECOVERY_STEP)
                    .stepNumber(stepNum)
                    .totalSteps(totalSteps)
                    .target(title)
                    .details(status)
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderRecoveryStepGui(stepNum, totalSteps, title, status);
        }
    }

    public void showFinalResolution(String threatName, String message) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.FINAL_RESOLUTION)
                    .target(threatName)
                    .details(message)
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderFinalResolutionGui(threatName, message);
        }
    }

    public void showSafeTestEnforcement(String threatName, String details) {
        if (ipcService != null) {
            ipcService.publishEvent(AstraOverlayEvent.builder()
                    .type(AstraOverlayEvent.EventType.SAFE_TEST_ENFORCEMENT)
                    .commandType("SHOW_TEST_ENFORCEMENT")
                    .target(threatName != null ? threatName : "Test Security Event")
                    .details(details != null ? details : "SAFE TEST RESPONSE RECEIVED")
                    .build());
        }
        if (!GraphicsEnvironment.isHeadless()) {
            renderSafeTestEnforcementGui(threatName, details);
        }
    }

    // ==========================================
    // Interactive Swing GUI Rendering Routines
    // ==========================================

    public void renderThreatAlertGui(String threatName) {
        renderThreatAlertGui(threatName, "INC-2026-" + System.currentTimeMillis() % 10000, "CRITICAL");
    }

    public void renderThreatAlertGui(String threatName, String incidentId, String severity) {
        showCornerToast(
                "🚨 ASTRA EDR • THREAT DETECTED",
                threatName != null ? threatName : "Malicious Activity Detected",
                "Severity: " + (severity != null ? severity : "CRITICAL") + " • Containment Active",
                "Incident: " + (incidentId != null ? incidentId : "INC-ALERT"),
                new Color(255, 65, 65),
                new Color(22, 10, 15),
                8000,
                null,
                null
        );
    }

    /**
     * Renders a sleek, modern, non-intrusive bottom-right corner chat/toast notification on the target laptop screen.
     */
    public void showCornerToast(String badgeText, String titleText, int autoCloseMs, Color accentColor) {
        showCornerToast(badgeText, titleText, "ASTRA Autonomous Security Agent", "Telemetry & Endpoint Engine", accentColor, new Color(10, 15, 25), autoCloseMs, null, null);
    }

    public void showCornerToast(
            String badgeText,
            String titleText,
            String subText,
            String extraDetails,
            Color accentColor,
            Color bgColor,
            int autoCloseMs,
            Integer progressValue,
            Integer progressMax
    ) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                Toolkit.getDefaultToolkit().beep();

                GraphicsConfiguration gc = GraphicsEnvironment.getLocalGraphicsEnvironment()
                        .getDefaultScreenDevice().getDefaultConfiguration();
                Rectangle screenBounds = gc.getBounds();
                Insets insets = Toolkit.getDefaultToolkit().getScreenInsets(gc);

                int cardWidth = 420;
                int cardHeight = (progressValue != null) ? 170 : 145;

                int x = screenBounds.x + screenBounds.width - insets.right - cardWidth - 20;
                int y = screenBounds.y + screenBounds.height - insets.bottom - cardHeight - 20;

                JFrame frame = new JFrame();
                frame.setUndecorated(true);
                frame.setSize(cardWidth, cardHeight);
                frame.setLocation(x, y);
                frame.setAlwaysOnTop(true);
                frame.setFocusableWindowState(false); // Non-intrusive: never steals keyboard focus

                JPanel mainPanel = new JPanel(new BorderLayout());
                mainPanel.setBackground(bgColor);
                mainPanel.setBorder(BorderFactory.createCompoundBorder(
                        BorderFactory.createLineBorder(accentColor, 2),
                        BorderFactory.createEmptyBorder(8, 12, 8, 12)
                ));

                // 1. Top Header Bar
                JPanel topBar = new JPanel(new BorderLayout(8, 0));
                topBar.setOpaque(false);

                JLabel titleLabel = new JLabel(badgeText);
                titleLabel.setFont(new Font("Consolas", Font.BOLD, 13));
                titleLabel.setForeground(accentColor);
                topBar.add(titleLabel, BorderLayout.WEST);

                JPanel topRightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 4, 0));
                topRightPanel.setOpaque(false);

                JButton closeBtn = new JButton("✕");
                closeBtn.setFont(new Font("Consolas", Font.BOLD, 12));
                closeBtn.setForeground(new Color(180, 180, 180));
                closeBtn.setBackground(new Color(0, 0, 0, 0));
                closeBtn.setBorder(BorderFactory.createEmptyBorder(0, 4, 0, 4));
                closeBtn.setContentAreaFilled(false);
                closeBtn.setFocusPainted(false);
                closeBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
                closeBtn.addActionListener(e -> frame.dispose());
                topRightPanel.add(closeBtn);

                topBar.add(topRightPanel, BorderLayout.EAST);
                mainPanel.add(topBar, BorderLayout.NORTH);

                // 2. Center Content Area
                JPanel centerPanel = new JPanel(new GridLayout(progressValue != null ? 3 : 2, 1, 0, 4));
                centerPanel.setOpaque(false);
                centerPanel.setBorder(BorderFactory.createEmptyBorder(6, 0, 4, 0));

                JLabel nameLabel = new JLabel(titleText);
                nameLabel.setFont(new Font("Consolas", Font.BOLD, 14));
                nameLabel.setForeground(Color.WHITE);
                centerPanel.add(nameLabel);

                JLabel detailLabel = new JLabel(subText);
                detailLabel.setFont(new Font("Consolas", Font.PLAIN, 12));
                detailLabel.setForeground(new Color(200, 210, 225));
                centerPanel.add(detailLabel);

                if (progressValue != null && progressMax != null) {
                    JProgressBar pBar = new JProgressBar(0, progressMax);
                    pBar.setValue(progressValue);
                    pBar.setStringPainted(true);
                    pBar.setString("Progress: Step " + progressValue + " of " + progressMax);
                    pBar.setFont(new Font("Consolas", Font.BOLD, 11));
                    pBar.setForeground(accentColor);
                    pBar.setBackground(new Color(25, 30, 40));
                    pBar.setBorder(BorderFactory.createLineBorder(new Color(60, 70, 90), 1));
                    centerPanel.add(pBar);
                }

                mainPanel.add(centerPanel, BorderLayout.CENTER);

                // 3. Footer info
                JPanel footerPanel = new JPanel(new BorderLayout());
                footerPanel.setOpaque(false);

                String hostName = System.getenv("COMPUTERNAME") != null ? System.getenv("COMPUTERNAME") : "Endpoint";
                JLabel footerLabel = new JLabel("ASTRA EDR • Host: " + hostName + " • " + (extraDetails != null ? extraDetails : "Live Protection"));
                footerLabel.setFont(new Font("Consolas", Font.ITALIC, 10));
                footerLabel.setForeground(new Color(130, 145, 165));
                footerPanel.add(footerLabel, BorderLayout.WEST);

                mainPanel.add(footerPanel, BorderLayout.SOUTH);

                // Dismiss on click anywhere
                mainPanel.addMouseListener(new MouseAdapter() {
                    @Override
                    public void mouseClicked(MouseEvent e) {
                        frame.dispose();
                    }
                });

                frame.add(mainPanel);
                frame.setVisible(true);

                Timer autoClose = new Timer(autoCloseMs > 0 ? autoCloseMs : 7000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();

            } catch (Exception e) {
                log.error("Failed to render corner toast notification GUI", e);
            }
        });
    }

    public void renderMatrixOverlayGui() {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            if (matrixFrame != null && matrixFrame.isVisible()) {
                matrixFrame.toFront();
                matrixFrame.requestFocus();
                return;
            }
            try {
                matrixFrame = new JFrame("ASTRA EDR MATRIX CONTAINMENT HUD");
                matrixFrame.setUndecorated(true);
                matrixFrame.setExtendedState(JFrame.MAXIMIZED_BOTH);
                matrixFrame.setAlwaysOnTop(true);
                matrixFrame.setAutoRequestFocus(true);
                matrixFrame.setFocusableWindowState(true);
                matrixFrame.setBackground(new Color(0, 0, 0, 170));

                JPanel panel = new JPanel() {
                    @Override
                    protected void paintComponent(Graphics g) {
                        super.paintComponent(g);
                        int w = getWidth();
                        int h = getHeight();

                        // Dismiss banner
                        g.setColor(new Color(0, 255, 128, 240));
                        g.setFont(new Font("Consolas", Font.BOLD, 18));
                        g.drawString("⚡ [ ASTRA EDR THREAT SIMULATION & CONTAINMENT HUD — CLICK ANYWHERE OR PRESS ESC TO DISMISS ]", 50, 50);

                        // Matrix rain simulation
                        g.setColor(new Color(0, 255, 70));
                        g.setFont(new Font("Monospaced", Font.BOLD, 20));
                        for (int i = 0; i < 260; i++) {
                            int x = (int) (Math.random() * w);
                            int y = (int) (Math.random() * h);
                            char c = (char) (Math.random() * 94 + 33);
                            g.drawString(String.valueOf(c), x, y);
                        }
                    }
                };
                panel.setOpaque(false);

                panel.addMouseListener(new MouseAdapter() {
                    @Override
                    public void mouseClicked(MouseEvent e) {
                        renderHideMatrixGui();
                    }
                });

                matrixFrame.addKeyListener(new KeyAdapter() {
                    @Override
                    public void keyPressed(KeyEvent e) {
                        if (e.getKeyCode() == KeyEvent.VK_ESCAPE) {
                            renderHideMatrixGui();
                        }
                    }
                });

                matrixFrame.add(panel);
                matrixFrame.setVisible(true);
                matrixFrame.toFront();
                matrixFrame.requestFocus();

                Timer repaintTimer = new Timer(50, e -> {
                    if (matrixFrame != null && matrixFrame.isVisible()) {
                        panel.repaint();
                    }
                });
                repaintTimer.start();

                // Auto-close matrix after 20 seconds so desktop is never trapped
                Timer autoClose = new Timer(20000, e -> renderHideMatrixGui());
                autoClose.setRepeats(false);
                autoClose.start();

            } catch (Exception e) {
                log.error("Failed to render matrix overlay GUI", e);
            }
        });
    }

    public void renderWallpaperHijackGui(String incidentId) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                JFrame frame = new JFrame("ASTRA EDR — SIMULATED WALLPAPER HIJACK");
                frame.setUndecorated(true);
                frame.setAlwaysOnTop(true);
                frame.setSize(680, 320);

                Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
                int x = (screenSize.width - 680) / 2;
                int y = (screenSize.height - 320) / 2;
                frame.setLocation(x, y);

                JPanel panel = new JPanel(new BorderLayout());
                panel.setBackground(new Color(20, 10, 30));
                panel.setBorder(BorderFactory.createLineBorder(new Color(255, 80, 220), 3));

                JLabel header = new JLabel("  🛡️ ASTRA EDR — SIMULATED WALLPAPER HIJACK CONTAINED", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 15));
                header.setForeground(new Color(255, 80, 220));
                header.setPreferredSize(new Dimension(680, 42));
                header.setOpaque(true);
                header.setBackground(new Color(35, 15, 50));
                panel.add(header, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(20, 10, 30));
                textArea.setForeground(new Color(255, 160, 235));
                textArea.setFont(new Font("Consolas", Font.BOLD, 14));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(15, 20, 15, 20));

                String content = String.format("""
                        ┌────────────────────────────────────────────────────────┐
                        │                      ASTRA EDR                         │
                        │             SIMULATED WALLPAPER HIJACK                 │
                        ├────────────────────────────────────────────────────────┤
                        │  Detection : Suspicious Desktop Modification Attempt   │
                        │  Incident  : %-42s│
                        │  Response  : Autonomous Containment Active             │
                        ├────────────────────────────────────────────────────────┤
                        │  ✓ Simulated wallpaper modification BLOCKED            │
                        │  ✓ Original desktop state preserved                    │
                        └────────────────────────────────────────────────────────┘
                        """, incidentId != null ? incidentId : "INC-DEMO-002");

                textArea.setText(content);
                panel.add(new JScrollPane(textArea), BorderLayout.CENTER);
                frame.add(panel);
                frame.setVisible(true);
                frame.toFront();

                new Thread(() -> {
                    try {
                        Thread.sleep(6000);
                    } catch (InterruptedException ignored) {}
                    SwingUtilities.invokeLater(frame::dispose);
                }).start();

            } catch (Exception e) {
                log.error("Failed to render wallpaper hijack GUI", e);
            }
        });
    }

    public void renderGhostTyperGui(String incidentId) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                JFrame frame = new JFrame("ASTRA EDR — SIMULATED GHOST-TYPER");
                frame.setUndecorated(true);
                frame.setAlwaysOnTop(true);
                frame.setSize(680, 340);

                Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
                int x = (screenSize.width - 680) / 2;
                int y = (screenSize.height - 340) / 2;
                frame.setLocation(x, y);

                JPanel panel = new JPanel(new BorderLayout());
                panel.setBackground(new Color(10, 25, 35));
                panel.setBorder(BorderFactory.createLineBorder(new Color(0, 220, 255), 3));

                JLabel header = new JLabel("  ⚡ ASTRA EDR — SIMULATED ATTACK ACTIVITY", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 15));
                header.setForeground(new Color(0, 220, 255));
                header.setPreferredSize(new Dimension(680, 42));
                header.setOpaque(true);
                header.setBackground(new Color(15, 40, 60));
                panel.add(header, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(10, 25, 35));
                textArea.setForeground(new Color(100, 240, 255));
                textArea.setFont(new Font("Consolas", Font.BOLD, 14));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(15, 20, 15, 20));

                panel.add(new JScrollPane(textArea), BorderLayout.CENTER);
                frame.add(panel);
                frame.setVisible(true);
                frame.toFront();

                String[] stream = {
                        "ASTRA EDR\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
                        "SIMULATED ATTACK ACTIVITY DETECTED\n",
                        "Process  : SAFE-DEMO-PROCESS\n",
                        "Activity : Simulated unauthorized input stream\n",
                        "Incident : " + (incidentId != null ? incidentId : "INC-DEMO-003") + "\n",
                        "STATUS   : ⚠ DETECTED\n\n",
                        "ASTRA RESPONSE:\n",
                        "  [CONTAINMENT ENGINE ENGAGED]\n",
                        "  [STOPPING SIMULATION...]\n",
                        "  ✓ PROCESS CONTAINED & TERMINATED\n",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                };

                new Thread(() -> {
                    for (String chunk : stream) {
                        SwingUtilities.invokeLater(() -> textArea.append(chunk));
                        try {
                            Thread.sleep(300);
                        } catch (InterruptedException ignored) {}
                    }
                    try {
                        Thread.sleep(4000);
                    } catch (InterruptedException ignored) {}
                    SwingUtilities.invokeLater(frame::dispose);
                }).start();

            } catch (Exception e) {
                log.error("Failed to render ghost-typer GUI", e);
            }
        });
    }

    public void renderRecoveryStepGui(int stepNum, int totalSteps, String title, String status) {
        int maxSteps = totalSteps > 0 ? totalSteps : 5;
        showCornerToast(
                String.format("🔄 ASTRA RECOVERY • STEP %d/%d", stepNum, maxSteps),
                title != null ? title : "Remediation Playbook Step",
                "Status: SUCCESS • Verified On Endpoint",
                "Playbook Progress",
                new Color(0, 230, 140),
                new Color(10, 25, 20),
                8000,
                stepNum,
                maxSteps
        );
    }

    public void renderContainmentGui(String threatName, String action, String status) {
        showCornerToast(
                "⚡ ASTRA EDR • IMMEDIATE CONTAINMENT",
                threatName != null ? threatName : "Active Threat Vector",
                "Action: " + (action != null ? action : "Isolating Host & Freezing Process"),
                "Autonomous Containment Active",
                new Color(255, 165, 0),
                new Color(25, 18, 10),
                7000,
                null,
                null
        );
    }

    public void renderFinalResolutionGui(String threatName, String message) {
        renderHideMatrixGui();
        showCornerToast(
                "✅ ASTRA EDR • THREAT RESOLVED",
                threatName != null ? threatName : "Target Endpoint",
                "Status: Clean Baseline Confirmed • Secured",
                "All Playbooks Complete",
                new Color(0, 220, 255),
                new Color(10, 22, 35),
                9000,
                null,
                null
        );
    }

    public void renderSafeTestEnforcementGui(String threatName, String details) {
        showCornerToast(
                "🛡️ ASTRA EDR • SAFE TEST EVENT",
                threatName != null ? threatName : "Safe Verification Event",
                "Details: " + (details != null ? details : "Command executed successfully"),
                "Enforcement Pipeline Verified",
                new Color(0, 210, 255),
                new Color(12, 20, 32),
                6000,
                null,
                null
        );
    }

    public void showHackerSkull(String incidentId) {
        if (!GraphicsEnvironment.isHeadless()) {
            renderHackerSkullGui(incidentId);
        }
    }

    public void renderHackerSkullGui(String incidentId) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                Toolkit.getDefaultToolkit().beep();
                JFrame frame = new JFrame("ASTRA EDR — HACKER WALLPAPER HIJACK");
                frame.setUndecorated(true);
                frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
                frame.setAlwaysOnTop(true);
                frame.setAutoRequestFocus(true);
                frame.setFocusableWindowState(true);

                JPanel panel = new JPanel(new BorderLayout()) {
                    @Override
                    protected void paintComponent(Graphics g) {
                        super.paintComponent(g);
                        Graphics2D g2 = (Graphics2D) g;
                        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                        int w = getWidth();
                        int h = getHeight();

                        // Solid dark background
                        g2.setColor(new Color(5, 5, 12));
                        g2.fillRect(0, 0, w, h);

                        // Red hazard scanlines
                        g2.setColor(new Color(255, 0, 0, 40));
                        for (int y = 0; y < h; y += 8) {
                            g2.drawLine(0, y, w, y);
                        }

                        // Outer glowing red border
                        g2.setColor(new Color(255, 30, 30));
                        g2.setStroke(new BasicStroke(8));
                        g2.drawRect(10, 10, w - 20, h - 20);

                        // Top warning banner
                        g2.setColor(new Color(255, 40, 40));
                        g2.setFont(new Font("Consolas", Font.BOLD, 26));
                        String topBanner = "☠️  [ CRITICAL RANSOMWARE VECTOR DETECTED — ASTRA LIVE SANDBOX DEMO ]  ☠️";
                        FontMetrics fm = g2.getFontMetrics();
                        g2.drawString(topBanner, (w - fm.stringWidth(topBanner)) / 2, 70);

                        // ASCII Skull Art
                        String[] skull = {
                            "                 .ed\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"be.",
                            "               -\"           .            \"-",
                            "             .\"             !              \".",
                            "            /               !                \\",
                            "           /           /\\   !   /\\            \\",
                            "          |           /  \\  !  /  \\            |",
                            "          |          | () | ! | () |           |",
                            "          |           \\__/     \\__/            |",
                            "          |              <----->               |",
                            "           \\            |IIIIIII|             /",
                            "            \\           |IIIIIII|            /",
                            "             `.         \\_______/          .'",
                            "               \"-                         -\"",
                            "                 `\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"`"
                        };

                        g2.setColor(new Color(0, 255, 136));
                        g2.setFont(new Font("Monospaced", Font.BOLD, 20));
                        int skullY = h / 2 - 190;
                        for (String line : skull) {
                            int lineW = g2.getFontMetrics().stringWidth(line);
                            g2.drawString(line, (w - lineW) / 2, skullY);
                            skullY += 24;
                        }

                        // Threat message
                        g2.setColor(new Color(255, 70, 70));
                        g2.setFont(new Font("Consolas", Font.BOLD, 20));
                        String threatIdStr = "THREAT ID: " + (incidentId != null ? incidentId : "INC-DARKSIDE-09") + " [LIVE BREACH]";
                        int tIdW = g2.getFontMetrics().stringWidth(threatIdStr);
                        g2.drawString(threatIdStr, (w - tIdW) / 2, skullY + 30);

                        g2.setColor(Color.WHITE);
                        g2.setFont(new Font("Consolas", Font.BOLD, 17));
                        String alertMsg = "SANDBOX ARTIFACTS ENCRYPTED (C:\\Astra\\Demo) — REMEDIATE VIA ASTRA RECOVERY PLAYBOOK";
                        int alertW = g2.getFontMetrics().stringWidth(alertMsg);
                        g2.drawString(alertMsg, (w - alertW) / 2, skullY + 65);

                        g2.setColor(new Color(0, 220, 255));
                        g2.setFont(new Font("Consolas", Font.ITALIC, 14));
                        String dismissMsg = "[ PRESS ESC OR CLICK ANYWHERE TO DISMISS OVERLAY ]";
                        int disW = g2.getFontMetrics().stringWidth(dismissMsg);
                        g2.drawString(dismissMsg, (w - disW) / 2, h - 50);
                    }
                };
                panel.setOpaque(true);

                panel.addMouseListener(new MouseAdapter() {
                    @Override
                    public void mouseClicked(MouseEvent e) {
                        frame.dispose();
                    }
                });

                frame.addKeyListener(new KeyAdapter() {
                    @Override
                    public void keyPressed(KeyEvent e) {
                        if (e.getKeyCode() == KeyEvent.VK_ESCAPE) {
                            frame.dispose();
                        }
                    }
                });

                frame.add(panel);
                frame.setVisible(true);
                frame.toFront();
                frame.requestFocus();

                Timer autoClose = new Timer(15000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();
            } catch (Exception e) {
                log.error("Failed to render hacker skull GUI", e);
            }
        });
    }

    public void showGlitchBreach(String incidentId) {
        if (!GraphicsEnvironment.isHeadless()) {
            renderGlitchBreachGui(incidentId);
        }
    }

    public void renderGlitchBreachGui(String incidentId) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                Toolkit.getDefaultToolkit().beep();
                JFrame frame = new JFrame("ASTRA EDR — MEMORY CORRUPTION GLITCH");
                frame.setUndecorated(true);
                frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
                frame.setAlwaysOnTop(true);
                frame.setAutoRequestFocus(true);
                frame.setFocusableWindowState(true);

                JPanel panel = new JPanel() {
                    @Override
                    protected void paintComponent(Graphics g) {
                        super.paintComponent(g);
                        Graphics2D g2 = (Graphics2D) g;
                        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                        int w = getWidth();
                        int h = getHeight();

                        // Solid dark background
                        g2.setColor(new Color(15, 5, 25));
                        g2.fillRect(0, 0, w, h);

                        // Simulated scanlines and memory corruptions
                        g2.setColor(new Color(255, 0, 128, 120));
                        for (int y = 0; y < h; y += 10) {
                            g2.drawLine(0, y, w, y);
                        }

                        g2.setColor(new Color(0, 255, 255));
                        g2.setFont(new Font("Consolas", Font.BOLD, 28));
                        String title = "⚡ [ ZERO-DAY MEMORY CORRUPTION & BUFFER INJECTION DETECTED ] ⚡";
                        FontMetrics fm = g2.getFontMetrics();
                        g2.drawString(title, (w - fm.stringWidth(title)) / 2, h / 2 - 40);

                        g2.setColor(new Color(255, 255, 0));
                        g2.setFont(new Font("Consolas", Font.PLAIN, 18));
                        String sub1 = "HEURISTIC: HEAP_SPRAY_VIOLATION | INCIDENT: " + (incidentId != null ? incidentId : "INC-0DAY");
                        g2.drawString(sub1, (w - g2.getFontMetrics().stringWidth(sub1)) / 2, h / 2 + 10);

                        g2.setColor(new Color(100, 255, 100));
                        String sub2 = "ASTRA Autonomous Memory Guard: Stack integrity preserved. Target contained.";
                        g2.drawString(sub2, (w - g2.getFontMetrics().stringWidth(sub2)) / 2, h / 2 + 40);

                        g2.setColor(new Color(0, 220, 255));
                        g2.setFont(new Font("Consolas", Font.ITALIC, 14));
                        String dis = "[ PRESS ESC OR CLICK ANYWHERE TO DISMISS ]";
                        g2.drawString(dis, (w - g2.getFontMetrics().stringWidth(dis)) / 2, h - 50);
                    }
                };
                panel.setOpaque(true);
                panel.addMouseListener(new MouseAdapter() {
                    @Override public void mouseClicked(MouseEvent e) { frame.dispose(); }
                });
                frame.addKeyListener(new KeyAdapter() {
                    @Override public void keyPressed(KeyEvent e) {
                        if (e.getKeyCode() == KeyEvent.VK_ESCAPE) frame.dispose();
                    }
                });
                frame.add(panel);
                frame.setVisible(true);
                frame.toFront();
                frame.requestFocus();

                Timer autoClose = new Timer(10000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();
            } catch (Exception e) {
                log.error("Failed to render glitch GUI", e);
            }
        });
    }

    public void showRadarBeacon(String incidentId) {
        if (!GraphicsEnvironment.isHeadless()) {
            renderRadarBeaconGui(incidentId);
        }
    }

    public void renderRadarBeaconGui(String incidentId) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                JFrame frame = new JFrame("ASTRA EDR — C2 RADAR INTERCEPT");
                frame.setUndecorated(true);
                frame.setSize(600, 500);
                Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
                frame.setLocation((screen.width - 600) / 2, (screen.height - 500) / 2);
                frame.setAlwaysOnTop(true);

                JPanel panel = new JPanel(new BorderLayout());
                panel.setBackground(new Color(5, 15, 25));
                panel.setBorder(BorderFactory.createLineBorder(new Color(0, 255, 128), 3));

                JLabel title = new JLabel("  📡 ASTRA RADAR: ROGUE C2 BEACON INTERCEPTED (PORT 44444)", JLabel.LEFT);
                title.setForeground(new Color(0, 255, 128));
                title.setFont(new Font("Consolas", Font.BOLD, 14));
                panel.add(title, BorderLayout.NORTH);

                JTextArea text = new JTextArea("""
                        [+] LISTENER DETECTED ON TCP 127.0.0.1:44444
                        [+] BEACON INTERVAL: 3000ms
                        [+] THREAT VECTOR  : STEALTH_RAT_BACKDOOR
                        [+] STATUS         : BLOCKED & RECORDED IN AUDIT LOG
                        [+] ACTION REQUIRED: DISARM VIA DASHBOARD RECOVERY STEP
                        """);
                text.setBackground(new Color(5, 15, 25));
                text.setForeground(new Color(150, 255, 200));
                text.setFont(new Font("Consolas", Font.BOLD, 13));
                text.setEditable(false);
                text.setMargin(new Insets(20, 20, 20, 20));
                panel.add(text, BorderLayout.CENTER);

                JButton btn = new JButton("ACKNOWLEDGE & DISMISS");
                btn.setBackground(new Color(10, 40, 30));
                btn.setForeground(new Color(0, 255, 128));
                btn.setFont(new Font("Consolas", Font.BOLD, 12));
                btn.addActionListener(e -> frame.dispose());
                panel.add(btn, BorderLayout.SOUTH);

                frame.add(panel);
                frame.setVisible(true);

                Timer autoClose = new Timer(10000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();
            } catch (Exception e) {
                log.error("Failed to render radar GUI", e);
            }
        });
    }

    public void showHexShield(String target) {
        if (!GraphicsEnvironment.isHeadless()) {
            renderHexShieldGui(target);
        }
    }

    public void renderHexShieldGui(String target) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                JFrame frame = new JFrame("ASTRA EDR — HEXAGONAL DEFENSE SHIELD");
                frame.setUndecorated(true);
                frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
                frame.setAlwaysOnTop(true);
                frame.setAutoRequestFocus(true);
                frame.setFocusableWindowState(true);

                JPanel panel = new JPanel(new GridBagLayout());
                panel.setBackground(new Color(8, 20, 40, 230));

                JPanel card = new JPanel(new BorderLayout());
                card.setPreferredSize(new Dimension(780, 380));
                card.setBackground(new Color(12, 28, 55));
                card.setBorder(BorderFactory.createLineBorder(new Color(0, 210, 255), 3));

                JLabel title = new JLabel("  🛡️ ASTRA AUTONOMOUS CYBER DEFENSE SHIELD ENGAGED", JLabel.LEFT);
                title.setForeground(new Color(0, 210, 255));
                title.setFont(new Font("Consolas", Font.BOLD, 16));
                title.setPreferredSize(new Dimension(780, 48));
                title.setOpaque(true);
                title.setBackground(new Color(18, 42, 80));
                card.add(title, BorderLayout.NORTH);

                JTextArea text = new JTextArea("""
                        [SHIELD LEVEL 5] - ENDPOINT HARDENING ACTIVE
                        ===================================================
                        [*] HOST FIREWALL PROFILE    : ENFORCED (ALL PROFILES)
                        [*] MICROSOFT DEFENDER RT    : ACTIVE & MONITORING
                        [*] INTEGRITY AGENT          : 18 REALTIME MONITORS ONLINE
                        [*] PROTECTED TARGET         : """ + (target != null ? target : "Local Workstation") + """
                        \n===================================================
                        ALL PERIMETERS SECURE. ATTACK VECTOR CONTAINED.
                        """);
                text.setBackground(new Color(12, 28, 55));
                text.setForeground(new Color(180, 235, 255));
                text.setFont(new Font("Consolas", Font.BOLD, 14));
                text.setEditable(false);
                text.setMargin(new Insets(20, 25, 20, 25));
                card.add(text, BorderLayout.CENTER);

                JButton btn = new JButton("CLOSE HUD [ESC]");
                btn.setBackground(new Color(18, 42, 80));
                btn.setForeground(new Color(0, 210, 255));
                btn.setFont(new Font("Consolas", Font.BOLD, 13));
                btn.setPreferredSize(new Dimension(780, 40));
                btn.addActionListener(e -> frame.dispose());
                card.add(btn, BorderLayout.SOUTH);

                panel.add(card);
                panel.addMouseListener(new MouseAdapter() {
                    @Override public void mouseClicked(MouseEvent e) { frame.dispose(); }
                });
                frame.addKeyListener(new KeyAdapter() {
                    @Override public void keyPressed(KeyEvent e) {
                        if (e.getKeyCode() == KeyEvent.VK_ESCAPE) frame.dispose();
                    }
                });

                frame.add(panel);
                frame.setVisible(true);

                Timer autoClose = new Timer(15000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();
            } catch (Exception e) {
                log.error("Failed to render hex shield GUI", e);
            }
        });
    }

    public void renderHideMatrixGui() {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            if (matrixFrame != null) {
                matrixFrame.dispose();
                matrixFrame = null;
            }
        });
    }
}
