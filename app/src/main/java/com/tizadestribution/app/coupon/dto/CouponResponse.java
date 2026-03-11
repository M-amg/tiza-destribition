package com.tizadestribution.app.coupon.dto;

import com.tizadestribution.app.shared.model.CouponApplicability;
import com.tizadestribution.app.shared.model.CouponSegment;
import com.tizadestribution.app.shared.model.CouponStatus;
import com.tizadestribution.app.shared.model.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CouponResponse(
        UUID id,
        String code,
        String name,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal maxDiscountCap,
        CouponSegment segment,
        CouponApplicability applicability,
        BigDecimal minOrderAmount,
        Integer usageLimitTotal,
        Integer usageLimitPerCustomer,
        Integer usedCount,
        Instant startAt,
        Instant endAt,
        CouponStatus status,
        List<UUID> categoryIds,
        List<UUID> productIds
) {
}
