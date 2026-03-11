package com.tizadestribution.app.coupon.controller;

import com.tizadestribution.app.coupon.dto.CouponResponse;
import com.tizadestribution.app.coupon.dto.CouponUpsertRequest;
import com.tizadestribution.app.coupon.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/coupons/active")
    public List<CouponResponse> activeCoupons() {
        return couponService.activeCoupons();
    }

    @GetMapping("/admin/coupons")
    public List<CouponResponse> allCoupons() {
        return couponService.allCoupons();
    }

    @GetMapping("/admin/coupons/{id}")
    public CouponResponse couponById(@PathVariable UUID id) {
        return couponService.couponById(id);
    }

    @PostMapping("/admin/coupons")
    public CouponResponse createCoupon(Authentication authentication, @Valid @RequestBody CouponUpsertRequest request) {
        return couponService.createCoupon(authentication, request);
    }

    @PutMapping("/admin/coupons/{id}")
    public CouponResponse updateCoupon(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CouponUpsertRequest request
    ) {
        return couponService.updateCoupon(authentication, id, request);
    }

    @DeleteMapping("/admin/coupons/{id}")
    public void deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
    }
}
