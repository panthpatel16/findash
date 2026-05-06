package com.findash.dto;

import java.util.List;

public record KpiHistoryResponse(
    List<KpiHistoryPoint> points,
    int daysRequested
) {}
