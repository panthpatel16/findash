package com.findash.controller;

import com.findash.dto.KpiHistoryPoint;
import com.findash.dto.KpiHistoryResponse;
import com.findash.dto.KpiSummaryResponse;
import com.findash.service.KpiAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kpi")
@RequiredArgsConstructor
public class KpiController {

    private final KpiAggregationService kpiService;

    /**
     * Current KPI snapshot — all authenticated roles.
     * Also serves as the REST polling fallback if WebSocket is unavailable.
     */
    @GetMapping("/summary")
    public ResponseEntity<KpiSummaryResponse> summary() {
        return ResponseEntity.ok(KpiSummaryResponse.from(kpiService.getLatest()));
    }

    /**
     * KPI time-series for chart rendering — ANALYST and ADMIN only.
     *
     * @param days number of days to look back (default 30, max 90)
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<KpiHistoryResponse> history(
            @RequestParam(defaultValue = "30") int days) {
        if (days < 1 || days > 90) {
            return ResponseEntity.badRequest().build();
        }
        List<KpiHistoryPoint> points = kpiService.getHistory(days).stream()
            .map(s -> new KpiHistoryPoint(
                s.getTotalRevenue(),
                s.getTransactionVolume(),
                s.getFraudRate(),
                s.getCreatedAt()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(new KpiHistoryResponse(points, days));
    }
}
