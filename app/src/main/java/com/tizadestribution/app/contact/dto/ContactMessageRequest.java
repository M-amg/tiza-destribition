package com.tizadestribution.app.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 190) String email,
        @Size(max = 30) String phone,
        @NotBlank @Size(max = 180) String subject,
        @NotBlank @Size(max = 5000) String message
) {
}
