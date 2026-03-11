package com.tizadestribution.app.cart.service;

import com.tizadestribution.app.cart.dto.AddCartItemRequest;
import com.tizadestribution.app.cart.dto.ApplyCouponRequest;
import com.tizadestribution.app.cart.dto.CartItemResponse;
import com.tizadestribution.app.cart.dto.CartResponse;
import com.tizadestribution.app.cart.dto.CheckoutRequest;
import com.tizadestribution.app.cart.dto.CheckoutResponse;
import com.tizadestribution.app.cart.dto.GuestCheckoutItemRequest;
import com.tizadestribution.app.cart.dto.GuestCheckoutRequest;
import com.tizadestribution.app.cart.dto.UpdateCartItemRequest;
import com.tizadestribution.app.cart.entity.Cart;
import com.tizadestribution.app.cart.entity.CartItem;
import com.tizadestribution.app.cart.repository.CartItemRepository;
import com.tizadestribution.app.cart.repository.CartRepository;
import com.tizadestribution.app.catalog.entity.Product;
import com.tizadestribution.app.catalog.repository.ProductImageRepository;
import com.tizadestribution.app.catalog.repository.ProductRepository;
import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.coupon.entity.Coupon;
import com.tizadestribution.app.coupon.entity.CouponCategory;
import com.tizadestribution.app.coupon.entity.CouponProduct;
import com.tizadestribution.app.coupon.entity.CouponRedemption;
import com.tizadestribution.app.coupon.repository.CouponCategoryRepository;
import com.tizadestribution.app.coupon.repository.CouponProductRepository;
import com.tizadestribution.app.coupon.repository.CouponRedemptionRepository;
import com.tizadestribution.app.coupon.repository.CouponRepository;
import com.tizadestribution.app.customer.entity.CustomerProfile;
import com.tizadestribution.app.customer.repository.CustomerProfileRepository;
import com.tizadestribution.app.invoice.entity.Invoice;
import com.tizadestribution.app.invoice.repository.InvoiceRepository;
import com.tizadestribution.app.inventory.entity.StockMovement;
import com.tizadestribution.app.inventory.repository.StockMovementRepository;
import com.tizadestribution.app.notification.service.NotificationService;
import com.tizadestribution.app.order.entity.Order;
import com.tizadestribution.app.order.entity.OrderItem;
import com.tizadestribution.app.order.entity.OrderStatusHistory;
import com.tizadestribution.app.order.repository.OrderItemRepository;
import com.tizadestribution.app.order.repository.OrderRepository;
import com.tizadestribution.app.order.repository.OrderStatusHistoryRepository;
import com.tizadestribution.app.setting.entity.StoreSetting;
import com.tizadestribution.app.setting.repository.StoreSettingRepository;
import com.tizadestribution.app.shared.model.CartStatus;
import com.tizadestribution.app.shared.model.CouponApplicability;
import com.tizadestribution.app.shared.model.CouponSegment;
import com.tizadestribution.app.shared.model.CouponStatus;
import com.tizadestribution.app.shared.model.DiscountType;
import com.tizadestribution.app.shared.model.InvoiceStatus;
import com.tizadestribution.app.shared.model.OrderStatus;
import com.tizadestribution.app.shared.model.PaymentMethodType;
import com.tizadestribution.app.shared.model.PaymentStatus;
import com.tizadestribution.app.shared.model.ProductStatus;
import com.tizadestribution.app.shared.model.StockChangeType;
import com.tizadestribution.app.user.entity.AppUser;
import com.tizadestribution.app.user.model.CustomerType;
import com.tizadestribution.app.user.model.RoleName;
import com.tizadestribution.app.user.model.UserStatus;
import com.tizadestribution.app.user.repository.AppUserRepository;
import com.tizadestribution.app.user.repository.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CartService {

    private static final String FREE_SHIPPING_THRESHOLD_KEY = "delivery.free_shipping_threshold";
    private static final String STANDARD_DELIVERY_PRICE_KEY = "delivery.standard_price";
    private static final String TAX_RATE_KEY = "tax.rate";
    private static final String ENABLED_PAYMENT_METHODS_KEY = "checkout.enabled_payment_methods";

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CouponRepository couponRepository;
    private final CouponCategoryRepository couponCategoryRepository;
    private final CouponProductRepository couponProductRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final InvoiceRepository invoiceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StoreSettingRepository storeSettingRepository;
    private final CurrentUserService currentUserService;
    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            CouponRepository couponRepository,
            CouponCategoryRepository couponCategoryRepository,
            CouponProductRepository couponProductRepository,
            CouponRedemptionRepository couponRedemptionRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            InvoiceRepository invoiceRepository,
            StockMovementRepository stockMovementRepository,
            StoreSettingRepository storeSettingRepository,
            CurrentUserService currentUserService,
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            CustomerProfileRepository customerProfileRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.couponRepository = couponRepository;
        this.couponCategoryRepository = couponCategoryRepository;
        this.couponProductRepository = couponProductRepository;
        this.couponRedemptionRepository = couponRedemptionRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.invoiceRepository = invoiceRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.storeSettingRepository = storeSettingRepository;
        this.currentUserService = currentUserService;
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Cart cart = getOrCreateActiveCart(user);
        return toResponse(cart, cartItemRepository.findByCart_Id(cart.getId()));
    }

    @Transactional
    public CartResponse addItem(Authentication authentication, AddCartItemRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Cart cart = getOrCreateActiveCart(user);

        Product product = productRepository.findById(request.productId())
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.isInStock() || product.getStockQuantity() < request.quantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }

        CartItem item = cartItemRepository.findByCart_IdAndProduct_Id(cart.getId(), product.getId())
                .orElseGet(() -> {
                    CartItem i = new CartItem();
                    i.setCart(cart);
                    i.setProduct(product);
                    return i;
                });

        int newQuantity = (item.getId() == null ? 0 : item.getQuantity()) + request.quantity();
        if (newQuantity > product.getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }

        BigDecimal unitPrice = resolveUnitPrice(user, product, newQuantity);
        item.setQuantity(newQuantity);
        item.setUnitPrice(unitPrice);
        item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(newQuantity)).setScale(2, RoundingMode.HALF_UP));
        cartItemRepository.save(item);

        recalculateCart(cart, user);
        return toResponse(cart, cartItemRepository.findByCart_Id(cart.getId()));
    }

    @Transactional
    public CartResponse updateItem(Authentication authentication, UUID itemId, UpdateCartItemRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        Cart cart = item.getCart();
        if (!cart.getUser().getId().equals(user.getId()) || cart.getStatus() != CartStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
        }

        if (request.quantity() > item.getProduct().getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock");
        }

        BigDecimal unitPrice = resolveUnitPrice(user, item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        item.setUnitPrice(unitPrice);
        item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(request.quantity())).setScale(2, RoundingMode.HALF_UP));
        cartItemRepository.save(item);

        recalculateCart(cart, user);
        return toResponse(cart, cartItemRepository.findByCart_Id(cart.getId()));
    }

    @Transactional
    public CartResponse removeItem(Authentication authentication, UUID itemId) {
        AppUser user = currentUserService.getRequiredUser(authentication);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        Cart cart = item.getCart();
        if (!cart.getUser().getId().equals(user.getId()) || cart.getStatus() != CartStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
        }

        cartItemRepository.delete(item);
        recalculateCart(cart, user);
        return toResponse(cart, cartItemRepository.findByCart_Id(cart.getId()));
    }

    @Transactional
    public CartResponse applyCoupon(Authentication authentication, ApplyCouponRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Cart cart = getOrCreateActiveCart(user);
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.code().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coupon"));

        validateCoupon(coupon, user, items, sumSubtotal(items));

        cart.setCoupon(coupon);
        recalculateCart(cart, user);
        return toResponse(cart, cartItemRepository.findByCart_Id(cart.getId()));
    }

    @Transactional
    public CartResponse removeCoupon(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Cart cart = getOrCreateActiveCart(user);
        cart.setCoupon(null);
        recalculateCart(cart, user);
        return toResponse(cart, cartItemRepository.findByCart_Id(cart.getId()));
    }

    @Transactional
    public CartResponse clearCart(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Cart cart = getOrCreateActiveCart(user);
        cartItemRepository.deleteByCart_Id(cart.getId());
        cart.setCoupon(null);
        recalculateCart(cart, user);
        return toResponse(cart, List.of());
    }

    @Transactional
    public CheckoutResponse checkout(Authentication authentication, CheckoutRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Cart cart = getOrCreateActiveCart(user);
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());

        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        recalculateCart(cart, user);
        Coupon coupon = cart.getCoupon();
        if (coupon != null) {
            validateCoupon(coupon, user, items, cart.getSubtotal());
        }
        validatePaymentMethodEnabled(request.paymentMethod());

        List<CheckoutLine> lines = items.stream()
                .map(item -> new CheckoutLine(item.getProduct(), item.getQuantity(), item.getUnitPrice(), item.getLineTotal()))
                .toList();
        CheckoutAmounts amounts = new CheckoutAmounts(
                cart.getSubtotal(),
                cart.getDiscountAmount(),
                cart.getShippingAmount(),
                cart.getTaxAmount(),
                cart.getTotalAmount()
        );
        CheckoutResponse response = placeOrder(
                user,
                toCheckoutInput(
                        request.recipientName() == null || request.recipientName().isBlank() ? user.getFullName() : request.recipientName(),
                        request.phone() == null || request.phone().isBlank() ? user.getPhone() : request.phone(),
                        request.email() == null || request.email().isBlank() ? user.getEmail() : request.email(),
                        request.addressLine1(),
                        request.addressLine2(),
                        request.city(),
                        request.state(),
                        request.zipCode(),
                        request.country(),
                        request.paymentMethod(),
                        request.notes()
                ),
                lines,
                coupon,
                amounts,
                false,
                null,
                null,
                null
        );

        if (coupon != null) {
            CouponRedemption redemption = new CouponRedemption();
            redemption.setCoupon(coupon);
            redemption.setUser(user);
            redemption.setOrder(orderRepository.findById(response.orderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found")));
            redemption.setDiscountAmount(amounts.discount());
            couponRedemptionRepository.save(redemption);

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        cart.setStatus(CartStatus.CHECKED_OUT);
        cartRepository.save(cart);

        return response;
    }

    @Transactional
    public CheckoutResponse guestCheckout(GuestCheckoutRequest request) {
        validatePaymentMethodEnabled(request.paymentMethod());
        GuestCheckoutCustomer guestCustomer = resolveGuestCustomer(request);
        AppUser guestUser = guestCustomer.user();
        List<CheckoutLine> lines = buildGuestCheckoutLines(guestUser, request.items());
        CheckoutAmounts amounts = calculateAmounts(sumLineTotals(lines), BigDecimal.ZERO);

        return placeOrder(
                guestUser,
                toCheckoutInput(
                        request.recipientName(),
                        request.phone(),
                        request.email(),
                        request.addressLine1(),
                        request.addressLine2(),
                        request.city(),
                        request.state(),
                        request.zipCode(),
                        request.country(),
                        request.paymentMethod(),
                        request.notes()
                ),
                lines,
                null,
                amounts,
                guestCustomer.canCreateAccount(),
                guestCustomer.registrationEmail(),
                guestCustomer.registrationFullName(),
                guestCustomer.registrationPhone()
        );
    }

    private Cart getOrCreateActiveCart(AppUser user) {
        return cartRepository.findByUser_IdAndStatus(user.getId(), CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setStatus(CartStatus.ACTIVE);
                    cart.setSubtotal(BigDecimal.ZERO);
                    cart.setDiscountAmount(BigDecimal.ZERO);
                    cart.setShippingAmount(BigDecimal.ZERO);
                    cart.setTaxAmount(BigDecimal.ZERO);
                    cart.setTotalAmount(BigDecimal.ZERO);
                    return cartRepository.save(cart);
                });
    }

    private BigDecimal resolveUnitPrice(AppUser user, Product product, int quantity) {
        if (user.getCustomerType() == CustomerType.B2B) {
            if (product.getMinB2BQuantity() != null && quantity < product.getMinB2BQuantity()) {
                return product.getB2cPrice();
            }
            return product.getB2bPrice();
        }
        return product.getB2cPrice();
    }

    private void validateCoupon(Coupon coupon, AppUser user, List<CartItem> items, BigDecimal subtotal) {
        Instant now = Instant.now();
        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon is not active");
        }
        if (coupon.getStartAt().isAfter(now) || (coupon.getEndAt() != null && coupon.getEndAt().isBefore(now))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon is outside valid date range");
        }
        if (coupon.getSegment() == CouponSegment.B2B && user.getCustomerType() != CustomerType.B2B) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon is not valid for this customer type");
        }
        if (coupon.getSegment() == CouponSegment.B2C && user.getCustomerType() != CustomerType.B2C) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon is not valid for this customer type");
        }
        if (coupon.getUsageLimitTotal() != null && coupon.getUsedCount() >= coupon.getUsageLimitTotal()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon usage limit reached");
        }

        long usedByCustomer = couponRedemptionRepository.countByCoupon_IdAndUser_Id(coupon.getId(), user.getId());
        if (usedByCustomer >= coupon.getUsageLimitPerCustomer()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon per customer limit reached");
        }

        if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order amount too low for coupon");
        }

        if (coupon.getApplicability() == CouponApplicability.CATEGORIES) {
            Set<UUID> allowedCategories = couponCategoryRepository.findByCoupon_Id(coupon.getId()).stream()
                    .map(CouponCategory::getCategory)
                    .map(c -> c.getId())
                    .collect(java.util.stream.Collectors.toSet());
            boolean anyMatch = items.stream().map(CartItem::getProduct).anyMatch(p -> allowedCategories.contains(p.getCategory().getId()));
            if (!anyMatch) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon does not apply to cart categories");
            }
        }

        if (coupon.getApplicability() == CouponApplicability.PRODUCTS) {
            Set<UUID> allowedProducts = couponProductRepository.findByCoupon_Id(coupon.getId()).stream()
                    .map(CouponProduct::getProduct)
                    .map(Product::getId)
                    .collect(java.util.stream.Collectors.toSet());
            boolean anyMatch = items.stream().map(CartItem::getProduct).anyMatch(p -> allowedProducts.contains(p.getId()));
            if (!anyMatch) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon does not apply to cart products");
            }
        }
    }

    private void recalculateCart(Cart cart, AppUser user) {
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        BigDecimal subtotal = sumSubtotal(items);

        BigDecimal discount = BigDecimal.ZERO;
        Coupon coupon = cart.getCoupon();
        if (coupon != null) {
            try {
                validateCoupon(coupon, user, items, subtotal);
                discount = calculateDiscount(coupon, subtotal);
            } catch (ResponseStatusException ex) {
                cart.setCoupon(null);
                discount = BigDecimal.ZERO;
            }
        }

        CheckoutAmounts amounts = calculateAmounts(subtotal, discount);

        cart.setSubtotal(subtotal);
        cart.setDiscountAmount(amounts.discount());
        cart.setShippingAmount(amounts.shipping());
        cart.setTaxAmount(amounts.tax());
        cart.setTotalAmount(amounts.total());
        cartRepository.save(cart);
    }

    private CheckoutResponse placeOrder(
            AppUser user,
            CheckoutInput input,
            List<CheckoutLine> lines,
            Coupon coupon,
            CheckoutAmounts amounts,
            boolean canCreateAccount,
            String registrationEmail,
            String registrationFullName,
            String registrationPhone
    ) {
        Instant now = Instant.now();
        Order order = new Order();
        order.setOrderNumber("ORD-" + now.toEpochMilli());
        order.setUser(user);
        order.setCustomerType(user.getCustomerType());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(input.paymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setCoupon(coupon);
        order.setCouponCodeSnapshot(coupon == null ? null : coupon.getCode());
        order.setCouponDiscount(amounts.discount());
        order.setSubtotal(amounts.subtotal());
        order.setShippingAmount(amounts.shipping());
        order.setTaxAmount(amounts.tax());
        order.setTotalAmount(amounts.total());
        order.setPlacedAt(now);
        order.setNotes(input.notes());
        order.setShippingRecipientName(input.recipientName());
        order.setShippingPhone(input.phone());
        order.setShippingEmail(input.email());
        order.setShippingAddressLine1(input.addressLine1());
        order.setShippingAddressLine2(input.addressLine2());
        order.setShippingCity(input.city());
        order.setShippingState(input.state());
        order.setShippingZipCode(input.zipCode());
        order.setShippingCountry(input.country() == null || input.country().isBlank() ? "Morocco" : input.country());
        Order savedOrder = orderRepository.save(order);

        for (CheckoutLine line : lines) {
            Product product = line.product();
            if (line.quantity() > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for product " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setProductNameSnapshot(product.getName());
            orderItem.setProductSkuSnapshot(product.getSku());
            orderItem.setQuantity(line.quantity());
            orderItem.setUnitPrice(line.unitPrice());
            orderItem.setLineTotal(line.lineTotal());
            orderItemRepository.save(orderItem);

            int previousQuantity = product.getStockQuantity();
            int newQuantity = previousQuantity - line.quantity();
            product.setStockQuantity(newQuantity);
            product.setInStock(newQuantity > 0);
            productRepository.save(product);

            StockMovement stockMovement = new StockMovement();
            stockMovement.setProduct(product);
            stockMovement.setChangeType(StockChangeType.SALE);
            stockMovement.setQuantityChange(-line.quantity());
            stockMovement.setPreviousQuantity(previousQuantity);
            stockMovement.setNewQuantity(newQuantity);
            stockMovement.setReferenceType("ORDER");
            stockMovement.setReferenceId(savedOrder.getId());
            stockMovement.setNote("Order " + savedOrder.getOrderNumber());
            stockMovement.setChangedByUser(user);
            stockMovementRepository.save(stockMovement);
        }

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setStatus(OrderStatus.PENDING);
        history.setChangedByUser(user);
        history.setNote("Order placed");
        orderStatusHistoryRepository.save(history);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + now.toEpochMilli());
        invoice.setOrder(savedOrder);
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setIssuedAt(now);
        invoice.setSubtotal(savedOrder.getSubtotal());
        invoice.setShippingAmount(savedOrder.getShippingAmount());
        invoice.setTaxAmount(savedOrder.getTaxAmount());
        invoice.setTotalAmount(savedOrder.getTotalAmount());
        invoice.setCurrency(savedOrder.getCurrency());
        Invoice savedInvoice = invoiceRepository.save(invoice);
        notificationService.createOrderPlacedNotification(user, savedOrder);

        return new CheckoutResponse(
                savedOrder.getId(),
                savedOrder.getOrderNumber(),
                savedInvoice.getId(),
                savedInvoice.getInvoiceNumber(),
                canCreateAccount,
                registrationEmail,
                registrationFullName,
                registrationPhone
        );
    }

    private List<CheckoutLine> buildGuestCheckoutLines(AppUser guestUser, List<GuestCheckoutItemRequest> rawItems) {
        Map<UUID, Integer> quantitiesByProduct = new LinkedHashMap<>();
        for (GuestCheckoutItemRequest item : rawItems) {
            quantitiesByProduct.merge(item.productId(), item.quantity(), Integer::sum);
        }

        return quantitiesByProduct.entrySet().stream()
                .map(entry -> {
                    Product product = productRepository.findById(entry.getKey())
                            .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

                    if (!product.isInStock() || product.getStockQuantity() < entry.getValue()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for product " + product.getName());
                    }

                    BigDecimal unitPrice = resolveUnitPrice(guestUser, product, entry.getValue());
                    BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(entry.getValue()))
                            .setScale(2, RoundingMode.HALF_UP);
                    return new CheckoutLine(product, entry.getValue(), unitPrice, lineTotal);
                })
                .toList();
    }

    private GuestCheckoutCustomer resolveGuestCustomer(GuestCheckoutRequest request) {
        String checkoutEmail = normalizeEmail(request.email());
        String fullName = request.recipientName().trim();
        String phone = trimToNull(request.phone());

        AppUser existingUser = appUserRepository.findByEmailIgnoreCase(checkoutEmail).orElse(null);
        if (existingUser == null) {
            AppUser user = saveGuestCustomer(checkoutEmail, fullName, phone, request);
            return new GuestCheckoutCustomer(user, true, checkoutEmail, fullName, phone);
        }

        if (existingUser.isGuestAccount()) {
            existingUser.setFullName(fullName);
            existingUser.setPhone(phone);
            AppUser savedUser = appUserRepository.save(existingUser);
            upsertCustomerProfile(savedUser, request);
            return new GuestCheckoutCustomer(savedUser, true, checkoutEmail, fullName, phone);
        }

        AppUser aliasGuest = saveGuestCustomer("guest+" + UUID.randomUUID() + "@checkout.tiza.local", fullName, phone, request);
        return new GuestCheckoutCustomer(aliasGuest, false, null, null, null);
    }

    private AppUser saveGuestCustomer(String email, String fullName, String phone, GuestCheckoutRequest request) {
        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setStatus(UserStatus.INACTIVE);
        user.setCustomerType(CustomerType.B2C);
        user.setEmailVerified(false);
        user.setGuestAccount(true);
        user.setRoles(Set.of(roleRepository.findByName(RoleName.ROLE_CUSTOMER).orElseGet(() -> {
            com.tizadestribution.app.user.entity.Role role = new com.tizadestribution.app.user.entity.Role();
            role.setName(RoleName.ROLE_CUSTOMER);
            role.setDescription("Default customer role");
            return roleRepository.save(role);
        })));
        AppUser savedUser = appUserRepository.save(user);
        upsertCustomerProfile(savedUser, request);
        return savedUser;
    }

    private void upsertCustomerProfile(AppUser user, GuestCheckoutRequest request) {
        CustomerProfile profile = customerProfileRepository.findByUser_Id(user.getId()).orElseGet(() -> {
            CustomerProfile customerProfile = new CustomerProfile();
            customerProfile.setUser(user);
            return customerProfile;
        });
        profile.setAddress(trimToNull(request.addressLine1()));
        profile.setCity(trimToNull(request.city()));
        profile.setState(trimToNull(request.state()));
        profile.setZipCode(trimToNull(request.zipCode()));
        profile.setCountry(trimToNull(request.country()) == null ? "Morocco" : trimToNull(request.country()));
        customerProfileRepository.save(profile);
    }

    private CheckoutAmounts calculateAmounts(BigDecimal subtotal, BigDecimal discount) {
        BigDecimal normalizedSubtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        BigDecimal normalizedDiscount = discount.setScale(2, RoundingMode.HALF_UP);
        BigDecimal freeShippingThreshold = getSettingDecimal(FREE_SHIPPING_THRESHOLD_KEY, new BigDecimal("100.00"));
        BigDecimal standardDeliveryPrice = getSettingDecimal(STANDARD_DELIVERY_PRICE_KEY, new BigDecimal("10.00"));
        BigDecimal shipping = normalizedSubtotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : (normalizedSubtotal.compareTo(freeShippingThreshold) >= 0 ? BigDecimal.ZERO : standardDeliveryPrice);

        BigDecimal taxable = normalizedSubtotal.subtract(normalizedDiscount).max(BigDecimal.ZERO);
        BigDecimal taxRate = getSettingDecimal(TAX_RATE_KEY, new BigDecimal("0.08"));
        BigDecimal tax = taxable.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(shipping).add(tax).setScale(2, RoundingMode.HALF_UP);

        return new CheckoutAmounts(normalizedSubtotal, normalizedDiscount, shipping, tax, total);
    }

    private BigDecimal sumLineTotals(List<CheckoutLine> lines) {
        return lines.stream()
                .map(CheckoutLine::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private CheckoutInput toCheckoutInput(
            String recipientName,
            String phone,
            String email,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String zipCode,
            String country,
            PaymentMethodType paymentMethod,
            String notes
    ) {
        return new CheckoutInput(
                trimToNull(recipientName),
                trimToNull(phone),
                trimToNull(email),
                trimToNull(addressLine1),
                trimToNull(addressLine2),
                trimToNull(city),
                trimToNull(state),
                trimToNull(zipCode),
                trimToNull(country),
                paymentMethod,
                trimToNull(notes)
        );
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal rawDiscount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            rawDiscount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if (coupon.getDiscountType() == DiscountType.FIXED) {
            rawDiscount = coupon.getDiscountValue();
        } else {
            rawDiscount = BigDecimal.ZERO;
        }

        if (coupon.getMaxDiscountCap() != null && rawDiscount.compareTo(coupon.getMaxDiscountCap()) > 0) {
            rawDiscount = coupon.getMaxDiscountCap();
        }

        if (rawDiscount.compareTo(subtotal) > 0) {
            rawDiscount = subtotal;
        }

        return rawDiscount.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal sumSubtotal(List<CartItem> items) {
        return items.stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal getSettingDecimal(String key, BigDecimal fallback) {
        return storeSettingRepository.findBySettingKey(key)
                .map(StoreSetting::getValueText)
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .map(v -> {
                    try {
                        return new BigDecimal(v);
                    } catch (NumberFormatException ex) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }

    private void validatePaymentMethodEnabled(PaymentMethodType paymentMethod) {
        Set<PaymentMethodType> enabledMethods = getEnabledPaymentMethods();
        if (!enabledMethods.contains(paymentMethod)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is not available");
        }
    }

    private Set<PaymentMethodType> getEnabledPaymentMethods() {
        return storeSettingRepository.findBySettingKey(ENABLED_PAYMENT_METHODS_KEY)
                .map(StoreSetting::getValueText)
                .map(this::parsePaymentMethods)
                .filter(methods -> !methods.isEmpty())
                .orElse(Set.of(PaymentMethodType.values()));
    }

    private Set<PaymentMethodType> parsePaymentMethods(String rawValue) {
        return java.util.Arrays.stream(rawValue.replace("[", "").replace("]", "").replace("\"", "").split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> {
                    try {
                        return PaymentMethodType.valueOf(value);
                    } catch (IllegalArgumentException ex) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private CartResponse toResponse(Cart cart, List<CartItem> items) {
        List<CartItemResponse> itemResponses = items.stream()
                .sorted(Comparator.comparing(CartItem::getId))
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSlug(),
                        productImageRepository.findByProduct_IdOrderBySortOrderAsc(item.getProduct().getId())
                                .stream()
                                .sorted(Comparator.comparing(img -> !img.isMain()))
                                .map(img -> img.getImageUrl())
                                .findFirst()
                                .orElse(null),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()
                ))
                .toList();

        return new CartResponse(
                cart.getId(),
                cart.getStatus().name(),
                itemResponses,
                cart.getCoupon() == null ? null : cart.getCoupon().getCode(),
                cart.getSubtotal(),
                cart.getDiscountAmount(),
                cart.getShippingAmount(),
                cart.getTaxAmount(),
                cart.getTotalAmount(),
                cart.getUpdatedAt()
        );
    }

    private record CheckoutLine(Product product, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
    }

    private record CheckoutAmounts(
            BigDecimal subtotal,
            BigDecimal discount,
            BigDecimal shipping,
            BigDecimal tax,
            BigDecimal total
    ) {
    }

    private record CheckoutInput(
            String recipientName,
            String phone,
            String email,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String zipCode,
            String country,
            PaymentMethodType paymentMethod,
            String notes
    ) {
    }

    private record GuestCheckoutCustomer(
            AppUser user,
            boolean canCreateAccount,
            String registrationEmail,
            String registrationFullName,
            String registrationPhone
    ) {
    }
}
