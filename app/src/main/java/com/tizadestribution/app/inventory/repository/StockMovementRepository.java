package com.tizadestribution.app.inventory.repository;

import com.tizadestribution.app.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    @EntityGraph(attributePaths = {"product", "changedByUser"})
    List<StockMovement> findAllByOrderByCreatedAtDesc();

    List<StockMovement> findByProduct_IdOrderByCreatedAtDesc(UUID productId);
}
