package com.tizadestribution.app.order.dto;

import com.tizadestribution.app.shared.model.OrderStatus;
import com.tizadestribution.app.shared.model.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus status,
        PaymentStatus paymentStatus,
        @Size(max = 500) String note
) {
}
