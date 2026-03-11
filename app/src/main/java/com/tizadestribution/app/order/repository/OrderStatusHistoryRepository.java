package com.tizadestribution.app.order.repository;

import com.tizadestribution.app.order.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, UUID> {
    List<OrderStatusHistory> findByOrder_IdOrderByChangedAtAsc(UUID orderId);
}
