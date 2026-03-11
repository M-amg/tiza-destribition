package com.tizadestribution.app.setting.dto;

import com.tizadestribution.app.shared.model.SettingValueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StoreSettingUpsertRequest(
        @NotBlank @Size(max = 120) String key,
        @NotNull SettingValueType valueType,
        @NotBlank @Size(max = 4000) String value,
        @Size(max = 500) String description,
        boolean isPublic
) {
}
