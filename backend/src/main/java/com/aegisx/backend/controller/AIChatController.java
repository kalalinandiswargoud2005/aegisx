package com.aegisx.backend.controller;

import com.aegisx.backend.ai.AIService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIChatController {

    private final AIService aiService;

    @Data
    public static class ChatRequest {
        private String message;
        private String prompt;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody(required = false) ChatRequest request) {
        String query = "";
        if (request != null) {
            query = request.getMessage() != null ? request.getMessage() : request.getPrompt();
        }
        if (query == null) {
            query = "";
        }

        String reply = aiService.generateSyncResponse(query);

        Map<String, Object> response = new HashMap<>();
        response.put("reply", reply);
        response.put("response", reply);
        return ResponseEntity.ok(response);
    }
}
