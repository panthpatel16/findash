package com.findash.repository;

import com.findash.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFlaggedTrueOrderByCreatedAtDesc();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt >= :since")
    long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.type = 'DEPOSIT' AND t.status = 'COMPLETED' AND t.createdAt >= :since")
    BigDecimal sumRevenueSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.flagged = true AND t.createdAt >= :since")
    long countFlaggedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM Transaction t WHERE t.createdAt >= :since")
    BigDecimal avgAmountSince(@Param("since") LocalDateTime since);

    @Query(value =
        "SELECT COALESCE(MAX(daily_total), 0) FROM (" +
        "  SELECT SUM(amount) AS daily_total " +
        "  FROM transactions " +
        "  WHERE type = 'DEPOSIT' AND status = 'COMPLETED' AND created_at >= :since " +
        "  GROUP BY DATE(created_at)" +
        ") AS daily_sums",
        nativeQuery = true)
    BigDecimal maxDailyRevenueSince(@Param("since") LocalDateTime since);
}
