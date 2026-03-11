package com.tizadestribution.app.order.repository;

import com.tizadestribution.app.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUser_IdOrderByPlacedAtDesc(UUID userId);

    Optional<Order> findByIdAndUser_Id(UUID id, UUID userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByOrderNumberIgnoreCase(String orderNumber);
}
