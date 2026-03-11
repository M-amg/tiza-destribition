package com.tizadestribution.app.coupon.service;

import com.tizadestribution.app.catalog.repository.CategoryRepository;
import com.tizadestribution.app.catalog.repository.ProductRepository;
import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.coupon.dto.CouponResponse;
import com.tizadestribution.app.coupon.dto.CouponUpsertRequest;
import com.tizadestribution.app.coupon.entity.Coupon;
import com.tizadestribution.app.coupon.entity.CouponCategory;
import com.tizadestribution.app.coupon.entity.CouponProduct;
import com.tizadestribution.app.coupon.repository.CouponCategoryRepository;
import com.tizadestribution.app.coupon.repository.CouponProductRepository;
import com.tizadestribution.app.coupon.repository.CouponRepository;
import com.tizadestribution.app.shared.model.CouponApplicability;
import com.tizadestribution.app.shared.model.CouponStatus;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponCategoryRepository couponCategoryRepository;
    private final CouponProductRepository couponProductRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    public CouponService(
            CouponRepository couponRepository,
            CouponCategoryRepository couponCategoryRepository,
            CouponProductRepository couponProductRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            CurrentUserService currentUserService
    ) {
        this.couponRepository = couponRepository;
        this.couponCategoryRepository = couponCategoryRepository;
        this.couponProductRepository = couponProductRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> activeCoupons() {
        return couponRepository.findByStatusOrderByCreatedAtDesc(CouponStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> allCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CouponResponse couponById(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found"));
        return toResponse(coupon);
    }

    @Transactional
    public CouponResponse createCoupon(Authentication authentication, CouponUpsertRequest request) {
        AppUser actor = currentUserService.getRequiredUser(authentication);
        Coupon coupon = new Coupon();
        apply(coupon, request, actor);
        Coupon saved = couponRepository.save(coupon);
        syncRelations(saved, request);
        return toResponse(saved);
    }

    @Transactional
    public CouponResponse updateCoupon(Authentication authentication, UUID id, CouponUpsertRequest request) {
        AppUser actor = currentUserService.getRequiredUser(authentication);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found"));

        apply(coupon, request, actor);
        Coupon saved = couponRepository.save(coupon);
        syncRelations(saved, request);
        return toResponse(saved);
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found"));

        couponCategoryRepository.deleteByCoupon_Id(coupon.getId());
        couponProductRepository.deleteByCoupon_Id(coupon.getId());
        couponRepository.delete(coupon);
    }

    private void apply(Coupon coupon, CouponUpsertRequest request, AppUser actor) {
        coupon.setCode(request.code().trim().toUpperCase());
        coupon.setName(request.name());
        coupon.setDescription(request.description());
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMaxDiscountCap(request.maxDiscountCap());
        coupon.setSegment(request.segment());
        coupon.setApplicability(request.applicability());
        coupon.setMinOrderAmount(request.minOrderAmount());
        coupon.setUsageLimitTotal(request.usageLimitTotal());
        coupon.setUsageLimitPerCustomer(request.usageLimitPerCustomer());
        coupon.setStartAt(request.startAt());
        coupon.setEndAt(request.endAt());
        coupon.setStatus(request.status());
        if (coupon.getCreatedByUser() == null) {
            coupon.setCreatedByUser(actor);
        }
    }

    private void syncRelations(Coupon coupon, CouponUpsertRequest request) {
        couponCategoryRepository.deleteByCoupon_Id(coupon.getId());
        couponProductRepository.deleteByCoupon_Id(coupon.getId());

        if (coupon.getApplicability() == CouponApplicability.CATEGORIES && request.categoryIds() != null) {
            for (UUID categoryId : request.categoryIds()) {
                CouponCategory cc = new CouponCategory();
                cc.setCoupon(coupon);
                cc.setCategory(categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found: " + categoryId)));
                couponCategoryRepository.save(cc);
            }
        }

        if (coupon.getApplicability() == CouponApplicability.PRODUCTS && request.productIds() != null) {
            for (UUID productId : request.productIds()) {
                CouponProduct cp = new CouponProduct();
                cp.setCoupon(coupon);
                cp.setProduct(productRepository.findById(productId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found: " + productId)));
                couponProductRepository.save(cp);
            }
        }
    }

    private CouponResponse toResponse(Coupon coupon) {
        List<UUID> categoryIds = couponCategoryRepository.findByCoupon_Id(coupon.getId()).stream()
                .map((item) -> item.getCategory().getId())
                .toList();

        List<UUID> productIds = couponProductRepository.findByCoupon_Id(coupon.getId()).stream()
                .map((item) -> item.getProduct().getId())
                .toList();

        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getName(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMaxDiscountCap(),
                coupon.getSegment(),
                coupon.getApplicability(),
                coupon.getMinOrderAmount(),
                coupon.getUsageLimitTotal(),
                coupon.getUsageLimitPerCustomer(),
                coupon.getUsedCount(),
                coupon.getStartAt(),
                coupon.getEndAt(),
                coupon.getStatus(),
                categoryIds,
                productIds
        );
    }
}
