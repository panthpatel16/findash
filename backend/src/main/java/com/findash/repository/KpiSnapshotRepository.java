package com.findash.repository;

import com.findash.model.KpiSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface KpiSnapshotRepository extends JpaRepository<KpiSnapshot, Long> {

    Optional<KpiSnapshot> findTopByOrderByCreatedAtDesc();

    @Query("SELECT k FROM KpiSnapshot k WHERE k.createdAt >= :since ORDER BY k.createdAt ASC")
    List<KpiSnapshot> findHistorySince(@Param("since") LocalDateTime since);
}
