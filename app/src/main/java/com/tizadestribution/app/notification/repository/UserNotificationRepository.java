package com.tizadestribution.app.notification.repository;

import com.tizadestribution.app.notification.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserNotificationRepository extends JpaRepository<UserNotification, UUID> {

    List<UserNotification> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    long countByUser_IdAndReadAtIsNull(UUID userId);

    Optional<UserNotification> findByIdAndUser_Id(UUID id, UUID userId);
}
