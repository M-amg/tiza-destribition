package com.tizadestribution.app.catalog.repository;

import com.tizadestribution.app.catalog.entity.Product;
import com.tizadestribution.app.shared.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);

    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    List<Product> findByCategory_IdAndStatusOrderByCreatedAtDesc(UUID categoryId, ProductStatus status);

    long countByCategory_Id(UUID categoryId);

    long countByCategory_IdAndStatus(UUID categoryId, ProductStatus status);

    @Query("select distinct p.brand from Product p where p.status = :status order by p.brand asc")
    List<String> findDistinctBrandsByStatusOrderByBrandAsc(@Param("status") ProductStatus status);

    @Query("select distinct p.brand from Product p where p.status = :status and p.category.id in :categoryIds order by p.brand asc")
    List<String> findDistinctBrandsByStatusAndCategory_IdInOrderByBrandAsc(
            @Param("status") ProductStatus status,
            @Param("categoryIds") Collection<UUID> categoryIds
    );
}
