package com.tizadestribution.app.coupon.repository;

import com.tizadestribution.app.coupon.entity.Coupon;
import com.tizadestribution.app.shared.model.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCodeIgnoreCase(String code);

    List<Coupon> findByStatusOrderByCreatedAtDesc(CouponStatus status);

    List<Coupon> findAllByOrderByCreatedAtDesc();
}
