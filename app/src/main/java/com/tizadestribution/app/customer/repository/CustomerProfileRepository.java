package com.tizadestribution.app.customer.repository;

import com.tizadestribution.app.customer.entity.CustomerProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
    @Override
    @EntityGraph(attributePaths = "user")
    List<CustomerProfile> findAll();

    @EntityGraph(attributePaths = "user")
    Optional<CustomerProfile> findByUser_Id(UUID userId);
}
