package com.tizadestribution.app.notification.controller;

import com.tizadestribution.app.notification.dto.NotificationResponse;
import com.tizadestribution.app.notification.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> myNotifications(Authentication authentication) {
        return notificationService.myNotifications(authentication);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication authentication) {
        return Map.of("count", notificationService.unreadCount(authentication));
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markAsRead(Authentication authentication, @PathVariable UUID id) {
        return notificationService.markAsRead(authentication, id);
    }

    @PostMapping("/read-all")
    public void markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication);
    }
}
