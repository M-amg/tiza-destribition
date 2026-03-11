package com.tizadestribution.app.setting.dto;

import com.tizadestribution.app.shared.model.SettingValueType;

import java.time.Instant;
import java.util.UUID;

public record StoreSettingResponse(
        UUID id,
        String key,
        SettingValueType valueType,
        String value,
        String description,
        boolean isPublic,
        Instant updatedAt
) {
}
