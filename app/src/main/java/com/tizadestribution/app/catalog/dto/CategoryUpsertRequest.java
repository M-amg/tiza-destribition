package com.tizadestribution.app.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CategoryUpsertRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 160) String slug,
        @Size(max = 500) String description,
        @Size(max = 500) String imageUrl,
        Integer sortOrder,
        String status,
        UUID parentId
) {
}
