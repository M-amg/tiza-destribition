package com.tizadestribution.app.inventory.repository;

import com.tizadestribution.app.inventory.entity.PriceChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PriceChangeHistoryRepository extends JpaRepository<PriceChangeHistory, UUID> {
    List<PriceChangeHistory> findByProduct_IdOrderByChangedAtDesc(UUID productId);
}
