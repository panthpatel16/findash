package com.findash.service;

import com.findash.model.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class FraudDetectionService {

    private static final BigDecimal LARGE_TXN_THRESHOLD = new BigDecimal("10000.00");

    public record FraudResult(boolean flagged, String reason) {}

    public FraudResult evaluate(Transaction txn) {
        if (txn.getAmount().compareTo(LARGE_TXN_THRESHOLD) > 0) {
            log.warn("FRAUD_FLAG large_amount ref={} amount={}",
                txn.getReferenceId(), txn.getAmount());
            return new FraudResult(true, "LARGE_AMOUNT");
        }
        return new FraudResult(false, null);
    }
}
