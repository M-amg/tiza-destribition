package com.tizadestribution.app.catalog.service;

import com.tizadestribution.app.catalog.dto.AdminProductDetailResponse;
import com.tizadestribution.app.catalog.dto.AdminProductSummaryResponse;
import com.tizadestribution.app.catalog.dto.AdminCategoryResponse;
import com.tizadestribution.app.catalog.dto.CategoryResponse;
import com.tizadestribution.app.catalog.dto.CategoryUpsertRequest;
import com.tizadestribution.app.catalog.dto.ProductSpecificationResponse;
import com.tizadestribution.app.catalog.dto.ProductUpsertRequest;
import com.tizadestribution.app.catalog.entity.Category;
import com.tizadestribution.app.catalog.entity.Product;
import com.tizadestribution.app.catalog.entity.ProductImage;
import com.tizadestribution.app.catalog.repository.CategoryRepository;
import com.tizadestribution.app.catalog.repository.ProductImageRepository;
import com.tizadestribution.app.catalog.repository.ProductRepository;
import com.tizadestribution.app.catalog.repository.ProductSpecificationRepository;
import com.tizadestribution.app.shared.model.CategoryStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class CatalogAdminService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductSpecificationRepository productSpecificationRepository;

    public CatalogAdminService(
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
    public List<AdminCategoryResponse> allCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(this::toAdminCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminCategoryResponse categoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        return toAdminCategoryResponse(category);
    }

    @Transactional
    public AdminCategoryResponse createCategory(CategoryUpsertRequest request) {
        Category category = new Category();
        applyCategory(category, request);
        return toAdminCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public AdminCategoryResponse updateCategory(UUID id, CategoryUpsertRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        applyCategory(category, request);
        return toAdminCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        long linkedProducts = productRepository.countByCategory_Id(category.getId());
        if (linkedProducts > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category has products and cannot be deleted");
        }

        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<AdminProductSummaryResponse> allProducts() {
        return productRepository.findAll().stream().map(this::toAdminSummary).toList();
    }

    @Transactional
    public AdminProductDetailResponse createProduct(ProductUpsertRequest request) {
        Product product = new Product();
        applyProduct(product, request);
        Product saved = productRepository.save(product);
        syncImages(saved, request.images());
        return toAdminDetail(saved);
    }

    @Transactional
    public AdminProductDetailResponse updateProduct(UUID id, ProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        applyProduct(product, request);
        Product saved = productRepository.save(product);
        syncImages(saved, request.images());
        return toAdminDetail(saved);
    }

    @Transactional(readOnly = true)
    public AdminProductDetailResponse productById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        return toAdminDetail(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        productRepository.delete(product);
    }

    private void applyCategory(Category category, CategoryUpsertRequest request) {
        category.setName(request.name());
        category.setSlug(request.slug());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        category.setDisplayOrder(resolveDisplayOrder(category, request.sortOrder()));
        category.setStatus(request.status() == null || request.status().isBlank()
                ? CategoryStatus.ACTIVE
                : CategoryStatus.valueOf(request.status().trim().toUpperCase()));

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
    }

    private void applyProduct(Product product, ProductUpsertRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));

        product.setCategory(category);
        product.setName(request.name());
        product.setSlug(request.slug());
        product.setDescription(request.description());
        product.setShortDescription(request.shortDescription());
        product.setBrand(request.brand());
        product.setSku(request.sku());
        product.setBarcode(request.barcode());
        product.setCostPrice(request.costPrice());
        product.setB2cPrice(request.b2cPrice());
        product.setB2bPrice(request.b2bPrice());
        product.setOriginalPrice(request.originalPrice());
        product.setDiscountType(request.discountType());
        product.setDiscountValue(request.discountValue());
        product.setDiscountAppliesTo(request.discountAppliesTo());
        product.setMinB2BQuantity(request.minB2BQuantity());
        product.setStockQuantity(request.stockQuantity());
        product.setMinimumStockLevel(request.minimumStockLevel());
        product.setInStock(request.stockQuantity() > 0);
        product.setFeatured(request.featured());
        product.setNew(request.isNew());
        product.setStatus(request.status());
    }

    private void syncImages(Product product, List<String> images) {
        productImageRepository.deleteByProduct_Id(product.getId());
        if (images == null || images.isEmpty()) {
            return;
        }

        for (int i = 0; i < images.size(); i++) {
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(images.get(i));
            image.setSortOrder(i);
            image.setMain(i == 0);
            productImageRepository.save(image);
        }
    }

    private AdminCategoryResponse toAdminCategoryResponse(Category c) {
        long productCount = productRepository.countByCategory_Id(c.getId());
        UUID parentId = c.getParent() == null ? null : c.getParent().getId();

        return new AdminCategoryResponse(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getDescription(),
                c.getImageUrl(),
                c.getDisplayOrder(),
                c.getStatus().name(),
                parentId,
                productCount
        );
    }

    private AdminProductSummaryResponse toAdminSummary(Product p) {
        String imageUrl = productImageRepository.findByProduct_IdOrderBySortOrderAsc(p.getId())
                .stream()
                .sorted(Comparator.comparing(img -> !img.isMain()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);

        return new AdminProductSummaryResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getShortDescription(),
                p.getBrand(),
                p.getSku(),
                imageUrl,
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getCostPrice(),
                p.getB2cPrice(),
                p.getB2bPrice(),
                p.getStockQuantity(),
                p.getMinimumStockLevel(),
                p.isFeatured(),
                p.isNew(),
                p.isInStock(),
                p.getStatus().name(),
                p.getUpdatedAt()
        );
    }

    private AdminProductDetailResponse toAdminDetail(Product p) {
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
                .map(ProductImage::getImageUrl)
                .toList();

        List<ProductSpecificationResponse> specs = productSpecificationRepository.findByProduct_IdOrderBySortOrderAsc(p.getId())
                .stream()
                .map(spec -> new ProductSpecificationResponse(spec.getLabel(), spec.getValue()))
                .toList();

        return new AdminProductDetailResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getShortDescription(),
                p.getBrand(),
                p.getSku(),
                p.getBarcode(),
                p.getCostPrice(),
                p.getB2cPrice(),
                p.getB2bPrice(),
                p.getOriginalPrice(),
                p.getDiscountValue(),
                p.getDiscountType().name(),
                p.getDiscountAppliesTo().name(),
                p.getMinB2BQuantity(),
                p.getStockQuantity(),
                p.getMinimumStockLevel(),
                p.isInStock(),
                p.isFeatured(),
                p.isNew(),
                p.getStatus().name(),
                category,
                images,
                specs,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private int resolveDisplayOrder(Category category, Integer requestedSortOrder) {
        if (requestedSortOrder != null) {
            return Math.max(0, requestedSortOrder);
        }

        if (category.getId() != null) {
            return category.getDisplayOrder() == null ? 0 : category.getDisplayOrder();
        }

        return categoryRepository.findTopByOrderByDisplayOrderDesc()
                .map(existing -> existing.getDisplayOrder() == null ? 0 : existing.getDisplayOrder() + 1)
                .orElse(0);
    }
}
