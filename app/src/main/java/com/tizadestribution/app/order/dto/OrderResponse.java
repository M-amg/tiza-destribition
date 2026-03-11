package com.tizadestribution.app.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        String status,
        Boolean privateDetailsVisible,
        String customerType,
        String paymentMethod,
        String paymentStatus,
        String couponCode,
        BigDecimal couponDiscount,
        BigDecimal subtotal,
        BigDecimal shippingAmount,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        Instant placedAt,
        String shippingRecipientName,
        String shippingPhone,
        String shippingEmail,
        String shippingAddressLine1,
        String shippingAddressLine2,
        String shippingCity,
        String shippingState,
        String shippingZipCode,
        String shippingCountry,
        List<OrderItemResponse> items
) {
}
