package com.tizadestribution.app.catalog.service;

import com.tizadestribution.app.catalog.dto.CategoryResponse;
import com.tizadestribution.app.catalog.dto.ProductDetailResponse;
import com.tizadestribution.app.catalog.dto.ProductPageResponse;
import com.tizadestribution.app.catalog.dto.ProductSpecificationResponse;
import com.tizadestribution.app.catalog.dto.ProductSummaryResponse;
import com.tizadestribution.app.catalog.entity.Product;
import com.tizadestribution.app.catalog.repository.CategoryRepository;
import com.tizadestribution.app.catalog.repository.ProductImageRepository;
import com.tizadestribution.app.catalog.repository.ProductRepository;
import com.tizadestribution.app.catalog.repository.ProductSpecificationRepository;
import com.tizadestribution.app.shared.model.CategoryStatus;
import com.tizadestribution.app.shared.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductSpecificationRepository productSpecificationRepository;

    public CatalogService(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            ProductSpecificationRepository productSpecificationRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productSpecificationRepository = productSpecificationRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findByStatusOrderByDisplayOrderAscNameAsc(CategoryStatus.ACTIVE)
                .stream()
                .map(c -> new CategoryResponse(
                        c.getId(),
                        c.getName(),
                        c.getSlug(),
                        c.getDescription(),
                        c.getImageUrl(),
                        c.getDisplayOrder(),
                        productRepository.countByCategory_IdAndStatus(c.getId(), ProductStatus.ACTIVE)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> listProducts(UUID categoryId) {
        List<Product> products = categoryId == null
                ? productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE)
                : productRepository.findByCategory_IdAndStatusOrderByCreatedAtDesc(categoryId, ProductStatus.ACTIVE);

        return products.stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public ProductPageResponse listProductsPage(
            List<UUID> categoryIds,
            List<String> brands,
            String search,
            Boolean inStock,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), 48),
                resolveSort(sortBy)
        );

        Specification<Product> specification = combineSpecifications(
                hasStatus(ProductStatus.ACTIVE),
                hasCategoryIds(categoryIds),
                hasBrands(brands),
                matchesSearch(search),
                hasInStock(inStock),
                hasPriceRange(minPrice, maxPrice)
        );

        Page<Product> result = productRepository.findAll(specification, pageable);

        return new ProductPageResponse(
                result.getContent().stream().map(this::toSummary).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public List<String> listBrands(List<UUID> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return productRepository.findDistinctBrandsByStatusOrderByBrandAsc(ProductStatus.ACTIVE);
        }

        return productRepository.findDistinctBrandsByStatusAndCategory_IdInOrderByBrandAsc(ProductStatus.ACTIVE, categoryIds);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toDetail(product);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toDetail(product);
    }

    private ProductSummaryResponse toSummary(Product p) {
        String imageUrl = productImageRepository.findByProduct_IdOrderBySortOrderAsc(p.getId())
                .stream()
                .sorted(Comparator.comparing(img -> !img.isMain()))
                .map(img -> img.getImageUrl())
                .findFirst()
                .orElse(null);

        return new ProductSummaryResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getShortDescription(),
                p.getBrand(),
                imageUrl,
                p.getB2cPrice(),
                p.getB2bPrice(),
                p.isFeatured(),
                p.isNew(),
                p.isInStock(),
                p.getStockQuantity(),
                p.getRating(),
                p.getReviewCount()
        );
    }

    private ProductDetailResponse toDetail(Product p) {
        CategoryResponse category = new CategoryResponse(
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getCategory().getSlug(),
                p.getCategory().getDescription(),
                p.getCategory().getImageUrl(),
                p.getCategory().getDisplayOrder(),
                null
        );

        List<String> images = productImageRepository.findByProduct_IdOrderBySortOrderAsc(p.getId())
                .stream()
                .sorted(Comparator.comparing(img -> !img.isMain()))
                .map(img -> img.getImageUrl())
                .toList();

        List<ProductSpecificationResponse> specs = productSpecificationRepository.findByProduct_IdOrderBySortOrderAsc(p.getId())
                .stream()
                .map(spec -> new ProductSpecificationResponse(spec.getLabel(), spec.getValue()))
                .toList();

        return new ProductDetailResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getShortDescription(),
                p.getBrand(),
                p.getSku(),
                p.getBarcode(),
                p.getB2cPrice(),
                p.getB2bPrice(),
                p.getOriginalPrice(),
                p.getDiscountValue(),
                p.getDiscountType().name(),
                p.getDiscountAppliesTo().name(),
                p.getMinB2BQuantity(),
                p.isInStock(),
                p.getStockQuantity(),
                p.getRating(),
                p.getReviewCount(),
                p.isFeatured(),
                p.isNew(),
                p.getStatus().name(),
                category,
                images,
                specs
        );
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "reviewCount", "createdAt");
        }

        return switch (sortBy) {
            case "priceLow" -> Sort.by(Sort.Direction.ASC, "b2cPrice", "createdAt");
            case "priceHigh" -> Sort.by(Sort.Direction.DESC, "b2cPrice", "createdAt");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating", "reviewCount");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "stockHigh" -> Sort.by(
                    Sort.Order.desc("inStock"),
                    Sort.Order.desc("stockQuantity"),
                    Sort.Order.desc("createdAt")
            );
            case "stockLow" -> Sort.by(
                    Sort.Order.asc("inStock"),
                    Sort.Order.asc("stockQuantity"),
                    Sort.Order.desc("createdAt")
            );
            default -> Sort.by(Sort.Direction.DESC, "reviewCount", "createdAt");
        };
    }

    private Specification<Product> hasStatus(ProductStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private Specification<Product> hasCategoryIds(List<UUID> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> root.get("category").get("id").in(categoryIds);
    }

    private Specification<Product> hasBrands(List<String> brands) {
        if (brands == null || brands.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> root.get("brand").in(brands);
    }

    private Specification<Product> matchesSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }

        String likeValue = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), likeValue),
                cb.like(cb.lower(root.get("brand")), likeValue)
        );
    }

    private Specification<Product> hasInStock(Boolean inStock) {
        if (inStock == null) {
            return null;
        }

        return (root, query, cb) -> cb.equal(root.get("inStock"), inStock);
    }

    private Specification<Product> hasPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice == null && maxPrice == null) {
            return null;
        }

        return (root, query, cb) -> {
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("b2cPrice"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("b2cPrice"), minPrice);
            }
            return cb.lessThanOrEqualTo(root.get("b2cPrice"), maxPrice);
        };
    }

    @SafeVarargs
    private final Specification<Product> combineSpecifications(Specification<Product>... specifications) {
        Specification<Product> combined = null;

        for (Specification<Product> specification : specifications) {
            if (Objects.nonNull(specification)) {
                combined = combined == null ? specification : combined.and(specification);
            }
        }

        return combined == null ? (root, query, cb) -> cb.conjunction() : combined;
    }
}
