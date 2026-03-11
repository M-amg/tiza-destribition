package com.tizadestribution.app.catalog.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminProductDetailResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String shortDescription,
        String brand,
        String sku,
        String barcode,
        BigDecimal costPrice,
        BigDecimal b2cPrice,
        BigDecimal b2bPrice,
        BigDecimal originalPrice,
        BigDecimal discountValue,
        String discountType,
        String discountAppliesTo,
        Integer minB2BQuantity,
        Integer stockQuantity,
        Integer minimumStockLevel,
        boolean inStock,
        boolean featured,
        boolean isNew,
        String status,
        CategoryResponse category,
        List<String> images,
        List<ProductSpecificationResponse> specifications,
        Instant createdAt,
        Instant updatedAt
) {
}
