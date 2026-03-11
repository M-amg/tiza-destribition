package com.tizadestribution.app.auth.dto;

import com.tizadestribution.app.user.model.CustomerType;
import com.tizadestribution.app.user.model.UserStatus;

import java.util.Set;
import java.util.UUID;

public record AuthenticatedUserDto(
        UUID id,
        String email,
        String fullName,
        String phone,
        CustomerType customerType,
        UserStatus status,
        Set<String> roles
) {
}
