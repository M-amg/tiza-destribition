package com.tizadestribution.app.catalog.dto;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        Integer sortOrder,
        Long productCount
) {
}
