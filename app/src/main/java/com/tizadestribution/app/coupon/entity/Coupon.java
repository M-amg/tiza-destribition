package com.tizadestribution.app.coupon.entity;

import com.tizadestribution.app.common.entity.AuditableEntity;
import com.tizadestribution.app.shared.model.CouponApplicability;
import com.tizadestribution.app.shared.model.CouponSegment;
import com.tizadestribution.app.shared.model.CouponStatus;
import com.tizadestribution.app.shared.model.DiscountType;
import com.tizadestribution.app.user.entity.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "coupons")
public class Coupon extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 60)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(name = "max_discount_cap", precision = 12, scale = 2)
    private BigDecimal maxDiscountCap;

    @Enumerated(EnumType.STRING)
    @Column(name = "segment", nullable = false, length = 20)
    private CouponSegment segment = CouponSegment.ALL;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicability", nullable = false, length = 30)
    private CouponApplicability applicability = CouponApplicability.ENTIRE_STORE;

    @Column(name = "min_order_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "usage_limit_total")
    private Integer usageLimitTotal;

    @Column(name = "usage_limit_per_customer", nullable = false)
    private Integer usageLimitPerCustomer = 1;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at")
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CouponStatus status = CouponStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private AppUser createdByUser;

    public UUID getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getMaxDiscountCap() {
        return maxDiscountCap;
    }

    public void setMaxDiscountCap(BigDecimal maxDiscountCap) {
        this.maxDiscountCap = maxDiscountCap;
    }

    public CouponSegment getSegment() {
        return segment;
    }

    public void setSegment(CouponSegment segment) {
        this.segment = segment;
    }

    public CouponApplicability getApplicability() {
        return applicability;
    }

    public void setApplicability(CouponApplicability applicability) {
        this.applicability = applicability;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public Integer getUsageLimitTotal() {
        return usageLimitTotal;
    }

    public void setUsageLimitTotal(Integer usageLimitTotal) {
        this.usageLimitTotal = usageLimitTotal;
    }

    public Integer getUsageLimitPerCustomer() {
        return usageLimitPerCustomer;
    }

    public void setUsageLimitPerCustomer(Integer usageLimitPerCustomer) {
        this.usageLimitPerCustomer = usageLimitPerCustomer;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public void setStartAt(Instant startAt) {
        this.startAt = startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public void setEndAt(Instant endAt) {
        this.endAt = endAt;
    }

    public CouponStatus getStatus() {
        return status;
    }

    public void setStatus(CouponStatus status) {
        this.status = status;
    }

    public AppUser getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(AppUser createdByUser) {
        this.createdByUser = createdByUser;
    }
}
