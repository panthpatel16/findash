package com.findash.service;

import com.findash.model.KpiSnapshot;
import com.findash.repository.KpiSnapshotRepository;
import com.findash.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KpiAggregationService {

    private final TransactionRepository txnRepo;
    private final KpiSnapshotRepository snapshotRepo;

    /**
     * Computes a fresh KPI snapshot from the last 30 days of transactions.
     * Compares against the prior 30-day window for delta / change metrics.
     * Both windows are derived from a single 60-day query to minimize DB round trips.
     */
    @Transactional
    public KpiSnapshot computeAndSave() {
        LocalDateTime now           = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo  = now.minusDays(60);

        BigDecimal currentRevenue  = txnRepo.sumRevenueSince(thirtyDaysAgo);
        BigDecimal rollingRevenue  = txnRepo.sumRevenueSince(sixtyDaysAgo);
        BigDecimal previousRevenue = rollingRevenue.subtract(currentRevenue);

        long currentVolume  = txnRepo.countSince(thirtyDaysAgo);
        long rollingVolume  = txnRepo.countSince(sixtyDaysAgo);
        long previousVolume = rollingVolume - currentVolume;

        long currentFlagged = txnRepo.countFlaggedSince(thirtyDaysAgo);
        BigDecimal fraudRate = currentVolume > 0
            ? BigDecimal.valueOf(currentFlagged)
                .divide(BigDecimal.valueOf(currentVolume), 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        BigDecimal revenueChangePct = previousRevenue.compareTo(BigDecimal.ZERO) > 0
            ? currentRevenue.subtract(previousRevenue)
                .divide(previousRevenue, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        BigDecimal avgTxnValue = txnRepo.avgAmountSince(thirtyDaysAgo);

        KpiSnapshot snap = KpiSnapshot.builder()
            .totalRevenue(currentRevenue.setScale(2, RoundingMode.HALF_UP))
            .revenueChange(revenueChangePct.setScale(4, RoundingMode.HALF_UP))
            .transactionVolume(currentVolume)
            .transactionVolumeChange(currentVolume - previousVolume)
            .fraudRate(fraudRate.setScale(4, RoundingMode.HALF_UP))
            .fraudRateChange(BigDecimal.ZERO)
            .avgTransactionValue(avgTxnValue.setScale(2, RoundingMode.HALF_UP))
            .build();

        return snapshotRepo.save(snap);
    }

    @Transactional(readOnly = true)
    public KpiSnapshot getLatest() {
        return snapshotRepo.findTopByOrderByCreatedAtDesc()
            .orElseGet(this::computeAndSave);
    }

    @Transactional(readOnly = true)
    public List<KpiSnapshot> getHistory(int days) {
        return snapshotRepo.findHistorySince(LocalDateTime.now().minusDays(days));
    }
}
