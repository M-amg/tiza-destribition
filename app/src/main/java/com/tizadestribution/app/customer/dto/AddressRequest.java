package com.tizadestribution.app.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @Size(max = 80) String label,
        @NotBlank @Size(max = 120) String recipientName,
        @Size(max = 30) String phone,
        @NotBlank @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @NotBlank @Size(max = 120) String city,
        @Size(max = 120) String state,
        @Size(max = 30) String zipCode,
        @NotBlank @Size(max = 120) String country,
        boolean defaultShipping,
        boolean defaultBilling
) {
}
