package com.tizadestribution.app.coupon.repository;

import com.tizadestribution.app.coupon.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    long countByCoupon_IdAndUser_Id(UUID couponId, UUID userId);

    List<CouponRedemption> findByCoupon_Id(UUID couponId);
}
