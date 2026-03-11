package com.tizadestribution.app.contact.dto;

import java.util.UUID;

public record ContactMessageResponse(
        UUID id,
        String status,
        String message
) {
}
