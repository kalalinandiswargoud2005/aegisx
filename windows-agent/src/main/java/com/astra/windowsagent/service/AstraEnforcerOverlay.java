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
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                Toolkit.getDefaultToolkit().beep();
                JFrame frame = new JFrame("ASTRA EDR — THREAT DETECTED");
                frame.setUndecorated(true);
                frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
                frame.setAlwaysOnTop(true);
                frame.setAutoRequestFocus(true);
                frame.setFocusableWindowState(true);
                frame.setBackground(new Color(25, 0, 0, 180));

                JPanel backdrop = new JPanel(new GridBagLayout()) {
                    @Override
                    protected void paintComponent(Graphics g) {
                        super.paintComponent(g);
                        g.setColor(new Color(255, 30, 30, 220));
                        g.setFont(new Font("Consolas", Font.BOLD, 18));
                        g.drawString("🚨 [ ASTRA EDR AUTONOMOUS THREAT DETECTED — CLICK ANYWHERE OR PRESS ESC TO DISMISS ]", 50, 50);
                    }
                };
                backdrop.setOpaque(false);

                // Centered Alert Card
                JPanel card = new JPanel(new BorderLayout());
                card.setPreferredSize(new Dimension(760, 320));
                card.setBackground(new Color(45, 8, 8));
                card.setBorder(BorderFactory.createLineBorder(new Color(255, 40, 40), 4));

                JPanel topBar = new JPanel(new BorderLayout());
                topBar.setBackground(new Color(75, 12, 12));
                topBar.setPreferredSize(new Dimension(760, 50));

                JLabel header = new JLabel("  ⚠️ ASTRA EDR — THREAT DETECTED", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 16));
                header.setForeground(Color.RED);
                topBar.add(header, BorderLayout.WEST);

                JButton closeBtn = new JButton("DISMISS [X]");
                closeBtn.setFont(new Font("Consolas", Font.BOLD, 12));
                closeBtn.setBackground(new Color(110, 20, 20));
                closeBtn.setForeground(Color.WHITE);
                closeBtn.setFocusPainted(false);
                closeBtn.setBorder(BorderFactory.createEmptyBorder(6, 14, 6, 14));
                closeBtn.addActionListener(e -> frame.dispose());
                topBar.add(closeBtn, BorderLayout.EAST);
                card.add(topBar, BorderLayout.NORTH);

                JTextArea msgArea = new JTextArea();
                msgArea.setBackground(new Color(35, 5, 5));
                msgArea.setForeground(new Color(255, 170, 170));
                msgArea.setFont(new Font("Consolas", Font.BOLD, 14));
                msgArea.setEditable(false);
                msgArea.setMargin(new Insets(20, 25, 20, 25));
                msgArea.setText(String.format("""
                        =======================================================
                                      ASTRA EDR — INCIDENT ALERT
                        =======================================================
                        THREAT NAME        : %s
                        SEVERITY           : %s
                        INCIDENT ID        : %s
                        AFFECTED HOST      : %s
                        CONTAINMENT ACTION : Automated Isolation & Sandboxed Quarantine Active
                        CURRENT STATUS     : Real-time defense pipeline engaged
                        =======================================================
                        """,
                        threatName != null ? threatName : "Malicious Activity Pattern",
                        severity != null ? severity : "CRITICAL",
                        incidentId != null ? incidentId : "INC-GENERIC",
                        System.getenv("COMPUTERNAME") != null ? System.getenv("COMPUTERNAME") : "Target-Endpoint"));
                card.add(msgArea, BorderLayout.CENTER);

                backdrop.add(card);

                backdrop.addMouseListener(new MouseAdapter() {
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

                frame.add(backdrop);
                frame.setVisible(true);
                frame.toFront();
                frame.requestFocus();

                // Auto-close after 15 seconds
                Timer autoClose = new Timer(15000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();

            } catch (Exception e) {
                log.error("Failed to render threat alert GUI", e);
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
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                Toolkit.getDefaultToolkit().beep();
                JFrame frame = new JFrame("ASTRA RECOVERY STEP");
                frame.setUndecorated(true);
                frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
                frame.setAlwaysOnTop(true);
                frame.setAutoRequestFocus(true);
                frame.setFocusableWindowState(true);
                frame.setBackground(new Color(5, 20, 15, 180));

                JPanel backdrop = new JPanel(new GridBagLayout()) {
                    @Override
                    protected void paintComponent(Graphics g) {
                        super.paintComponent(g);
                        g.setColor(new Color(0, 255, 150, 220));
                        g.setFont(new Font("Consolas", Font.BOLD, 18));
                        g.drawString(String.format("🔄 [ ASTRA RECOVERY PLAYBOOK — STEP %d/%d — CLICK ANYWHERE OR PRESS ESC TO DISMISS ]",
                                stepNum, totalSteps > 0 ? totalSteps : 5), 50, 50);
                    }
                };
                backdrop.setOpaque(false);

                JPanel card = new JPanel(new BorderLayout());
                card.setPreferredSize(new Dimension(760, 300));
                card.setBackground(new Color(10, 25, 20));
                card.setBorder(BorderFactory.createLineBorder(new Color(0, 255, 150), 4));

                JPanel topBar = new JPanel(new BorderLayout());
                topBar.setBackground(new Color(15, 40, 30));
                topBar.setPreferredSize(new Dimension(760, 50));

                JLabel header = new JLabel(String.format("  🔄 ASTRA RECOVERY PLAYBOOK — STEP %d/%d", stepNum,
                        totalSteps > 0 ? totalSteps : 5), JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 16));
                header.setForeground(new Color(0, 255, 150));
                topBar.add(header, BorderLayout.WEST);

                JButton closeBtn = new JButton("DISMISS [X]");
                closeBtn.setFont(new Font("Consolas", Font.BOLD, 12));
                closeBtn.setBackground(new Color(20, 60, 40));
                closeBtn.setForeground(Color.WHITE);
                closeBtn.setFocusPainted(false);
                closeBtn.setBorder(BorderFactory.createEmptyBorder(6, 14, 6, 14));
                closeBtn.addActionListener(e -> frame.dispose());
                topBar.add(closeBtn, BorderLayout.EAST);
                card.add(topBar, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(10, 25, 20));
                textArea.setForeground(new Color(140, 255, 190));
                textArea.setFont(new Font("Consolas", Font.BOLD, 14));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(20, 25, 20, 25));

                String content = String.format("""
                        [STEP %d ACTION]   : %s
                        [STATUS]          : %s
                        [VERIFICATION]    : ✓ Verified on target Windows laptop
                        [RECOVERY GATING] : Sequential step confirmation logged
                        """, stepNum,
                        title != null ? title : "Executing remediation",
                        status != null ? status : "VERIFIED");

                textArea.setText(content);
                card.add(new JScrollPane(textArea), BorderLayout.CENTER);

                int maxSteps = totalSteps > 0 ? totalSteps : 5;
                JProgressBar progressBar = new JProgressBar(0, maxSteps);
                progressBar.setValue(stepNum);
                progressBar.setStringPainted(true);
                progressBar.setString(String.format("Playbook Progress: Step %d of %d Complete", stepNum, maxSteps));
                progressBar.setForeground(new Color(0, 255, 150));
                progressBar.setBackground(new Color(15, 35, 25));
                progressBar.setFont(new Font("Consolas", Font.BOLD, 12));
                progressBar.setPreferredSize(new Dimension(760, 28));
                card.add(progressBar, BorderLayout.SOUTH);

                backdrop.add(card);

                backdrop.addMouseListener(new MouseAdapter() {
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

                frame.add(backdrop);
                frame.setVisible(true);
                frame.toFront();
                frame.requestFocus();

                Timer autoClose = new Timer(15000, e -> frame.dispose());
                autoClose.setRepeats(false);
                autoClose.start();
            } catch (Exception e) {
                log.error("Failed to render recovery step GUI", e);
            }
        });
    }

    public void renderContainmentGui(String threatName, String action, String status) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                Toolkit.getDefaultToolkit().beep();
                JFrame frame = new JFrame("ASTRA IMMEDIATE CONTAINMENT");
                frame.setUndecorated(true);
                frame.setAlwaysOnTop(true);
                frame.setSize(640, 240);

                Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
                int x = (screenSize.width - 640) / 2;
                int y = (screenSize.height - 240) / 2;
                frame.setLocation(x, y);

                JPanel panel = new JPanel(new BorderLayout());
                panel.setBackground(new Color(15, 20, 30));
                panel.setBorder(BorderFactory.createLineBorder(new Color(255, 140, 0), 2));

                JLabel header = new JLabel("  ⚡ ASTRA EDR — AUTONOMOUS CONTAINMENT ACTIVE", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 15));
                header.setForeground(new Color(255, 140, 0));
                header.setPreferredSize(new Dimension(640, 40));
                header.setOpaque(true);
                header.setBackground(new Color(25, 30, 40));
                panel.add(header, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(15, 20, 30));
                textArea.setForeground(new Color(255, 180, 50));
                textArea.setFont(new Font("Consolas", Font.BOLD, 13));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(15, 15, 15, 15));

                String content = String.format("""
                        [THREAT IDENTIFIED] : %s
                        [CONTAINMENT ACTION]: %s
                        [EXECUTION STATUS]  : %s
                        [VERIFICATION]      : Real-time endpoint confirmation logged.
                        """, threatName != null ? threatName : "Active Threat",
                        action != null ? action : "Isolating Host",
                        status != null ? status : "EXECUTING");

                textArea.setText(content);
                panel.add(new JScrollPane(textArea), BorderLayout.CENTER);
                frame.add(panel);
                frame.setVisible(true);
                frame.toFront();

                new Thread(() -> {
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException ignored) {}
                    SwingUtilities.invokeLater(frame::dispose);
                }).start();
            } catch (Exception e) {
                log.error("Failed to render containment GUI", e);
            }
        });
    }

    public void renderFinalResolutionGui(String threatName, String message) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                renderHideMatrixGui();

                Toolkit.getDefaultToolkit().beep();
                JFrame frame = new JFrame("ASTRA THREAT RESOLVED");
                frame.setUndecorated(true);
                frame.setAlwaysOnTop(true);
                frame.setSize(680, 280);

                Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
                int x = (screenSize.width - 680) / 2;
                int y = (screenSize.height - 280) / 2;
                frame.setLocation(x, y);

                JPanel panel = new JPanel(new BorderLayout());
                panel.setBackground(new Color(10, 30, 45));
                panel.setBorder(BorderFactory.createLineBorder(new Color(0, 220, 255), 3));

                JPanel topBar = new JPanel(new BorderLayout());
                topBar.setBackground(new Color(15, 40, 60));
                topBar.setPreferredSize(new Dimension(680, 42));

                JLabel header = new JLabel("  ✅ ASTRA EDR — THREAT CONTAINED & ENDPOINT SECURED", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 15));
                header.setForeground(new Color(0, 220, 255));
                topBar.add(header, BorderLayout.WEST);

                JButton closeBtn = new JButton("DISMISS [X]");
                closeBtn.setFont(new Font("Consolas", Font.BOLD, 11));
                closeBtn.setBackground(new Color(20, 55, 80));
                closeBtn.setForeground(Color.WHITE);
                closeBtn.setFocusPainted(false);
                closeBtn.setBorder(BorderFactory.createEmptyBorder(4, 10, 4, 10));
                closeBtn.addActionListener(e -> frame.dispose());
                topBar.add(closeBtn, BorderLayout.EAST);
                panel.add(topBar, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(10, 30, 45));
                textArea.setForeground(new Color(100, 240, 255));
                textArea.setFont(new Font("Consolas", Font.BOLD, 13));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(15, 15, 15, 15));

                String content = String.format("""
                        =======================================================
                                     REMEDIATION CYCLE COMPLETE
                        =======================================================
                        ✓ Incident Target : %s
                        ✓ Security Status : Endpoint Verified Clean
                        ✓ Actions Taken   : %s
                        ✓ Baseline State  : All Threats Neutralized
                        =======================================================
                        """, threatName != null ? threatName : "Target Endpoint",
                        message != null ? message : "All remediation playbooks executed.");

                textArea.setText(content);
                panel.add(new JScrollPane(textArea), BorderLayout.CENTER);
                frame.add(panel);
                frame.setVisible(true);
                frame.toFront();

                new Thread(() -> {
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException ignored) {}
                    SwingUtilities.invokeLater(frame::dispose);
                }).start();

            } catch (Exception e) {
                log.error("Failed to render final resolution GUI", e);
            }
        });
    }

    public void renderSafeTestEnforcementGui(String threatName, String details) {
        if (GraphicsEnvironment.isHeadless()) return;
        SwingUtilities.invokeLater(() -> {
            try {
                JFrame frame = new JFrame("ASTRA EDR - SAFE TEST ENFORCEMENT");
                frame.setUndecorated(true);
                frame.setAlwaysOnTop(true);
                frame.setSize(650, 320);

                Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
                int x = (screenSize.width - 650) / 2;
                int y = (screenSize.height - 320) / 2;
                frame.setLocation(x, y);

                JPanel panel = new JPanel(new BorderLayout());
                panel.setBackground(new Color(10, 20, 35));
                panel.setBorder(BorderFactory.createLineBorder(new Color(0, 210, 255), 3));

                JLabel header = new JLabel("  🛡️ ASTRA EDR - SAFE TEST ENFORCEMENT VERIFICATION", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 15));
                header.setForeground(new Color(0, 210, 255));
                header.setPreferredSize(new Dimension(650, 45));
                header.setOpaque(true);
                header.setBackground(new Color(15, 30, 50));
                panel.add(header, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(10, 20, 35));
                textArea.setForeground(new Color(100, 240, 255));
                textArea.setFont(new Font("Consolas", Font.BOLD, 13));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(15, 15, 15, 15));

                String content = """
                        ================================================
                                     ASTRA EDR SAFE TEST
                        ================================================
                        Threat : %s
                        Details: %s
                        Host   : %s
                        Time   : %s
                        ================================================
                        ASTRA EDR ENFORCEMENT PIPELINE VERIFIED
                        """.formatted(
                        threatName != null ? threatName : "Safe Verification Event",
                        details != null ? details : "Command executed successfully",
                        System.getenv("COMPUTERNAME") != null ? System.getenv("COMPUTERNAME") : "Endpoint-Host",
                        java.time.LocalDateTime.now().toString());

                textArea.setText(content);
                panel.add(new JScrollPane(textArea), BorderLayout.CENTER);
                frame.add(panel);
                frame.setVisible(true);

                new Thread(() -> {
                    try {
                        Thread.sleep(6000);
                    } catch (InterruptedException ignored) {}
                    SwingUtilities.invokeLater(frame::dispose);
                }).start();

            } catch (Exception e) {
                log.error("Failed to render safe test GUI", e);
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
