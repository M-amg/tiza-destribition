package com.tizadestribution.app.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        UUID orderId,
        String orderNumber,
        String orderStatus,
        boolean read,
        Instant createdAt,
        Instant readAt
) {
}
