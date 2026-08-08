package com.aegisx.backend.repository;

import com.aegisx.backend.entity.ThreatCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface ThreatCatalogRepository extends JpaRepository<ThreatCatalog, UUID> {
    Optional<ThreatCatalog> findByThreatId(String threatId);
    List<ThreatCatalog> findByIsActiveTrue();
}
