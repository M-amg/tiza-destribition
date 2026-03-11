package com.tizadestribution.app.auth.controller;

import com.tizadestribution.app.auth.dto.AuthResponse;
import com.tizadestribution.app.auth.dto.ForgotPasswordRequest;
import com.tizadestribution.app.auth.dto.LoginRequest;
import com.tizadestribution.app.auth.dto.LogoutRequest;
import com.tizadestribution.app.auth.dto.MeResponse;
import com.tizadestribution.app.auth.dto.RefreshTokenRequest;
import com.tizadestribution.app.auth.dto.RegisterRequest;
import com.tizadestribution.app.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.me(authentication));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.accepted().body(Map.of(
                "message",
                "If the account exists, a password reset email will be sent."
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication, @RequestBody(required = false) LogoutRequest request) {
        authService.logout(authentication, request);
        return ResponseEntity.noContent().build();
    }
}
