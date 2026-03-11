package com.tizadestribution.app.user.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String name,
        String email,
        String role,
        String status,
        List<String> permissions,
        Instant createdAt,
        Instant lastLoginAt
) {
}
