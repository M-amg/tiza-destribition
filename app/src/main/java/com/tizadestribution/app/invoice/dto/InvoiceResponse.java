package com.tizadestribution.app.invoice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String invoiceNumber,
        UUID orderId,
        String orderNumber,
        String status,
        Instant issuedAt,
        Instant dueAt,
        Instant paidAt,
        BigDecimal totalAmount,
        String currency,
        String pdfUrl
) {
}
