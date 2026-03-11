package com.tizadestribution.app.customer.controller;

import com.tizadestribution.app.customer.dto.MyCustomerProfileResponse;
import com.tizadestribution.app.customer.dto.UpdateMyCustomerProfileRequest;
import com.tizadestribution.app.customer.service.CustomerProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/profile")
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;

    public CustomerProfileController(CustomerProfileService customerProfileService) {
        this.customerProfileService = customerProfileService;
    }

    @GetMapping
    public MyCustomerProfileResponse myProfile(Authentication authentication) {
        return customerProfileService.myProfile(authentication);
    }

    @PutMapping
    public MyCustomerProfileResponse updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateMyCustomerProfileRequest request
    ) {
        return customerProfileService.updateMyProfile(authentication, request);
    }
}
