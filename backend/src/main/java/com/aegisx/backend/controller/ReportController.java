package com.aegisx.backend.controller;

import com.aegisx.backend.entity.Incident;
import com.aegisx.backend.simulation.ThreatLibraryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ThreatLibraryService threatLibraryService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getReports() {
        return ResponseEntity.ok(List.of(
            Map.of("id", "REP-2026-08", "name", "August Security Summary", "type", "Monthly Executive", "date", "2026-08-01", "size", "2.4 MB", "isStatic", true),
            Map.of("id", "REP-2026-07", "name", "July Threat Landscape", "type", "Technical Analysis", "date", "2026-07-01", "size", "4.1 MB", "isStatic", true),
            Map.of("id", "REP-INC-092", "name", "Incident Report: Ransomware Attempt", "type", "Incident Response", "date", "2026-07-15", "size", "1.2 MB", "isStatic", true),
            Map.of("id", "REP-SIM-JSON", "name", "Simulation Engine Threat Scenarios", "type", "System Export", "date", LocalDate.now().toString(), "size", "Dynamic", "isStatic", false)
        ));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReports() throws Exception {
        var scenarios = threatLibraryService.getAllScenarios();
        byte[] jsonData = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(scenarios);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=aegisx-report.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonData);
    }
}
