package com.tizadestribution.app.customer.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminCustomerSummaryResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String customerType,
        String status,
        Instant createdAt,
        String companyName,
        String addressLine1,
        String city,
        String state,
        String zipCode,
        String country,
        long totalOrders,
        BigDecimal totalSpent
) {
}
