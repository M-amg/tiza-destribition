package com.tizadestribution.app.coupon.repository;

import com.tizadestribution.app.coupon.entity.CouponCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CouponCategoryRepository extends JpaRepository<CouponCategory, UUID> {
    List<CouponCategory> findByCoupon_Id(UUID couponId);

    void deleteByCoupon_Id(UUID couponId);
}
