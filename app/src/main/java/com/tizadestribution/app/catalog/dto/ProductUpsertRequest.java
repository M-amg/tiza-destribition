package com.tizadestribution.app.catalog.dto;

import com.tizadestribution.app.shared.model.DiscountAppliesTo;
import com.tizadestribution.app.shared.model.DiscountType;
import com.tizadestribution.app.shared.model.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductUpsertRequest(
        @NotNull UUID categoryId,
        @NotBlank @Size(max = 180) String name,
        @NotBlank @Size(max = 220) String slug,
        @NotBlank @Size(max = 4000) String description,
        @Size(max = 1000) String shortDescription,
        @NotBlank @Size(max = 120) String brand,
        @NotBlank @Size(max = 80) String sku,
        @Size(max = 120) String barcode,
        @NotNull @DecimalMin("0.00") BigDecimal costPrice,
        @NotNull @DecimalMin("0.00") BigDecimal b2cPrice,
        @NotNull @DecimalMin("0.00") BigDecimal b2bPrice,
        @DecimalMin("0.00") BigDecimal originalPrice,
        @NotNull DiscountType discountType,
        @DecimalMin("0.00") BigDecimal discountValue,
        @NotNull DiscountAppliesTo discountAppliesTo,
        @PositiveOrZero Integer minB2BQuantity,
        @NotNull @PositiveOrZero Integer stockQuantity,
        @NotNull @PositiveOrZero Integer minimumStockLevel,
        boolean featured,
        boolean isNew,
        @NotNull ProductStatus status,
        List<String> images
) {
}
