package com.tizadestribution.app.order.service;

import com.tizadestribution.app.catalog.entity.ProductImage;
import com.tizadestribution.app.catalog.repository.ProductImageRepository;
import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.notification.service.NotificationService;
import com.tizadestribution.app.order.dto.OrderItemResponse;
import com.tizadestribution.app.order.dto.OrderResponse;
import com.tizadestribution.app.order.dto.UpdateOrderStatusRequest;
import com.tizadestribution.app.order.entity.Order;
import com.tizadestribution.app.order.entity.OrderItem;
import com.tizadestribution.app.order.entity.OrderStatusHistory;
import com.tizadestribution.app.order.repository.OrderItemRepository;
import com.tizadestribution.app.order.repository.OrderRepository;
import com.tizadestribution.app.order.repository.OrderStatusHistoryRepository;
import com.tizadestribution.app.shared.model.OrderStatus;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ProductImageRepository productImageRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            ProductImageRepository productImageRepository,
            CurrentUserService currentUserService,
            NotificationService notificationService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.productImageRepository = productImageRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        return orderRepository.findByUser_IdOrderByPlacedAtDesc(user.getId())
                .stream()
                .map(order -> toResponse(order, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse myOrderById(Authentication authentication, UUID orderId) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Order order = orderRepository.findByIdAndUser_Id(orderId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order, true);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        return orderRepository.findAll().stream().map(order -> toResponse(order, true)).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse orderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order, true);
    }

    @Transactional(readOnly = true)
    public OrderResponse trackByOrderNumber(Authentication authentication, String orderNumber) {
        String normalizedOrderNumber = normalizeOrderNumber(orderNumber);
        Order order = orderRepository.findByOrderNumberIgnoreCase(normalizedOrderNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        boolean privateDetailsVisible = currentUserService.findCurrentUser(authentication)
                .map(user -> user.getId().equals(order.getUser().getId()))
                .orElse(false);
        return toResponse(order, privateDetailsVisible);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> ordersByCustomerId(UUID customerId) {
        return orderRepository.findByUser_IdOrderByPlacedAtDesc(customerId).stream()
                .map(order -> toResponse(order, true))
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Authentication authentication, UUID orderId, UpdateOrderStatusRequest request) {
        AppUser actor = currentUserService.getRequiredUser(authentication);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        order.setStatus(request.status());
        if (request.paymentStatus() != null) {
            order.setPaymentStatus(request.paymentStatus());
        }

        Instant now = Instant.now();
        if (request.status() == OrderStatus.PROCESSING && order.getConfirmedAt() == null) {
            order.setConfirmedAt(now);
        }
        if (request.status() == OrderStatus.SHIPPED && order.getShippedAt() == null) {
            order.setShippedAt(now);
        }
        if (request.status() == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(now);
        }
        if (request.status() == OrderStatus.CANCELLED && order.getCancelledAt() == null) {
            order.setCancelledAt(now);
        }

        Order saved = orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(saved);
        history.setStatus(request.status());
        history.setChangedByUser(actor);
        history.setNote(request.note());
        history.setChangedAt(now);
        orderStatusHistoryRepository.save(history);
        notificationService.createOrderStatusNotification(saved);

        return toResponse(saved, true);
    }

    private OrderResponse toResponse(Order order, boolean privateDetailsVisible) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder_Id(order.getId());
        Map<UUID, String> imageUrlsByProductId = resolveImageUrls(orderItems);

        List<OrderItemResponse> items = privateDetailsVisible
                ? orderItems.stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductNameSnapshot(),
                        imageUrlsByProductId.get(item.getProduct().getId()),
                        item.getProductSkuSnapshot(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()
                ))
                .toList()
                : List.of();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().name(),
                privateDetailsVisible,
                privateDetailsVisible ? order.getCustomerType().name() : null,
                privateDetailsVisible ? order.getPaymentMethod().name() : null,
                privateDetailsVisible ? order.getPaymentStatus().name() : null,
                privateDetailsVisible ? order.getCouponCodeSnapshot() : null,
                privateDetailsVisible ? order.getCouponDiscount() : null,
                order.getSubtotal(),
                order.getShippingAmount(),
                order.getTaxAmount(),
                order.getTotalAmount(),
                order.getPlacedAt(),
                privateDetailsVisible ? order.getShippingRecipientName() : null,
                privateDetailsVisible ? order.getShippingPhone() : null,
                privateDetailsVisible ? order.getShippingEmail() : null,
                privateDetailsVisible ? order.getShippingAddressLine1() : null,
                privateDetailsVisible ? order.getShippingAddressLine2() : null,
                privateDetailsVisible ? order.getShippingCity() : null,
                privateDetailsVisible ? order.getShippingState() : null,
                privateDetailsVisible ? order.getShippingZipCode() : null,
                privateDetailsVisible ? order.getShippingCountry() : null,
                items
        );
    }

    private Map<UUID, String> resolveImageUrls(List<OrderItem> orderItems) {
        List<UUID> productIds = orderItems.stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .toList();

        if (productIds.isEmpty()) {
            return Map.of();
        }

        return productImageRepository.findByProduct_IdInOrderByProduct_IdAscSortOrderAsc(productIds).stream()
                .collect(Collectors.groupingBy(
                        image -> image.getProduct().getId(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                this::pickPrimaryImageUrl
                        )
                ));
    }

    private String pickPrimaryImageUrl(List<ProductImage> images) {
        return images.stream()
                .sorted(Comparator.comparing(ProductImage::isMain).reversed())
                .map(ProductImage::getImageUrl)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String normalizeOrderNumber(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order number is required");
        }

        return value.trim().replaceFirst("^#", "").toUpperCase();
    }
}
