package com.aegisx.backend.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String topic, Object payload) {
        messagingTemplate.convertAndSend("/topic/" + topic, payload);
    }
}
