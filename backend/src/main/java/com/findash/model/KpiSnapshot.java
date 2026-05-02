package com.findash.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "kpi_snapshots",
    indexes = @Index(name = "idx_kpi_created", columnList = "createdAt DESC")
)
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalRevenue;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal revenueChange;

    @Column(nullable = false)
    private Long transactionVolume;

    @Column(nullable = false)
    private Long transactionVolumeChange;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal fraudRate;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal fraudRateChange;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal avgTransactionValue;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
