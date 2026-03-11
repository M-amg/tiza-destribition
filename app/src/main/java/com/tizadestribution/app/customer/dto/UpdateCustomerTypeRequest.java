package com.tizadestribution.app.customer.dto;

import com.tizadestribution.app.user.model.CustomerType;
import jakarta.validation.constraints.NotNull;

public record UpdateCustomerTypeRequest(
        @NotNull CustomerType customerType
) {
}
