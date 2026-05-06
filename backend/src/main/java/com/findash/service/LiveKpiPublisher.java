package com.findash.service;

import com.findash.dto.KpiSummaryResponse;
import com.findash.model.KpiSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveKpiPublisher {

    private final SimpMessagingTemplate broker;
    private final KpiAggregationService kpiService;

    /**
     * Every 5 seconds, recompute KPIs and broadcast to all /topic/kpi subscribers.
     * Single computation regardless of subscriber count — efficient push model.
     * Polling at 5s across 30 sessions = ~360 req/min; WebSocket = 1 push/tick.
     */
    @Scheduled(fixedRate = 5000)
    public void publishLiveTick() {
        try {
            KpiSnapshot snap = kpiService.computeAndSave();
            KpiSummaryResponse payload = KpiSummaryResponse.from(snap);
            broker.convertAndSend("/topic/kpi", payload);
            log.debug("Published KPI tick: revenue={} volume={}",
                snap.getTotalRevenue(), snap.getTransactionVolume());
        } catch (Exception e) {
            log.error("WebSocket KPI publish failed: {}", e.getMessage(), e);
        }
    }
}
