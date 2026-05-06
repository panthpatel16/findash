package com.findash.dto;

import java.math.BigDecimal;

public record PeriodReportResponse(
    String period,
    BigDecimal totalRevenue,
    long transactionVolume,
    BigDecimal avgDailyRevenue,
    BigDecimal peakDayRevenue,
    long flaggedTransactions,
    BigDecimal fraudRate
) {}
