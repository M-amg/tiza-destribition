package com.tizadestribution.app.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GuestCheckoutItemRequest(
        @NotNull UUID productId,
        @Min(1) int quantity
) {
}
