package com.aegisx.backend.repository;

import com.aegisx.backend.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, UUID> {
    Optional<IncidentReport> findByIncidentId(UUID incidentId);
}
