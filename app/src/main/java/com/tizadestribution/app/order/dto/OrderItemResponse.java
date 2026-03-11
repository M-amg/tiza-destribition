package com.tizadestribution.app.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String imageUrl,
        String sku,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}
