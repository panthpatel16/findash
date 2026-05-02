package com.findash.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "transactions",
    indexes = {
        @Index(name = "idx_txn_created", columnList = "createdAt DESC"),
        @Index(name = "idx_txn_flagged", columnList = "flagged"),
        @Index(name = "idx_txn_status",  columnList = "status"),
        @Index(name = "idx_txn_type",    columnList = "type")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    @Column(nullable = false)
    private Boolean flagged;

    @Column(length = 128)
    private String flagReason;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {
        if (this.flagged  == null) this.flagged  = false;
        if (this.currency == null) this.currency = "USD";
        if (this.status   == null) this.status   = TransactionStatus.PENDING;
    }

    public enum TransactionType {
        DEPOSIT, WITHDRAWAL, TRANSFER, PAYMENT
    }

    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED, FLAGGED
    }
}
