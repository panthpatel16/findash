package com.findash.dto;

import com.findash.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FlaggedTransactionResponse(
    Long id,
    String referenceId,
    BigDecimal amount,
    String currency,
    String type,
    String flagReason,
    LocalDateTime createdAt
) {
    public static FlaggedTransactionResponse from(Transaction t) {
        return new FlaggedTransactionResponse(
            t.getId(),
            t.getReferenceId(),
            t.getAmount(),
            t.getCurrency(),
            t.getType().name(),
            t.getFlagReason(),
            t.getCreatedAt()
        );
    }
}
