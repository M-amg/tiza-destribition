package com.tizadestribution.app.notification.service;

import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.notification.dto.NotificationResponse;
import com.tizadestribution.app.notification.entity.UserNotification;
import com.tizadestribution.app.notification.repository.UserNotificationRepository;
import com.tizadestribution.app.order.entity.Order;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    public static final String ORDER_PLACED = "ORDER_PLACED";
    public static final String ORDER_STATUS_UPDATED = "ORDER_STATUS_UPDATED";

    private final UserNotificationRepository userNotificationRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(
            UserNotificationRepository userNotificationRepository,
            CurrentUserService currentUserService
    ) {
        this.userNotificationRepository = userNotificationRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> myNotifications(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        return userNotificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        return userNotificationRepository.countByUser_IdAndReadAtIsNull(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Authentication authentication, UUID notificationId) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        UserNotification notification = userNotificationRepository.findByIdAndUser_Id(notificationId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(Instant.now());
        }

        return toResponse(userNotificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Instant now = Instant.now();
        List<UserNotification> notifications = userNotificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        for (UserNotification notification : notifications) {
            if (notification.getReadAt() == null) {
                notification.setReadAt(now);
            }
        }
        userNotificationRepository.saveAll(notifications);
    }

    @Transactional
    public void createOrderPlacedNotification(AppUser user, Order order) {
        createNotification(user, ORDER_PLACED, order);
    }

    @Transactional
    public void createOrderStatusNotification(Order order) {
        if (order.getUser() == null) {
            return;
        }

        createNotification(order.getUser(), ORDER_STATUS_UPDATED, order);
    }

    private void createNotification(AppUser user, String type, Order order) {
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setType(type);
        notification.setOrder(order);
        notification.setOrderNumber(order.getOrderNumber());
        notification.setOrderStatus(order.getStatus().name());
        userNotificationRepository.save(notification);
    }

    private NotificationResponse toResponse(UserNotification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getOrder() == null ? null : notification.getOrder().getId(),
                notification.getOrderNumber(),
                notification.getOrderStatus(),
                notification.getReadAt() != null,
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
