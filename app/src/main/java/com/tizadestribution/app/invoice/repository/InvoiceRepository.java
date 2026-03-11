package com.tizadestribution.app.invoice.repository;

import com.tizadestribution.app.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByOrder_User_IdOrderByIssuedAtDesc(UUID userId);

    Optional<Invoice> findByIdAndOrder_User_Id(UUID id, UUID userId);
}
