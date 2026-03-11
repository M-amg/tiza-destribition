package com.tizadestribution.app.customer.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MyCustomerProfileResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String customerType,
        String status,
        Instant createdAt,
        Instant lastLoginAt,
        String companyName,
        String taxId,
        String addressLine1,
        String city,
        String state,
        String zipCode,
        String country,
        long totalOrders,
        BigDecimal totalSpent
) {
}
