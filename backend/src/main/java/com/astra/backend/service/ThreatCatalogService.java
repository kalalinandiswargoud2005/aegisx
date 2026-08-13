package com.astra.backend.service;

import com.astra.backend.entity.ThreatCatalog;
import com.astra.backend.repository.ThreatCatalogRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ThreatCatalogService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ThreatCatalogService.class);

    private final ThreatCatalogRepository repository;
    private final Map<String, ThreatCatalog> cache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        reloadCache();
    }

    @Scheduled(fixedRateString = "${threat.catalog.reload.rate:300000}") // Reload every 5 minutes
    public void reloadCache() {
        log.info("Reloading Threat Catalog Cache from Database...");
        List<ThreatCatalog> threats = repository.findByIsActiveTrue();
        cache.clear();
        for (ThreatCatalog t : threats) {
            cache.put(t.getThreatId(), t);
        }
        log.info("Successfully loaded {} threats into memory cache.", cache.size());
    }

    public List<ThreatCatalog> getAllThreats() {
        return List.copyOf(cache.values());
    }

    public Optional<ThreatCatalog> getThreatById(String threatId) {
        return Optional.ofNullable(cache.get(threatId));
    }

    public ThreatCatalog findByName(String name) {
        if (name == null) return null;
        String lower = name.toLowerCase();
        return cache.values().stream()
            .filter(t -> t.getThreatName() != null && t.getThreatName().toLowerCase().contains(lower))
            .findFirst()
            .orElse(cache.values().stream()
                .filter(t -> lower.contains(t.getThreatName() != null ? t.getThreatName().toLowerCase() : ""))
                .findFirst()
                .orElse(null));
    }
}
