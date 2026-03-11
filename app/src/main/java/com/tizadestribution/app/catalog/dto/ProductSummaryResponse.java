package com.tizadestribution.app.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
        UUID id,
        String name,
        String slug,
        String shortDescription,
        String brand,
        String imageUrl,
        BigDecimal b2cPrice,
        BigDecimal b2bPrice,
        boolean featured,
        boolean isNew,
        boolean inStock,
        Integer stockQuantity,
        BigDecimal rating,
        Integer reviewCount
) {
}
