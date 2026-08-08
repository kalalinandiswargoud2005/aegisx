package com.aegisx.agent.simulation;

import com.aegisx.agent.dto.ScenarioDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.aegisx.agent.registration.RegistrationService;

import java.io.InputStream;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationEngine {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final RegistrationService registrationService;
    private List<ScenarioDto> scenarios = new ArrayList<>();
    private final Random random = new Random();

    @Value("${aegisx.backend.url}")
    private String backendUrl;

    @PostConstruct
    public void init() {
        try (InputStream is = new ClassPathResource("scenarios.json").getInputStream()) {
            scenarios = objectMapper.readValue(is, new TypeReference<List<ScenarioDto>>() {});
            log.info("Successfully loaded {} enterprise security simulation scenarios.", scenarios.size());
        } catch (Exception e) {
            log.error("Failed to load scenarios.json", e);
        }
    }

    public ScenarioDto triggerRandomScenario() {
        if (scenarios.isEmpty()) {
            log.warn("No scenarios available to simulate.");
            return null;
        }
        ScenarioDto scenario = scenarios.get(random.nextInt(scenarios.size()));
        log.info("Triggering Random Scenario: {}", scenario.getThreatId());
        executeScenario(scenario);
        return scenario;
    }

    public ScenarioDto triggerScenarioById(String threatId) {
        ScenarioDto scenario = scenarios.stream()
                .filter(s -> s.getThreatId().equals(threatId))
                .findFirst()
                .orElse(null);
                
        if (scenario != null) {
            log.info("Triggering Manual Scenario: {}", scenario.getThreatId());
            executeScenario(scenario);
        } else {
            log.warn("Scenario {} not found.", threatId);
        }
        return scenario;
    }

    private void executeScenario(ScenarioDto scenario) {
        log.info("--- SIMULATION EVENT ---");
        log.info("Category: {}", scenario.getCategory());
        log.info("Severity: {}", scenario.getSeverity());
        log.info("Description: {}", scenario.getDescription());
        log.info("AI Summary: {}", scenario.getAiSummary());
        log.info("------------------------");

        try {
            var payload = new HashMap<String, Object>();
            payload.put("deviceId", registrationService.getDeviceId());
            payload.put("category", scenario.getCategory());
            payload.put("threatId", scenario.getThreatId());
            payload.put("severity", scenario.getSeverity());

            restTemplate.postForObject(backendUrl + "/api/v1/agent/incident", payload, String.class);
            log.info("Reported simulated incident to backend.");
        } catch (Exception e) {
            log.error("Failed to report incident to backend", e);
        }
    }
}
