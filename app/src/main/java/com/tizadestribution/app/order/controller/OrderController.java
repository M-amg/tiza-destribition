package com.tizadestribution.app.order.controller;

import com.tizadestribution.app.order.dto.OrderResponse;
import com.tizadestribution.app.order.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> myOrders(Authentication authentication) {
        return orderService.myOrders(authentication);
    }

    @GetMapping("/{id}")
    public OrderResponse myOrderById(Authentication authentication, @PathVariable UUID id) {
        return orderService.myOrderById(authentication, id);
    }

    @GetMapping("/track/{orderNumber}")
    public OrderResponse trackByOrderNumber(Authentication authentication, @PathVariable String orderNumber) {
        return orderService.trackByOrderNumber(authentication, orderNumber);
    }
}
