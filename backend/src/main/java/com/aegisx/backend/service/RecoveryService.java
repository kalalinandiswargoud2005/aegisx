package com.aegisx.backend.service;

import com.aegisx.backend.entity.Incident;
import com.aegisx.backend.entity.RecoveryStep;
import com.aegisx.backend.entity.ThreatCatalog;
import com.aegisx.backend.repository.IncidentRepository;
import com.aegisx.backend.repository.RecoveryStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecoveryService {

    private final RecoveryStepRepository recoveryStepRepository;
    private final IncidentRepository incidentRepository;
    private final ThreatCatalogService threatCatalogService;

    public List<RecoveryStep> getRecoveryWorkflow(UUID incidentId) {
        // First try the DB
        List<RecoveryStep> dbSteps = recoveryStepRepository.findByIncidentIdOrderByStepOrderAsc(incidentId.toString());
        if (!dbSteps.isEmpty()) {
            return dbSteps;
        }

        // Fallback: generate steps from ThreatCatalog by matching incident name
        Optional<Incident> incidentOpt = incidentRepository.findById(incidentId);
        if (incidentOpt.isEmpty()) {
            return List.of();
        }

        Incident incident = incidentOpt.get();
        ThreatCatalog catalog = threatCatalogService.findByName(incident.getName());

        if (catalog != null) {
            // Generate and persist steps so future calls are fast
            generateRecoveryStepsForIncident(
                incidentId,
                catalog.getImmediateAction(),
                buildWorkflowFromCatalog(catalog)
            );
            return recoveryStepRepository.findByIncidentIdOrderByStepOrderAsc(incidentId.toString());
        }

        // Final fallback: use incident type as generic steps
        generateRecoveryStepsForIncident(incidentId,
            "Isolate affected system and alert administrator",
            "Analyze incident, Contain threat, Eradicate root cause, Recover systems, Post-incident review"
        );
        return recoveryStepRepository.findByIncidentIdOrderByStepOrderAsc(incidentId.toString());
    }

    private String buildWorkflowFromCatalog(ThreatCatalog catalog) {
        List<String> steps = new ArrayList<>();
        if (catalog.getRecoveryStep1() != null && !catalog.getRecoveryStep1().isBlank()) steps.add(catalog.getRecoveryStep1());
        if (catalog.getRecoveryStep2() != null && !catalog.getRecoveryStep2().isBlank()) steps.add(catalog.getRecoveryStep2());
        if (catalog.getRecoveryStep3() != null && !catalog.getRecoveryStep3().isBlank()) steps.add(catalog.getRecoveryStep3());
        if (catalog.getRecoveryStep4() != null && !catalog.getRecoveryStep4().isBlank()) steps.add(catalog.getRecoveryStep4());
        if (catalog.getRecoveryStep5() != null && !catalog.getRecoveryStep5().isBlank()) steps.add(catalog.getRecoveryStep5());
        return steps.isEmpty() ? "Analyze incident, Contain threat, Recover systems" : String.join(", ", steps);
    }

    public void generateRecoveryStepsForIncident(UUID incidentId, String immediateAction, String recoveryWorkflow) {
        if (immediateAction == null || immediateAction.isBlank()) {
            immediateAction = "Identify and isolate threat";
        }
        if (recoveryWorkflow == null || recoveryWorkflow.isBlank()) {
            recoveryWorkflow = "Analyze incident, Eradicate threat, Recover systems, Post-incident review";
        }

        List<RecoveryStep> recoverySteps = new ArrayList<>();

        // Step 1: Immediate Action (Automatically marked as Completed)
        recoverySteps.add(RecoveryStep.builder()
                .incidentId(incidentId.toString())
                .title("[Immediate Action] " + immediateAction.trim())
                .stepOrder(1)
                .status("COMPLETED")
                .build());

        // Subsequent steps
        String[] steps = recoveryWorkflow.split(",");
        for (int i = 0; i < steps.length; i++) {
            recoverySteps.add(RecoveryStep.builder()
                    .incidentId(incidentId.toString())
                    .title(steps[i].trim())
                    .stepOrder(i + 2)
                    .status(i == 0 ? "IN_PROGRESS" : "PENDING")
                    .build());
        }

        recoveryStepRepository.saveAll(recoverySteps);
    }
}
