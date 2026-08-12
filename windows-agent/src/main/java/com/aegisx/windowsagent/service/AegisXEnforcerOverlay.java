package com.aegisx.windowsagent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.swing.*;
import java.awt.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

@Slf4j
@Service
public class AegisXEnforcerOverlay {

    public void showEnforcement(String commandType, String target, String details) {
        // Run Swing UI on EDT or separate thread
        SwingUtilities.invokeLater(() -> {
            try {
                JFrame frame = new JFrame("ASTRA REMEDIATION ENFORCER");
                frame.setUndecorated(true);
                frame.setAlwaysOnTop(true);
                frame.setSize(600, 300);
                
                // Center on screen
                Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
                int x = (screenSize.width - 600) / 2;
                int y = (screenSize.height - 300) / 2;
                frame.setLocation(x, y);

                JPanel panel = new JPanel();
                panel.setBackground(new Color(10, 15, 25));
                panel.setBorder(BorderFactory.createLineBorder(new Color(0, 255, 128), 2));
                panel.setLayout(new BorderLayout());

                JLabel header = new JLabel("  🛡️ ASTRA EDR — ACTIVE REMEDIATION ENFORCER", JLabel.LEFT);
                header.setFont(new Font("Consolas", Font.BOLD, 16));
                header.setForeground(new Color(0, 255, 128));
                header.setPreferredSize(new Dimension(600, 40));
                header.setOpaque(true);
                header.setBackground(new Color(15, 25, 40));
                panel.add(header, BorderLayout.NORTH);

                JTextArea textArea = new JTextArea();
                textArea.setBackground(new Color(10, 15, 25));
                textArea.setForeground(new Color(0, 230, 118));
                textArea.setFont(new Font("Consolas", Font.PLAIN, 14));
                textArea.setEditable(false);
                textArea.setMargin(new Insets(15, 15, 15, 15));

                panel.add(new JScrollPane(textArea), BorderLayout.CENTER);
                frame.add(panel);
                frame.setVisible(true);

                // Animate log typing
                ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
                String[] logs = {
                    "[ASTRA-EDR] Intercepted Remediation Order from C2 Backend...",
                    "[ENFORCE] Command: " + commandType,
                    "[TARGET]  Target Entity: " + target,
                    "[ACTION]  Details: " + details,
                    "[SYSTEM]  Executing system containment protocol...",
                    "[SUCCESS] Threat neutralized. Reporting status back to backend C2."
                };

                new Thread(() -> {
                    for (String line : logs) {
                        SwingUtilities.invokeLater(() -> textArea.append(line + "\n"));
                        try {
                            Thread.sleep(400);
                        } catch (InterruptedException ignored) {}
                    }
                    try {
                        Thread.sleep(2500);
                    } catch (InterruptedException ignored) {}
                    SwingUtilities.invokeLater(frame::dispose);
                }).start();

            } catch (Exception e) {
                log.error("Failed to show overlay", e);
            }
        });
    }
}
