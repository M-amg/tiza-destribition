package com.tizadestribution.app.cart.repository;

import com.tizadestribution.app.cart.entity.Cart;
import com.tizadestribution.app.shared.model.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUser_IdAndStatus(UUID userId, CartStatus status);
}
