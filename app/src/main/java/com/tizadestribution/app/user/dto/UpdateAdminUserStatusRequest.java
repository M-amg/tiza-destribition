package com.tizadestribution.app.user.dto;

import com.tizadestribution.app.user.model.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAdminUserStatusRequest(
        @NotNull UserStatus status
) {
}
