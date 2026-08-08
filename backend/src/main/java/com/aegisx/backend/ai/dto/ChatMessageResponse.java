package com.aegisx.backend.ai.dto;

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
}
