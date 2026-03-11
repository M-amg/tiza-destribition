package com.tizadestribution.app.catalog.dto;

import java.util.UUID;

public record AdminCategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        Integer sortOrder,
        String status,
        UUID parentId,
        long productCount
) {
}
