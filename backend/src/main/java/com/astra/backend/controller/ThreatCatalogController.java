package com.astra.backend.controller;

import com.astra.backend.entity.ThreatCatalog;
import com.astra.backend.service.ThreatCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/threat-catalog")
@RequiredArgsConstructor
public class ThreatCatalogController {

    private final ThreatCatalogService catalogService;

    @GetMapping
    public ResponseEntity<List<ThreatCatalog>> getAllThreats() {
        return ResponseEntity.ok(catalogService.getAllThreats());
    }

    @GetMapping("/threat-id/{threatId}")
    public ResponseEntity<ThreatCatalog> getByThreatId(@PathVariable String threatId) {
        return catalogService.getThreatById(threatId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seedData() {
        catalogService.reloadCache();
        return ResponseEntity.ok(Map.of("message", "Threat Catalog cache reloaded successfully."));
    }
}
