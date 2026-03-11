package com.tizadestribution.app.catalog.repository;

import com.tizadestribution.app.catalog.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findByProduct_IdOrderBySortOrderAsc(UUID productId);

    List<ProductImage> findByProduct_IdInOrderByProduct_IdAscSortOrderAsc(List<UUID> productIds);

    void deleteByProduct_Id(UUID productId);
}
