package com.tizadestribution.app.user.controller;

import com.tizadestribution.app.user.dto.AdminRoleResponse;
import com.tizadestribution.app.user.dto.AdminUserResponse;
import com.tizadestribution.app.user.dto.AdminUserUpsertRequest;
import com.tizadestribution.app.user.dto.UpdateAdminUserStatusRequest;
import com.tizadestribution.app.user.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> allUsers() {
        return adminUserService.allAdminUsers();
    }

    @GetMapping("/users/{id}")
    public AdminUserResponse userById(@PathVariable UUID id) {
        return adminUserService.adminUserById(id);
    }

    @GetMapping("/roles")
    public List<AdminRoleResponse> allRoles() {
        return adminUserService.allRoleDefinitions();
    }

    @PostMapping("/users")
    public AdminUserResponse createUser(@Valid @RequestBody AdminUserUpsertRequest request) {
        return adminUserService.createAdminUser(request);
    }

    @PutMapping("/users/{id}")
    public AdminUserResponse updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUserUpsertRequest request
    ) {
        return adminUserService.updateAdminUser(id, request);
    }

    @PatchMapping("/users/{id}/status")
    public AdminUserResponse updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAdminUserStatusRequest request
    ) {
        return adminUserService.updateStatus(id, request);
    }
}
