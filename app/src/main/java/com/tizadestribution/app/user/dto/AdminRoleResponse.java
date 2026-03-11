package com.tizadestribution.app.user.dto;

import java.util.List;

public record AdminRoleResponse(
        String key,
        String name,
        String description,
        List<String> permissions
) {
}
