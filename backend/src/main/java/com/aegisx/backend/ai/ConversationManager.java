package com.aegisx.backend.ai;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Collections;

@Component
public class ConversationManager {

    // sessionId -> list of message history
    private final Map<String, List<Message>> sessionHistory = new ConcurrentHashMap<>();
    private static final int MAX_HISTORY_TURNS = 10;

    public void addMessage(String sessionId, String role, String content) {
        sessionHistory.computeIfAbsent(sessionId, k -> new ArrayList<>())
                .add(new Message(role, content));
        
        List<Message> history = sessionHistory.get(sessionId);
        if (history.size() > MAX_HISTORY_TURNS * 2) {
            // Keep the most recent messages (each turn is typically 2 messages: user + model)
            history = new ArrayList<>(history.subList(history.size() - (MAX_HISTORY_TURNS * 2), history.size()));
            sessionHistory.put(sessionId, history);
        }
    }

    public List<Message> getHistory(String sessionId) {
        return sessionHistory.getOrDefault(sessionId, Collections.emptyList());
    }

    public void clearHistory(String sessionId) {
        sessionHistory.remove(sessionId);
    }

    public static class Message {
        private String role; // "user" or "model"
        private String content;

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public String getContent() {
            return content;
        }
    }
}
