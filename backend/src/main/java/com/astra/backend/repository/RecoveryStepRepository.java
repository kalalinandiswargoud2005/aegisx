package com.astra.backend.repository;

import com.astra.backend.entity.RecoveryStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecoveryStepRepository extends JpaRepository<RecoveryStep, UUID> {
    List<RecoveryStep> findByIncidentIdOrderByStepOrderAsc(String incidentId);
}
