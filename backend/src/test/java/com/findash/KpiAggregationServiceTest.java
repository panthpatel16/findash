package com.findash;

import com.findash.model.KpiSnapshot;
import com.findash.repository.KpiSnapshotRepository;
import com.findash.repository.TransactionRepository;
import com.findash.service.KpiAggregationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("KpiAggregationService Unit Tests")
class KpiAggregationServiceTest {

    @Mock
    private TransactionRepository txnRepo;
    @Mock
    private KpiSnapshotRepository snapshotRepo;

    @InjectMocks
    private KpiAggregationService kpiService;

    @BeforeEach
    void setUp() {
        when(txnRepo.sumRevenueSince(any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("500000.00"));
        when(txnRepo.countSince(any(LocalDateTime.class)))
                .thenReturn(1000L);
        when(txnRepo.countFlaggedSince(any(LocalDateTime.class)))
                .thenReturn(30L);
        when(txnRepo.avgAmountSince(any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("4500.00"));
        when(snapshotRepo.save(any(KpiSnapshot.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("computeAndSave should calculate fraud rate correctly")
    void computeAndSave_CalculatesFraudRate() {
        KpiSnapshot result = kpiService.computeAndSave();

        // 30 flagged out of 1000 total = 3.0%
        assertThat(result.getFraudRate())
                .isEqualByComparingTo(new BigDecimal("3.0000"));
    }

    @Test
    @DisplayName("computeAndSave should return zero fraud rate when no transactions")
    void computeAndSave_ZeroTransactions_ZeroFraudRate() {
        when(txnRepo.countSince(any())).thenReturn(0L);
        when(txnRepo.countFlaggedSince(any())).thenReturn(0L);

        KpiSnapshot result = kpiService.computeAndSave();

        assertThat(result.getFraudRate()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("computeAndSave should persist snapshot to repository")
    void computeAndSave_PersistsSnapshot() {
        kpiService.computeAndSave();
        verify(snapshotRepo, times(1)).save(any(KpiSnapshot.class));
    }

    @Test
    @DisplayName("getLatest should return existing snapshot without recomputing")
    void getLatest_ExistingSnapshot_ReturnsWithoutRecompute() {
        KpiSnapshot existing = KpiSnapshot.builder()
                .id(1L)
                .totalRevenue(new BigDecimal("999999.00"))
                .revenueChange(BigDecimal.ZERO)
                .transactionVolume(500L)
                .transactionVolumeChange(0L)
                .fraudRate(new BigDecimal("1.5000"))
                .fraudRateChange(BigDecimal.ZERO)
                .avgTransactionValue(new BigDecimal("3000.00"))
                .build();

        when(snapshotRepo.findTopByOrderByCreatedAtDesc())
                .thenReturn(Optional.of(existing));

        KpiSnapshot result = kpiService.getLatest();

        assertThat(result.getTotalRevenue())
                .isEqualByComparingTo(new BigDecimal("999999.00"));
        verify(txnRepo, never()).sumRevenueSince(any());
    }

    @Test
    @DisplayName("getLatest should compute when no snapshot exists")
    void getLatest_NoSnapshot_ComputesAndSaves() {
        when(snapshotRepo.findTopByOrderByCreatedAtDesc())
                .thenReturn(Optional.empty());

        kpiService.getLatest();

        verify(txnRepo, atLeastOnce()).sumRevenueSince(any());
        verify(snapshotRepo, times(1)).save(any(KpiSnapshot.class));
    }

    @Test
    @DisplayName("getHistory should query correct date range")
    void getHistory_QueriesCorrectDateRange() {
        when(snapshotRepo.findHistorySince(any(LocalDateTime.class)))
                .thenReturn(List.of());

        kpiService.getHistory(30);

        verify(snapshotRepo, times(1)).findHistorySince(any(LocalDateTime.class));
    }

    @Test
    @DisplayName("computeAndSave should set revenue to 2 decimal scale")
    void computeAndSave_RevenueScale_IsTwoDecimals() {
        KpiSnapshot result = kpiService.computeAndSave();
        assertThat(result.getTotalRevenue().scale()).isEqualTo(2);
    }
}