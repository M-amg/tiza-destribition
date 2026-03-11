package com.tizadestribution.app.catalog.repository;

import com.tizadestribution.app.catalog.entity.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, UUID> {
    List<ProductSpecification> findByProduct_IdOrderBySortOrderAsc(UUID productId);
}
