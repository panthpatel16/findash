package com.findash.controller;

import com.findash.dto.FlaggedTransactionResponse;
import com.findash.dto.PeriodReportResponse;
import com.findash.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final TransactionRepository txnRepo;

    @GetMapping("/weekly")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<PeriodReportResponse> weekly() {
        return ResponseEntity.ok(buildReport("WEEKLY", 7));
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<PeriodReportResponse> monthly() {
        return ResponseEntity.ok(buildReport("MONTHLY", 30));
    }

    /**
     * Fraud audit queue — ADMIN only.
     * Returns all flagged transactions ordered by most recent first.
     */
    @GetMapping("/fraud")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FlaggedTransactionResponse>> fraudQueue() {
        List<FlaggedTransactionResponse> flagged = txnRepo
                .findByFlaggedTrueOrderByCreatedAtDesc()
                .stream()
                .map(FlaggedTransactionResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(flagged);
    }

    private PeriodReportResponse buildReport(String period, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        BigDecimal revenue = txnRepo.sumRevenueSince(since);
        long volume = txnRepo.countSince(since);
        long flaggedCount = txnRepo.countFlaggedSince(since);

        BigDecimal fraudRate = volume > 0
                ? BigDecimal.valueOf(flaggedCount)
                        .divide(BigDecimal.valueOf(volume), 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgDailyRevenue = days > 0
                ? revenue.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Real peak-day revenue from DB — not a hardcoded estimate
        BigDecimal peakDayRevenue = txnRepo.maxDailyRevenueSince(since);

        return new PeriodReportResponse(
                period, revenue, volume,
                avgDailyRevenue, peakDayRevenue,
                flaggedCount, fraudRate);
    }
}