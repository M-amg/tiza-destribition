package com.tizadestribution.app.auth.service;

import com.tizadestribution.app.auth.dto.AuthResponse;
import com.tizadestribution.app.auth.dto.AuthenticatedUserDto;
import com.tizadestribution.app.auth.dto.ForgotPasswordRequest;
import com.tizadestribution.app.auth.dto.LoginRequest;
import com.tizadestribution.app.auth.dto.LogoutRequest;
import com.tizadestribution.app.auth.dto.MeResponse;
import com.tizadestribution.app.auth.dto.RefreshTokenRequest;
import com.tizadestribution.app.auth.dto.RegisterRequest;
import com.tizadestribution.app.auth.entity.PasswordResetToken;
import com.tizadestribution.app.auth.entity.RefreshToken;
import com.tizadestribution.app.auth.repository.PasswordResetTokenRepository;
import com.tizadestribution.app.auth.repository.RefreshTokenRepository;
import com.tizadestribution.app.auth.security.JwtService;
import com.tizadestribution.app.auth.security.TokenHashingService;
import com.tizadestribution.app.customer.entity.CompanyProfile;
import com.tizadestribution.app.customer.entity.CustomerProfile;
import com.tizadestribution.app.customer.repository.CompanyProfileRepository;
import com.tizadestribution.app.customer.repository.CustomerProfileRepository;
import com.tizadestribution.app.user.entity.AppUser;
import com.tizadestribution.app.user.entity.Role;
import com.tizadestribution.app.user.model.CustomerType;
import com.tizadestribution.app.user.model.RoleName;
import com.tizadestribution.app.user.model.UserStatus;
import com.tizadestribution.app.user.repository.AppUserRepository;
import com.tizadestribution.app.user.repository.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenHashingService tokenHashingService;

    public AuthService(
            AuthenticationManager authenticationManager,
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            CustomerProfileRepository customerProfileRepository,
            CompanyProfileRepository companyProfileRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenHashingService tokenHashingService
    ) {
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenHashingService = tokenHashingService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password confirmation does not match");
        }

        if (request.customerType() == CustomerType.B2B && isBlank(request.companyName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company name is required for B2B registration");
        }

        AppUser existingUser = appUserRepository.findByEmailIgnoreCase(email).orElse(null);
        if (existingUser != null && !existingUser.isGuestAccount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if (existingUser != null) {
            return upgradeGuestAccount(existingUser, request, email);
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setPhone(trimToNull(request.phone()));
        user.setStatus(UserStatus.ACTIVE);
        user.setCustomerType(request.customerType());
        user.setEmailVerified(false);
        user.setGuestAccount(false);
        user.setRoles(Set.of(getOrCreateRole(RoleName.ROLE_CUSTOMER, "Default customer role")));
        AppUser savedUser = appUserRepository.save(user);

        CustomerProfile customerProfile = new CustomerProfile();
        customerProfile.setUser(savedUser);
        customerProfile.setAddress(trimToNull(request.address()));
        customerProfile.setCity(trimToNull(request.city()));
        customerProfileRepository.save(customerProfile);

        if (savedUser.getCustomerType() == CustomerType.B2B) {
            CompanyProfile companyProfile = new CompanyProfile();
            companyProfile.setUser(savedUser);
            companyProfile.setCompanyName(trimToNull(request.companyName()));
            companyProfile.setTaxId(trimToNull(request.taxId()));
            companyProfile.setAddress(trimToNull(request.address()));
            companyProfile.setCity(trimToNull(request.city()));
            companyProfileRepository.save(companyProfile);
        }

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);
        storeRefreshToken(savedUser, refreshToken);

        return toAuthResponse(savedUser, accessToken, refreshToken);
    }

    private AuthResponse upgradeGuestAccount(AppUser user, RegisterRequest request, String email) {
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setPhone(trimToNull(request.phone()));
        user.setStatus(UserStatus.ACTIVE);
        user.setCustomerType(request.customerType());
        user.setEmailVerified(false);
        user.setGuestAccount(false);
        user.setRoles(Set.of(getOrCreateRole(RoleName.ROLE_CUSTOMER, "Default customer role")));
        AppUser savedUser = appUserRepository.save(user);

        CustomerProfile customerProfile = customerProfileRepository.findByUser_Id(savedUser.getId()).orElseGet(() -> {
            CustomerProfile profile = new CustomerProfile();
            profile.setUser(savedUser);
            return profile;
        });
        customerProfile.setAddress(trimToNull(request.address()));
        customerProfile.setCity(trimToNull(request.city()));
        customerProfileRepository.save(customerProfile);

        if (savedUser.getCustomerType() == CustomerType.B2B) {
            CompanyProfile companyProfile = companyProfileRepository.findByUser_Id(savedUser.getId()).orElseGet(() -> {
                CompanyProfile profile = new CompanyProfile();
                profile.setUser(savedUser);
                return profile;
            });
            companyProfile.setCompanyName(trimToNull(request.companyName()));
            companyProfile.setTaxId(trimToNull(request.taxId()));
            companyProfile.setAddress(trimToNull(request.address()));
            companyProfile.setCity(trimToNull(request.city()));
            companyProfileRepository.save(companyProfile);
        }

        revokeAllActiveRefreshTokens(savedUser.getId());
        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);
        storeRefreshToken(savedUser, refreshToken);
        return toAuthResponse(savedUser, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (BadCredentialsException | DisabledException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
        }

        user.setLastLoginAt(Instant.now());
        appUserRepository.save(user);

        revokeAllActiveRefreshTokens(user.getId());
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        storeRefreshToken(user, refreshToken);

        return toAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String rawRefreshToken = request.refreshToken();
        String email;
        try {
            email = normalizeEmail(jwtService.extractUsername(rawRefreshToken));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (!jwtService.isTokenValid(rawRefreshToken, user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        if (!"refresh".equals(jwtService.extractTokenType(rawRefreshToken))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token type is invalid");
        }

        String hashed = tokenHashingService.sha256(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHashAndRevokedFalse(hashed)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        storeRefreshToken(user, newRefreshToken);

        return toAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional(readOnly = true)
    public MeResponse me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        AppUser user = appUserRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getCustomerType(),
                user.getStatus(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(java.util.stream.Collectors.toSet())
        );
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());
        appUserRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            token.setTokenHash(tokenHashingService.sha256(UUID.randomUUID().toString()));
            token.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
            token.setUsed(false);
            passwordResetTokenRepository.save(token);
        });
    }

    @Transactional
    public void logout(Authentication authentication, LogoutRequest request) {
        if (request == null || isBlank(request.refreshToken())) {
            return;
        }

        String hashed = tokenHashingService.sha256(request.refreshToken());
        refreshTokenRepository.findByTokenHashAndRevokedFalse(hashed).ifPresent(token -> {
            if (authentication != null && authentication.getName() != null) {
                String authEmail = normalizeEmail(authentication.getName());
                if (!authEmail.equalsIgnoreCase(token.getUser().getEmail())) {
                    return;
                }
            }
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private AuthResponse toAuthResponse(AppUser user, String accessToken, String refreshToken) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenTtlSeconds(),
                new AuthenticatedUserDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getPhone(),
                        user.getCustomerType(),
                        user.getStatus(),
                        user.getRoles().stream().map(role -> role.getName().name()).collect(java.util.stream.Collectors.toSet())
                )
        );
    }

    private void storeRefreshToken(AppUser user, String rawRefreshToken) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHashingService.sha256(rawRefreshToken));
        refreshToken.setExpiresAt(jwtService.extractExpiration(rawRefreshToken));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
    }

    private void revokeAllActiveRefreshTokens(UUID userId) {
        refreshTokenRepository.findAllByUser_IdAndRevokedFalse(userId)
                .forEach(token -> token.setRevoked(true));
    }

    private Role getOrCreateRole(RoleName roleName, String description) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription(description);
            return roleRepository.save(role);
        });
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
