package com.tizadestribution.app.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateMyCustomerProfileRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 30) String phone,
        @Size(max = 180) String companyName,
        @Size(max = 80) String taxId,
        @Size(max = 255) String addressLine1,
        @Size(max = 120) String city,
        @Size(max = 120) String state,
        @Size(max = 30) String zipCode,
        @Size(max = 120) String country
) {
}
