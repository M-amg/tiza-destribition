package com.tizadestribution.app.catalog.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminProductSummaryResponse(
        UUID id,
        String name,
        String slug,
        String shortDescription,
        String brand,
        String sku,
        String imageUrl,
        UUID categoryId,
        String categoryName,
        BigDecimal costPrice,
        BigDecimal b2cPrice,
        BigDecimal b2bPrice,
        Integer stockQuantity,
        Integer minimumStockLevel,
        boolean featured,
        boolean isNew,
        boolean inStock,
        String status,
        Instant updatedAt
) {
}
