package com.tizadestribution.app.customer.controller;

import com.tizadestribution.app.customer.dto.AdminCustomerDetailResponse;
import com.tizadestribution.app.customer.dto.AdminCustomerSummaryResponse;
import com.tizadestribution.app.customer.dto.UpdateCustomerTypeRequest;
import com.tizadestribution.app.customer.service.AdminCustomerService;
import com.tizadestribution.app.order.dto.OrderResponse;
import com.tizadestribution.app.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/customers")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;
    private final OrderService orderService;

    public AdminCustomerController(AdminCustomerService adminCustomerService, OrderService orderService) {
        this.adminCustomerService = adminCustomerService;
        this.orderService = orderService;
    }

    @GetMapping
    public List<AdminCustomerSummaryResponse> allCustomers() {
        return adminCustomerService.allCustomers();
    }

    @GetMapping("/{id}")
    public AdminCustomerDetailResponse customerById(@PathVariable UUID id) {
        return adminCustomerService.customerById(id);
    }

    @GetMapping("/{id}/orders")
    public List<OrderResponse> ordersByCustomer(@PathVariable UUID id) {
        return orderService.ordersByCustomerId(id);
    }

    @PatchMapping("/{id}/customer-type")
    public AdminCustomerDetailResponse updateCustomerType(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerTypeRequest request
    ) {
        return adminCustomerService.updateCustomerType(id, request);
    }
}
