package com.tizadestribution.app.catalog.controller;

import com.tizadestribution.app.catalog.dto.CategoryResponse;
import com.tizadestribution.app.catalog.dto.ProductDetailResponse;
import com.tizadestribution.app.catalog.dto.ProductPageResponse;
import com.tizadestribution.app.catalog.dto.ProductSummaryResponse;
import com.tizadestribution.app.catalog.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return catalogService.listCategories();
    }

    @GetMapping("/products")
    public List<ProductSummaryResponse> products(@RequestParam(required = false) UUID categoryId) {
        return catalogService.listProducts(categoryId);
    }

    @GetMapping("/products/paged")
    public ProductPageResponse pagedProducts(
            @RequestParam(required = false, name = "categoryId") List<UUID> categoryIds,
            @RequestParam(required = false, name = "brand") List<String> brands,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(required = false) String stock,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "featured") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return catalogService.listProductsPage(
                categoryIds,
                brands,
                query,
                parseStock(stock),
                minPrice,
                maxPrice,
                sortBy,
                page,
                size
        );
    }

    @GetMapping("/products/brands")
    public List<String> brands(@RequestParam(required = false, name = "categoryId") List<UUID> categoryIds) {
        return catalogService.listBrands(categoryIds);
    }

    @GetMapping("/products/{id}")
    public ProductDetailResponse productById(@PathVariable UUID id) {
        return catalogService.getProductById(id);
    }

    @GetMapping("/products/slug/{slug}")
    public ProductDetailResponse productBySlug(@PathVariable String slug) {
        return catalogService.getProductBySlug(slug);
    }

    private Boolean parseStock(String stock) {
        if (stock == null || stock.isBlank() || "all".equalsIgnoreCase(stock)) {
            return null;
        }
        if ("inStock".equalsIgnoreCase(stock)) {
            return true;
        }
        if ("outOfStock".equalsIgnoreCase(stock)) {
            return false;
        }
        return null;
    }
}
