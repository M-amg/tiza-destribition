package com.tizadestribution.app.user.service;

import com.tizadestribution.app.user.dto.AdminRoleResponse;
import com.tizadestribution.app.user.dto.AdminUserResponse;
import com.tizadestribution.app.user.dto.AdminUserUpsertRequest;
import com.tizadestribution.app.user.dto.UpdateAdminUserStatusRequest;
import com.tizadestribution.app.user.entity.AppUser;
import com.tizadestribution.app.user.entity.Role;
import com.tizadestribution.app.user.model.RoleName;
import com.tizadestribution.app.user.model.UserStatus;
import com.tizadestribution.app.user.repository.AppUserRepository;
import com.tizadestribution.app.user.repository.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class AdminUserService {

    private static final Set<RoleName> ADMIN_ROLES = Set.of(
            RoleName.ROLE_ADMIN,
            RoleName.ROLE_MANAGER,
            RoleName.ROLE_STAFF
    );

    private static final String SUPER_ADMIN_EMAIL = "admin@tizadistribution.com";

    private static final List<AdminRoleResponse> ROLE_DEFINITIONS = List.of(
            new AdminRoleResponse(
                    "super_admin",
                    "Super Admin",
                    "Full access to all features",
                    List.of("all")
            ),
            new AdminRoleResponse(
                    "admin",
                    "Admin",
                    "Manage most features except settings",
                    List.of(
                            "manage_products",
                            "manage_categories",
                            "manage_orders",
                            "manage_customers",
                            "manage_coupons",
                            "manage_pricing",
                            "view_reports"
                    )
            ),
            new AdminRoleResponse(
                    "manager",
                    "Manager",
                    "Manage products and inventory",
                    List.of("manage_products", "manage_inventory", "view_reports")
            ),
            new AdminRoleResponse(
                    "staff",
                    "Staff",
                    "Limited access to specific features",
                    List.of("view_orders", "view_customers")
            )
    );

    private static final Map<String, List<String>> ROLE_PERMISSIONS = ROLE_DEFINITIONS.stream()
            .collect(java.util.stream.Collectors.toMap(AdminRoleResponse::key, AdminRoleResponse::permissions));

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> allAdminUsers() {
        return appUserRepository.findDistinctByRoles_NameIn(ADMIN_ROLES).stream()
                .map(this::toResponse)
                .sorted(Comparator.comparing(AdminUserResponse::createdAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse adminUserById(UUID userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!isAdminUser(user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found");
        }

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<AdminRoleResponse> allRoleDefinitions() {
        return ROLE_DEFINITIONS;
    }

    @Transactional
    public AdminUserResponse createAdminUser(AdminUserUpsertRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        RoleName roleName = roleNameFromKey(request.role());

        AppUser user = new AppUser();
        user.setFullName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setStatus(request.status());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(getOrCreateRole(roleName)));

        return toResponse(appUserRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateAdminUser(UUID userId, AdminUserUpsertRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!isAdminUser(user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found");
        }

        if (isSuperAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Super admin cannot be edited");
        }

        String normalizedEmail = normalizeEmail(request.email());
        appUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter((existing) -> !existing.getId().equals(user.getId()))
                .ifPresent((existing) -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
                });

        RoleName roleName = roleNameFromKey(request.role());

        user.setFullName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setStatus(request.status());
        user.setRoles(Set.of(getOrCreateRole(roleName)));

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return toResponse(appUserRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateStatus(UUID userId, UpdateAdminUserStatusRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!isAdminUser(user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found");
        }

        if (isSuperAdmin(user) && request.status() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Super admin cannot be deactivated");
        }

        user.setStatus(request.status());
        return toResponse(appUserRepository.save(user));
    }

    private AdminUserResponse toResponse(AppUser user) {
        String role = resolveRole(user);
        List<String> permissions = ROLE_PERMISSIONS.getOrDefault(role, List.of());
        String status = switch (user.getStatus()) {
            case ACTIVE -> "active";
            case INACTIVE -> "inactive";
            case BLOCKED -> "inactive";
        };

        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                role,
                status,
                permissions,
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }

    private String resolveRole(AppUser user) {
        Set<RoleName> roleNames = user.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet());

        if (isSuperAdmin(user)) {
            return "super_admin";
        }

        if (roleNames.contains(RoleName.ROLE_ADMIN)) {
            return "admin";
        }

        if (roleNames.contains(RoleName.ROLE_MANAGER)) {
            return "manager";
        }

        if (roleNames.contains(RoleName.ROLE_STAFF)) {
            return "staff";
        }

        return "staff";
    }

    private RoleName roleNameFromKey(String key) {
        if (key == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        return switch (key.trim().toLowerCase()) {
            case "admin" -> RoleName.ROLE_ADMIN;
            case "manager" -> RoleName.ROLE_MANAGER;
            case "staff" -> RoleName.ROLE_STAFF;
            case "super_admin" -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Super admin cannot be assigned");
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role: " + key);
        };
    }

    private Role getOrCreateRole(RoleName roleName) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription(switch (roleName) {
                case ROLE_ADMIN -> "Administrative user role";
                case ROLE_MANAGER -> "Manager user role";
                case ROLE_STAFF -> "Staff user role";
                case ROLE_CUSTOMER -> "Customer role";
            });
            return roleRepository.save(role);
        });
    }

    private boolean isAdminUser(AppUser user) {
        return user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(ADMIN_ROLES::contains);
    }

    private boolean isSuperAdmin(AppUser user) {
        return user.getEmail() != null
                && user.getEmail().equalsIgnoreCase(SUPER_ADMIN_EMAIL)
                && user.getRoles().stream().map(Role::getName).anyMatch((role) -> role == RoleName.ROLE_ADMIN);
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
