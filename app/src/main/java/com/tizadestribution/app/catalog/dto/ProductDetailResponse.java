package com.tizadestribution.app.catalog.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String shortDescription,
        String brand,
        String sku,
        String barcode,
        BigDecimal b2cPrice,
        BigDecimal b2bPrice,
        BigDecimal originalPrice,
        BigDecimal discountValue,
        String discountType,
        String discountAppliesTo,
        Integer minB2BQuantity,
        boolean inStock,
        Integer stockQuantity,
        BigDecimal rating,
        Integer reviewCount,
        boolean featured,
        boolean isNew,
        String status,
        CategoryResponse category,
        List<String> images,
        List<ProductSpecificationResponse> specifications
) {
}
