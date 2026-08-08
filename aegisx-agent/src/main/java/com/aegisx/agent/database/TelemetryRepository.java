package com.aegisx.agent.database;

import com.aegisx.agent.models.TelemetryCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryRepository extends JpaRepository<TelemetryCache, Long> {
    List<TelemetryCache> findBySyncStatus(String syncStatus);
}
