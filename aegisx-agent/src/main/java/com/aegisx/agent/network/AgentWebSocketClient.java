package com.aegisx.agent.network;

import com.aegisx.agent.commands.CommandProcessor;
import com.aegisx.agent.registration.RegistrationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentWebSocketClient {

    @Value("${aegisx.backend.url}")
    private String backendUrl;

    private final RegistrationService registrationService;
    private final CommandProcessor commandProcessor;
    private StompSession stompSession;

    @PostConstruct
    public void connect() {
        try {
            // Replace http:// with ws:// for websocket URL
            String wsUrl = backendUrl.replace("http://", "ws://").replace("https://", "wss://") + "/ws";
            
            StandardWebSocketClient simpleWebSocketClient = new StandardWebSocketClient();
            WebSocketStompClient stompClient = new WebSocketStompClient(simpleWebSocketClient);
            stompClient.setMessageConverter(new MappingJackson2MessageConverter());

            StompSessionHandlerAdapter sessionHandler = new StompSessionHandlerAdapter() {
                @Override
                public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                    log.info("Connected to AEGISX WebSocket server.");
                    stompSession = session;
                    
                    String deviceId = registrationService.getDeviceId();
                    String topic = "/topic/agent/" + deviceId;
                    
                    session.subscribe(topic, this);
                    log.info("Subscribed to command topic: {}", topic);
                }

                @Override
                public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
                    log.error("WebSocket STOMP Error", exception);
                }

                @Override
                public void handleTransportError(StompSession session, Throwable exception) {
                    log.error("WebSocket Transport Error. Will attempt reconnect later.", exception);
                }
                
                @Override
                public Type getPayloadType(StompHeaders headers) {
                    return Map.class;
                }

                @Override
                public void handleFrame(StompHeaders headers, Object payload) {
                    log.info("Received WebSocket Command: {}", payload);
                    if (payload instanceof Map) {
                        Map<String, Object> commandMap = (Map<String, Object>) payload;
                        String action = (String) commandMap.get("action");
                        commandProcessor.processCommand(action, commandMap);
                    }
                }
            };

            log.info("Attempting WebSocket connection to {}", wsUrl);
            stompClient.connectAsync(wsUrl, sessionHandler);
            
        } catch (Exception e) {
            log.error("Failed to establish WebSocket connection", e);
        }
    }
}
