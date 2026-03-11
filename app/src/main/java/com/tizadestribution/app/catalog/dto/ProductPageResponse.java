package com.tizadestribution.app.catalog.dto;

import java.util.List;

public record ProductPageResponse(
        List<ProductSummaryResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages,
        boolean hasNext
) {
}
