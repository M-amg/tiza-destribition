package com.tizadestribution.app.customer.repository;

import com.tizadestribution.app.customer.entity.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, UUID> {
    Optional<CompanyProfile> findByUser_Id(UUID userId);
}
