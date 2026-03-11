package com.tizadestribution.app.auth.dto;

import com.tizadestribution.app.user.model.CustomerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotBlank @Size(min = 8, max = 128) String confirmPassword,
        @NotNull CustomerType customerType,
        @Size(max = 30) String phone,
        @Size(max = 180) String companyName,
        @Size(max = 80) String taxId,
        @Size(max = 255) String address,
        @Size(max = 120) String city
) {
}
