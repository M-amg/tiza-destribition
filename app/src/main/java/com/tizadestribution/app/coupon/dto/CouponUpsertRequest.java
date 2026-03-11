package com.tizadestribution.app.coupon.dto;

import com.tizadestribution.app.shared.model.CouponApplicability;
import com.tizadestribution.app.shared.model.CouponSegment;
import com.tizadestribution.app.shared.model.CouponStatus;
import com.tizadestribution.app.shared.model.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CouponUpsertRequest(
        @NotBlank @Size(max = 60) String code,
        @NotBlank @Size(max = 160) String name,
        @Size(max = 500) String description,
        @NotNull DiscountType discountType,
        @NotNull @DecimalMin("0.00") BigDecimal discountValue,
        @DecimalMin("0.00") BigDecimal maxDiscountCap,
        @NotNull CouponSegment segment,
        @NotNull CouponApplicability applicability,
        @NotNull @DecimalMin("0.00") BigDecimal minOrderAmount,
        @PositiveOrZero Integer usageLimitTotal,
        @NotNull @PositiveOrZero Integer usageLimitPerCustomer,
        @NotNull Instant startAt,
        Instant endAt,
        @NotNull CouponStatus status,
        List<UUID> categoryIds,
        List<UUID> productIds
) {
}
