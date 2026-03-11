package com.tizadestribution.app.user.dto;

import com.tizadestribution.app.user.model.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminUserUpsertRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank String role,
        @NotNull UserStatus status,
        @Size(min = 8, max = 120) String password
) {
}
