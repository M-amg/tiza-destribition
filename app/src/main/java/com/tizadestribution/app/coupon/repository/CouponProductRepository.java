package com.tizadestribution.app.coupon.repository;

import com.tizadestribution.app.coupon.entity.CouponProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CouponProductRepository extends JpaRepository<CouponProduct, UUID> {
    List<CouponProduct> findByCoupon_Id(UUID couponId);

    void deleteByCoupon_Id(UUID couponId);
}
