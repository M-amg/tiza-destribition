package com.tizadestribution.app.order.controller;

import com.tizadestribution.app.order.dto.OrderResponse;
import com.tizadestribution.app.order.dto.UpdateOrderStatusRequest;
import com.tizadestribution.app.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> allOrders() {
        return orderService.allOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse byId(@PathVariable UUID id) {
        return orderService.orderById(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateStatus(authentication, id, request);
    }
}
