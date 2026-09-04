package com.astra.backend.voice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class LlmService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askAstra(String question) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "My AI brain is offline. Please configure the Gemini API key in your environment.";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        try {
            Map<String, Object> requestBody = new HashMap<>();
            
            // Construct the system instruction and user prompt
            Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", "You are Astra, an advanced AI cybersecurity assistant for the Astra platform. You are helpful, concise, and speak naturally like Jarvis. Keep your answers brief, under 2 sentences if possible, as they will be spoken aloud to the user using text-to-speech."))
            );
            
            Map<String, Object> content = Map.of(
                "parts", List.of(Map.of("text", question))
            );
            
            requestBody.put("system_instruction", systemInstruction);
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> contentRes = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentRes.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to call Gemini API", e);
            return "I'm having trouble connecting to my neural network right now. Please try again later.";
        }

        return "I am not sure how to answer that.";
    }
}
