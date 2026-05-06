package com.findash.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record KpiHistoryPoint(
    BigDecimal totalRevenue,
    long transactionVolume,
    BigDecimal fraudRate,
    LocalDateTime timestamp
) {}
