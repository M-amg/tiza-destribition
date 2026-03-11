package com.tizadestribution.app.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record StockAdjustmentRequest(
        @NotNull UUID productId,
        @NotNull Integer quantityChange,
        @Size(max = 500) String note
) {
}
