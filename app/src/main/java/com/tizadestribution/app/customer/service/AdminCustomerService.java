package com.tizadestribution.app.customer.service;

import com.tizadestribution.app.customer.dto.AdminCustomerDetailResponse;
import com.tizadestribution.app.customer.dto.AdminCustomerSummaryResponse;
import com.tizadestribution.app.customer.dto.UpdateCustomerTypeRequest;
import com.tizadestribution.app.customer.entity.CompanyProfile;
import com.tizadestribution.app.customer.entity.CustomerProfile;
import com.tizadestribution.app.customer.repository.CompanyProfileRepository;
import com.tizadestribution.app.customer.repository.CustomerProfileRepository;
import com.tizadestribution.app.order.entity.Order;
import com.tizadestribution.app.order.repository.OrderRepository;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminCustomerService {

    private final CustomerProfileRepository customerProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final OrderRepository orderRepository;

    public AdminCustomerService(
            CustomerProfileRepository customerProfileRepository,
            CompanyProfileRepository companyProfileRepository,
            OrderRepository orderRepository
    ) {
        this.customerProfileRepository = customerProfileRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminCustomerSummaryResponse> allCustomers() {
        List<CustomerProfile> profiles = customerProfileRepository.findAll();
        Map<UUID, CompanyProfile> companyByUserId = companyProfileRepository.findAll().stream()
                .collect(HashMap::new, (map, company) -> map.put(company.getUserId(), company), HashMap::putAll);

        Map<UUID, Long> totalOrdersByUser = new HashMap<>();
        Map<UUID, BigDecimal> totalSpentByUser = new HashMap<>();
        for (Order order : orderRepository.findAll()) {
            UUID userId = order.getUser().getId();
            totalOrdersByUser.merge(userId, 1L, Long::sum);
            totalSpentByUser.merge(
                    userId,
                    order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount(),
                    BigDecimal::add
            );
        }

        return profiles.stream()
                .map(profile -> toSummary(
                        profile,
                        companyByUserId.get(profile.getUserId()),
                        totalOrdersByUser.getOrDefault(profile.getUserId(), 0L),
                        totalSpentByUser.getOrDefault(profile.getUserId(), BigDecimal.ZERO)
                ))
                .sorted(Comparator.comparing(AdminCustomerSummaryResponse::createdAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminCustomerDetailResponse customerById(UUID customerId) {
        CustomerProfile profile = customerProfileRepository.findByUser_Id(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        CompanyProfile companyProfile = companyProfileRepository.findByUser_Id(customerId).orElse(null);

        List<Order> orders = orderRepository.findByUser_IdOrderByPlacedAtDesc(customerId);
        long totalOrders = orders.size();
        BigDecimal totalSpent = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return toDetail(profile, companyProfile, totalOrders, totalSpent);
    }

    @Transactional
    public AdminCustomerDetailResponse updateCustomerType(UUID customerId, UpdateCustomerTypeRequest request) {
        CustomerProfile profile = customerProfileRepository.findByUser_Id(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        profile.getUser().setCustomerType(request.customerType());

        CompanyProfile companyProfile = companyProfileRepository.findByUser_Id(customerId).orElse(null);
        List<Order> orders = orderRepository.findByUser_IdOrderByPlacedAtDesc(customerId);
        long totalOrders = orders.size();
        BigDecimal totalSpent = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return toDetail(profile, companyProfile, totalOrders, totalSpent);
    }

    private AdminCustomerSummaryResponse toSummary(
            CustomerProfile profile,
            CompanyProfile companyProfile,
            long totalOrders,
            BigDecimal totalSpent
    ) {
        AppUser user = profile.getUser();
        return new AdminCustomerSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getCustomerType().name(),
                user.getStatus().name(),
                user.getCreatedAt(),
                companyProfile == null ? null : companyProfile.getCompanyName(),
                profile.getAddress(),
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),
                profile.getCountry(),
                totalOrders,
                totalSpent
        );
    }

    private AdminCustomerDetailResponse toDetail(
            CustomerProfile profile,
            CompanyProfile companyProfile,
            long totalOrders,
            BigDecimal totalSpent
    ) {
        AppUser user = profile.getUser();
        return new AdminCustomerDetailResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getCustomerType().name(),
                user.getStatus().name(),
                user.getCreatedAt(),
                user.isEmailVerified(),
                user.getLastLoginAt(),
                companyProfile == null ? null : companyProfile.getCompanyName(),
                profile.getAddress(),
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),
                profile.getCountry(),
                totalOrders,
                totalSpent
        );
    }
}
