package com.astra.backend.voice;

import com.astra.backend.voice.dto.VoiceCommandRequest;
import com.astra.backend.voice.dto.VoiceCommandResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceCommandService voiceCommandService;

    @PostMapping("/command")
    public ResponseEntity<VoiceCommandResponse> processCommand(@RequestBody VoiceCommandRequest request) {
        VoiceCommandResponse response = voiceCommandService.processCommand(request.getText());
        return ResponseEntity.ok(response);
    }
}
