package com.tizadestribution.app.cart.dto;

import com.tizadestribution.app.shared.model.PaymentMethodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @Size(max = 120) String recipientName,
        @Size(max = 30) String phone,
        @Size(max = 190) String email,
        @NotBlank @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @NotBlank @Size(max = 120) String city,
        @Size(max = 120) String state,
        @Size(max = 30) String zipCode,
        @Size(max = 120) String country,
        @NotNull PaymentMethodType paymentMethod,
        @Size(max = 1000) String notes
) {
}
