package com.tizadestribution.app.inventory.dto;

import java.time.Instant;
import java.util.UUID;

public record StockMovementResponse(
        UUID id,
        UUID productId,
        String productName,
        String changeType,
        Integer quantityChange,
        Integer previousQuantity,
        Integer newQuantity,
        String changedBy,
        String note,
        Instant createdAt
) {
}
