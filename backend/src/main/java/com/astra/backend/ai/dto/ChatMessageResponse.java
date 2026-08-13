package com.astra.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String content; // Streamed chunk or full message
    private boolean isFinished;
    private String role; // "model", "user", "error"

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isFinished() { return isFinished; }
    public void setFinished(boolean isFinished) { this.isFinished = isFinished; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static ChatMessageResponseBuilder builder() {
        return new ChatMessageResponseBuilder();
    }

    public static class ChatMessageResponseBuilder {
        private String content;
        private boolean isFinished;
        private String role;

        public ChatMessageResponseBuilder content(String content) { this.content = content; return this; }
        public ChatMessageResponseBuilder isFinished(boolean isFinished) { this.isFinished = isFinished; return this; }
        public ChatMessageResponseBuilder role(String role) { this.role = role; return this; }
        public ChatMessageResponse build() {
            return new ChatMessageResponse(content, isFinished, role);
        }
    }
}
