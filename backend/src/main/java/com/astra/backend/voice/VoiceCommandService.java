package com.astra.backend.voice;

import com.astra.backend.simulation.SimulationService;
import com.astra.backend.voice.dto.VoiceCommandResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceCommandService {

    private final SimulationService simulationService;
    private final LlmService llmService;

    public VoiceCommandResponse processCommand(String text) {
        if (text == null || text.trim().isEmpty()) {
            return VoiceCommandResponse.builder()
                    .success(false)
                    .message("I didn't hear anything.")
                    .build();
        }

        String lowerText = text.toLowerCase();
        log.info("Processing voice command: {}", lowerText);

        // 1. Simulation Intent
        if (lowerText.contains("simulate") || lowerText.contains("simulation") || lowerText.contains("attack")) {
            log.info("Voice Command: Triggering simulation");
            var incident = simulationService.triggerRandomScenario(null);
            if (incident != null) {
                return VoiceCommandResponse.builder()
                        .intent("TRIGGER_SIMULATION")
                        .success(true)
                        .message("I have initiated a random threat simulation: " + incident.getName())
                        .build();
            } else {
                return VoiceCommandResponse.builder()
                        .intent("TRIGGER_SIMULATION")
                        .success(false)
                        .message("Failed to initiate simulation. No scenarios available in the threat library.")
                        .build();
            }
        }

        // 2. Navigation Intents
        if (lowerText.contains("dashboard") || lowerText.contains("home")) {
            return VoiceCommandResponse.builder()
                    .intent("NAVIGATE")
                    .success(true)
                    .actionUrl("/dashboard")
                    .message("Navigating to the dashboard.")
                    .build();
        }

        if (lowerText.contains("threats") || lowerText.contains("threat map")) {
            return VoiceCommandResponse.builder()
                    .intent("NAVIGATE")
                    .success(true)
                    .actionUrl("/threats")
                    .message("Opening the threats page.")
                    .build();
        }

        if (lowerText.contains("devices") || lowerText.contains("endpoints")) {
            return VoiceCommandResponse.builder()
                    .intent("NAVIGATE")
                    .success(true)
                    .actionUrl("/devices")
                    .message("Opening the devices view.")
                    .build();
        }

        if (lowerText.contains("watch") || lowerText.contains("monitor")) {
            return VoiceCommandResponse.builder()
                    .intent("NAVIGATE")
                    .success(true)
                    .actionUrl("/watch")
                    .message("Opening the threat watch dashboard.")
                    .build();
        }

        if (lowerText.contains("recovery") || lowerText.contains("fix")) {
            return VoiceCommandResponse.builder()
                    .intent("NAVIGATE")
                    .success(true)
                    .actionUrl("/recovery")
                    .message("Opening the recovery playbook.")
                    .build();
        }

        if (lowerText.contains("reports") || lowerText.contains("analytics") || lowerText.contains("metrics")) {
            return VoiceCommandResponse.builder()
                    .intent("NAVIGATE")
                    .success(true)
                    .actionUrl("/reports")
                    .message("Opening reports and analytics.")
                    .build();
        }

        // 3. Status/Info Intents
        if (lowerText.contains("status") || lowerText.contains("how are we doing")) {
            return VoiceCommandResponse.builder()
                    .intent("INFO")
                    .success(true)
                    .message("The system is currently operational. All sensors are active.")
                    .build();
        }

        // Fallback to LLM for conversational AI
        log.info("Command not recognized natively. Forwarding to LLM: {}", text);
        String llmResponse = llmService.askAstra(text);
        
        return VoiceCommandResponse.builder()
                .intent("LLM_CONVERSATION")
                .success(true)
                .message(llmResponse)
                .build();
    }
}
