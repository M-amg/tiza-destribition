package com.tizadestribution.app.catalog.dto;

public record UploadedImageResponse(
        String url,
        String fileName,
        long size,
        String contentType
) {
}
