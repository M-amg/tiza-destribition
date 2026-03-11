package com.tizadestribution.app.customer.dto;

import java.time.Instant;
import java.util.UUID;

public record AddressResponse(
        UUID id,
        String label,
        String recipientName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String zipCode,
        String country,
        boolean defaultShipping,
        boolean defaultBilling,
        Instant createdAt,
        Instant updatedAt
) {
}
