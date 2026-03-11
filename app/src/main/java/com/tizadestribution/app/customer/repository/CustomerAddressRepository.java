package com.tizadestribution.app.customer.repository;

import com.tizadestribution.app.customer.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, UUID> {
    List<CustomerAddress> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<CustomerAddress> findByIdAndUser_Id(UUID id, UUID userId);
}
