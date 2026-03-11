package com.tizadestribution.app.cart.controller;

import com.tizadestribution.app.cart.dto.AddCartItemRequest;
import com.tizadestribution.app.cart.dto.ApplyCouponRequest;
import com.tizadestribution.app.cart.dto.CartResponse;
import com.tizadestribution.app.cart.dto.CheckoutRequest;
import com.tizadestribution.app.cart.dto.CheckoutResponse;
import com.tizadestribution.app.cart.dto.GuestCheckoutRequest;
import com.tizadestribution.app.cart.dto.UpdateCartItemRequest;
import com.tizadestribution.app.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse myCart(Authentication authentication) {
        return cartService.getMyCart(authentication);
    }

    @PostMapping("/items")
    public CartResponse addItem(Authentication authentication, @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(authentication, request);
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(
            Authentication authentication,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateItem(authentication, itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(Authentication authentication, @PathVariable UUID itemId) {
        return cartService.removeItem(authentication, itemId);
    }

    @PostMapping("/coupon")
    public CartResponse applyCoupon(Authentication authentication, @Valid @RequestBody ApplyCouponRequest request) {
        return cartService.applyCoupon(authentication, request);
    }

    @DeleteMapping("/coupon")
    public CartResponse removeCoupon(Authentication authentication) {
        return cartService.removeCoupon(authentication);
    }

    @DeleteMapping
    public CartResponse clear(Authentication authentication) {
        return cartService.clearCart(authentication);
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(Authentication authentication, @Valid @RequestBody CheckoutRequest request) {
        return cartService.checkout(authentication, request);
    }

    @PostMapping("/guest-checkout")
    public CheckoutResponse guestCheckout(@Valid @RequestBody GuestCheckoutRequest request) {
        return cartService.guestCheckout(request);
    }
}
