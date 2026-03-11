package com.tizadestribution.app.auth;

import com.tizadestribution.app.auth.dto.AuthResponse;
import com.tizadestribution.app.auth.dto.LoginRequest;
import com.tizadestribution.app.auth.dto.RegisterRequest;
import com.tizadestribution.app.auth.service.AuthService;
import com.tizadestribution.app.customer.entity.CustomerProfile;
import com.tizadestribution.app.customer.repository.CustomerProfileRepository;
import com.tizadestribution.app.user.entity.AppUser;
import com.tizadestribution.app.user.entity.Role;
import com.tizadestribution.app.user.model.CustomerType;
import com.tizadestribution.app.user.model.RoleName;
import com.tizadestribution.app.user.model.UserStatus;
import com.tizadestribution.app.user.repository.AppUserRepository;
import com.tizadestribution.app.user.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AuthServiceGuestUpgradeTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerUpgradesGuestAccountAndAllowsLogin() {
        String email = "guest-checkout@example.com";
        String password = "StrongPass123";
        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER).orElseGet(() -> {
            Role role = new Role();
            role.setName(RoleName.ROLE_CUSTOMER);
            role.setDescription("Default customer role");
            return roleRepository.save(role);
        });

        AppUser guestUser = new AppUser();
        guestUser.setEmail(email);
        guestUser.setPasswordHash(passwordEncoder.encode("temporary-password"));
        guestUser.setFullName("Guest Customer");
        guestUser.setPhone("0600000000");
        guestUser.setStatus(UserStatus.INACTIVE);
        guestUser.setCustomerType(CustomerType.B2C);
        guestUser.setEmailVerified(false);
        guestUser.setGuestAccount(true);
        guestUser.setRoles(Set.of(customerRole));
        AppUser savedGuestUser = appUserRepository.save(guestUser);

        CustomerProfile profile = new CustomerProfile();
        profile.setUser(savedGuestUser);
        profile.setAddress("Old address");
        profile.setCity("Old city");
        customerProfileRepository.save(profile);

        AuthResponse registerResponse = authService.register(new RegisterRequest(
                "Checkout Customer",
                email,
                password,
                password,
                CustomerType.B2C,
                "0611111111",
                null,
                null,
                "New address",
                "Casablanca"
        ));

        assertThat(registerResponse).isNotNull();
        assertThat(registerResponse.accessToken()).isNotBlank();
        assertThat(registerResponse.refreshToken()).isNotBlank();
        assertThat(registerResponse.user()).isNotNull();
        assertThat(registerResponse.user().email()).isEqualTo(email);

        AppUser upgradedUser = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(upgradedUser.isGuestAccount()).isFalse();
        assertThat(upgradedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(passwordEncoder.matches(password, upgradedUser.getPasswordHash())).isTrue();

        CustomerProfile upgradedProfile = customerProfileRepository.findByUser_Id(upgradedUser.getId()).orElseThrow();
        assertThat(upgradedProfile.getAddress()).isEqualTo("New address");
        assertThat(upgradedProfile.getCity()).isEqualTo("Casablanca");

        AuthResponse loginResponse = authService.login(new LoginRequest(email, password));
        assertThat(loginResponse.accessToken()).isNotBlank();
        assertThat(loginResponse.user().email()).isEqualTo(email);
    }
}
