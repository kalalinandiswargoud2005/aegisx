package com.astra.agent.registration;

import com.astra.agent.database.AgentConfigRepository;
import com.astra.agent.models.AgentConfig;
import com.astra.agent.collector.TelemetryCollector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationService implements CommandLineRunner {

    private final AgentConfigRepository configRepository;
    private final TelemetryCollector telemetryCollector;
    private final RestTemplate restTemplate;
    
    @Value("${astra.backend.url}")
    private String backendUrl;

    public static final String KEY_DEVICE_ID = "DEVICE_ID";
    public static final String KEY_IS_REGISTERED = "IS_REGISTERED";

    private String deviceId;

    @Override
    public void run(String... args) {
        log.info("Starting ASTRA Agent Registration flow...");
        initializeDeviceId();
        registerWithBackend();
    }

    private void initializeDeviceId() {
        AgentConfig config = configRepository.findById(KEY_DEVICE_ID).orElse(null);
        if (config == null || config.getConfigValue() == null || config.getConfigValue().isEmpty()) {
            this.deviceId = UUID.randomUUID().toString();
            configRepository.save(new AgentConfig(KEY_DEVICE_ID, this.deviceId));
            configRepository.save(new AgentConfig(KEY_IS_REGISTERED, "false"));
            log.info("Generated new Device ID: {}", this.deviceId);
        } else {
            this.deviceId = config.getConfigValue();
            log.info("Loaded existing Device ID: {}", this.deviceId);
        }
        
        // Expose to system properties so TelemetryCollector or others can access it easily if needed,
        // though typically they'd inject a config bean. 
        System.setProperty("astra.agent.id", this.deviceId);
    }

    private void registerWithBackend() {
        AgentConfig registered = configRepository.findById(KEY_IS_REGISTERED).orElse(new AgentConfig(KEY_IS_REGISTERED, "false"));
        if ("true".equals(registered.getConfigValue())) {
            log.info("Agent is already registered with backend.");
            return;
        }

        try {
            log.info("Attempting to register agent with backend at {}", backendUrl);
            var telemetry = telemetryCollector.collectTelemetry();
            telemetry.setDeviceId(this.deviceId); // Override with DB value

            restTemplate.postForObject(backendUrl + "/api/v1/agent/register", telemetry, String.class);
            log.info("Backend registration success.");

            registered.setConfigValue("true");
            configRepository.save(registered);
            log.info("Registration successful.");
        } catch (Exception e) {
            log.error("Failed to register with backend. Will retry on next startup or via SyncService.", e);
        }
    }
    
    public String getDeviceId() {
        return this.deviceId;
    }
}
