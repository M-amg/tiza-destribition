package com.tizadestribution.app.cart.dto;

import java.util.UUID;

public record CheckoutResponse(
        UUID orderId,
        String orderNumber,
        UUID invoiceId,
        String invoiceNumber,
        boolean canCreateAccount,
        String registrationEmail,
        String registrationFullName,
        String registrationPhone
) {
}
