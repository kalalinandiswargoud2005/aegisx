package com.aegisx.backend.ai;

import com.aegisx.backend.ai.dto.ChatMessageRequest;
import com.aegisx.backend.ai.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final PromptTemplates promptTemplates;
    private final SafetyFilter safetyFilter;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/ai/chat")
    public void handleChatMessage(@Payload ChatMessageRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = headerAccessor.getSessionId();
        }

        String destination = "/topic/ai-response/" + sessionId;

        if (!safetyFilter.isSafe(request.getPrompt())) {
            ChatMessageResponse errorResponse = ChatMessageResponse.builder()
                    .content("I'm sorry, I cannot fulfill that request as it violates safety guidelines.")
                    .isFinished(true)
                    .role("error")
                    .build();
            messagingTemplate.convertAndSend(destination, errorResponse);
            return;
        }

        String fullPrompt = promptTemplates.buildContextAwarePrompt(request.getPrompt(), request.getContext());
        aiService.processStreamRequest(sessionId, fullPrompt, destination);
    }
}
