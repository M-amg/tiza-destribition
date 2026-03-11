package com.tizadestribution.app.cart.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplyCouponRequest(
        @NotBlank String code
) {
}
