package com.tizadestribution.app.auth.security;

import com.tizadestribution.app.user.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.security.jwt.secret}")
    private String secret;

    @Value("${app.security.jwt.access-token-ttl-minutes:15}")
    private long accessTokenTtlMinutes;

    @Value("${app.security.jwt.refresh-token-ttl-days:14}")
    private long refreshTokenTtlDays;

    @Value("${app.security.jwt.issuer:tiza-app}")
    private String issuer;

    public String generateAccessToken(AppUser user) {
        List<String> roles = user.getRoles().stream().map(role -> role.getName().name()).toList();
        return buildToken(
                Map.of(
                        "roles", roles,
                        "customerType", user.getCustomerType().name(),
                        "tokenType", "access"
                ),
                user.getEmail(),
                Instant.now().plus(accessTokenTtlMinutes, ChronoUnit.MINUTES)
        );
    }

    public String generateRefreshToken(AppUser user) {
        return buildToken(
                Map.of("tokenType", "refresh"),
                user.getEmail(),
                Instant.now().plus(refreshTokenTtlDays, ChronoUnit.DAYS)
        );
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Instant extractExpiration(String token) {
        return extractClaim(token, claims -> claims.getExpiration().toInstant());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean isTokenValid(String token, String username) {
        String tokenUsername = extractUsername(token);
        return tokenUsername.equalsIgnoreCase(username) && !isTokenExpired(token);
    }

    public long getAccessTokenTtlSeconds() {
        return accessTokenTtlMinutes * 60;
    }

    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        Object rolesValue = claims.get("roles");
        if (rolesValue instanceof List<?> roles) {
            return roles.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    public String extractTokenType(String token) {
        Claims claims = extractAllClaims(token);
        Object tokenType = claims.get("tokenType");
        return tokenType == null ? "" : tokenType.toString();
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, Instant expiresAt) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).isBefore(Instant.now());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
