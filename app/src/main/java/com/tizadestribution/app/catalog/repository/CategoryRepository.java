package com.tizadestribution.app.catalog.repository;

import com.tizadestribution.app.catalog.entity.Category;
import com.tizadestribution.app.shared.model.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);

    List<Category> findAllByOrderByDisplayOrderAscNameAsc();

    List<Category> findByStatusOrderByDisplayOrderAscNameAsc(CategoryStatus status);

    Optional<Category> findTopByOrderByDisplayOrderDesc();
}
