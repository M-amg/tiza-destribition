package com.tizadestribution.app.catalog.controller;

import com.tizadestribution.app.catalog.dto.AdminCategoryResponse;
import com.tizadestribution.app.catalog.dto.CategoryUpsertRequest;
import com.tizadestribution.app.catalog.dto.AdminProductDetailResponse;
import com.tizadestribution.app.catalog.dto.AdminProductSummaryResponse;
import com.tizadestribution.app.catalog.dto.ProductUpsertRequest;
import com.tizadestribution.app.catalog.dto.UploadedImageResponse;
import com.tizadestribution.app.catalog.service.AdminProductImageStorageService;
import com.tizadestribution.app.catalog.service.CatalogAdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class CatalogAdminController {

    private final CatalogAdminService catalogAdminService;
    private final AdminProductImageStorageService productImageStorageService;

    public CatalogAdminController(
            CatalogAdminService catalogAdminService,
            AdminProductImageStorageService productImageStorageService
    ) {
        this.catalogAdminService = catalogAdminService;
        this.productImageStorageService = productImageStorageService;
    }

    @GetMapping("/categories")
    public List<AdminCategoryResponse> allCategories() {
        return catalogAdminService.allCategories();
    }

    @GetMapping("/categories/{id}")
    public AdminCategoryResponse categoryById(@PathVariable UUID id) {
        return catalogAdminService.categoryById(id);
    }

    @PostMapping("/categories")
    public AdminCategoryResponse createCategory(@Valid @RequestBody CategoryUpsertRequest request) {
        return catalogAdminService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    public AdminCategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryUpsertRequest request) {
        return catalogAdminService.updateCategory(id, request);
    }

    @PostMapping("/uploads/category-image")
    public UploadedImageResponse uploadCategoryImage(@RequestParam("file") MultipartFile file) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return productImageStorageService.storeCategoryImage(file, baseUrl);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable UUID id) {
        catalogAdminService.deleteCategory(id);
    }

    @GetMapping("/products")
    public List<AdminProductSummaryResponse> allProducts() {
        return catalogAdminService.allProducts();
    }

    @GetMapping("/products/{id}")
    public AdminProductDetailResponse productById(@PathVariable UUID id) {
        return catalogAdminService.productById(id);
    }

    @PostMapping("/products")
    public AdminProductDetailResponse createProduct(@Valid @RequestBody ProductUpsertRequest request) {
        return catalogAdminService.createProduct(request);
    }

    @PostMapping("/uploads/product-images")
    public List<UploadedImageResponse> uploadProductImages(@RequestParam("files") List<MultipartFile> files) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return productImageStorageService.storeProductImages(files, baseUrl);
    }

    @PutMapping("/products/{id}")
    public AdminProductDetailResponse updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductUpsertRequest request) {
        return catalogAdminService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable UUID id) {
        catalogAdminService.deleteProduct(id);
    }
}
