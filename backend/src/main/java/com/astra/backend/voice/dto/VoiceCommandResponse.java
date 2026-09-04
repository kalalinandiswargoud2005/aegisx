package com.astra.backend.voice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceCommandResponse {
    private String intent;
    private String message;
    private String actionUrl; // Optional: URL to navigate to on the frontend
    private boolean success;
}
