package com.tizadestribution.app.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        AuthenticatedUserDto user
) {
}
