package com.tizadestribution.app.customer.service;

import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.customer.dto.MyCustomerProfileResponse;
import com.tizadestribution.app.customer.dto.UpdateMyCustomerProfileRequest;
import com.tizadestribution.app.customer.entity.CompanyProfile;
import com.tizadestribution.app.customer.entity.CustomerProfile;
import com.tizadestribution.app.customer.repository.CompanyProfileRepository;
import com.tizadestribution.app.customer.repository.CustomerProfileRepository;
import com.tizadestribution.app.order.entity.Order;
import com.tizadestribution.app.order.repository.OrderRepository;
import com.tizadestribution.app.user.entity.AppUser;
import com.tizadestribution.app.user.model.CustomerType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomerProfileService {

    private final CurrentUserService currentUserService;
    private final CustomerProfileRepository customerProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final OrderRepository orderRepository;

    public CustomerProfileService(
            CurrentUserService currentUserService,
            CustomerProfileRepository customerProfileRepository,
            CompanyProfileRepository companyProfileRepository,
            OrderRepository orderRepository
    ) {
        this.currentUserService = currentUserService;
        this.customerProfileRepository = customerProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public MyCustomerProfileResponse myProfile(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        CustomerProfile customerProfile = customerProfileRepository.findByUser_Id(user.getId()).orElse(null);
        CompanyProfile companyProfile = companyProfileRepository.findByUser_Id(user.getId()).orElse(null);
        return toResponse(user, customerProfile, companyProfile);
    }

    @Transactional
    public MyCustomerProfileResponse updateMyProfile(Authentication authentication, UpdateMyCustomerProfileRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        user.setFullName(request.fullName().trim());
        user.setPhone(trimToNull(request.phone()));

        CustomerProfile customerProfile = customerProfileRepository.findByUser_Id(user.getId()).orElseGet(() -> {
            CustomerProfile profile = new CustomerProfile();
            profile.setUser(user);
            return profile;
        });
        customerProfile.setAddress(trimToNull(request.addressLine1()));
        customerProfile.setCity(trimToNull(request.city()));
        customerProfile.setState(trimToNull(request.state()));
        customerProfile.setZipCode(trimToNull(request.zipCode()));
        customerProfile.setCountry(trimToNull(request.country()));
        customerProfileRepository.save(customerProfile);

        CompanyProfile companyProfile = companyProfileRepository.findByUser_Id(user.getId()).orElseGet(() -> {
            CompanyProfile profile = new CompanyProfile();
            profile.setUser(user);
            return profile;
        });
        if (user.getCustomerType() == CustomerType.B2B) {
          companyProfile.setCompanyName(trimToNull(request.companyName()));
          companyProfile.setTaxId(trimToNull(request.taxId()));
          companyProfile.setAddress(trimToNull(request.addressLine1()));
          companyProfile.setCity(trimToNull(request.city()));
          companyProfile.setCountry(trimToNull(request.country()));
          companyProfileRepository.save(companyProfile);
        }

        return toResponse(user, customerProfile, companyProfile);
    }

    private MyCustomerProfileResponse toResponse(AppUser user, CustomerProfile customerProfile, CompanyProfile companyProfile) {
        List<Order> orders = orderRepository.findByUser_IdOrderByPlacedAtDesc(user.getId());
        long totalOrders = orders.size();
        BigDecimal totalSpent = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MyCustomerProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getCustomerType().name(),
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                companyProfile == null ? null : companyProfile.getCompanyName(),
                companyProfile == null ? null : companyProfile.getTaxId(),
                customerProfile == null ? null : customerProfile.getAddress(),
                customerProfile == null ? null : customerProfile.getCity(),
                customerProfile == null ? null : customerProfile.getState(),
                customerProfile == null ? null : customerProfile.getZipCode(),
                customerProfile == null ? null : customerProfile.getCountry(),
                totalOrders,
                totalSpent
        );
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
