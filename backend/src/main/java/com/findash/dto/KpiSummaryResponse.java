package com.findash.dto;

import com.findash.model.KpiSnapshot;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record KpiSummaryResponse(
    BigDecimal totalRevenue,
    BigDecimal revenueChange,
    long transactionVolume,
    long transactionVolumeChange,
    BigDecimal fraudRate,
    BigDecimal fraudRateChange,
    BigDecimal avgTransactionValue,
    LocalDateTime snapshotTime
) {
    public static KpiSummaryResponse from(KpiSnapshot s) {
        return new KpiSummaryResponse(
            s.getTotalRevenue(),
            s.getRevenueChange(),
            s.getTransactionVolume(),
            s.getTransactionVolumeChange(),
            s.getFraudRate(),
            s.getFraudRateChange(),
            s.getAvgTransactionValue(),
            s.getCreatedAt()
        );
    }
}
