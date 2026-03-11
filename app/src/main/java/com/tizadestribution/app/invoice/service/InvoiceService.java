package com.tizadestribution.app.invoice.service;

import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.invoice.dto.InvoiceResponse;
import com.tizadestribution.app.invoice.entity.Invoice;
import com.tizadestribution.app.invoice.repository.InvoiceRepository;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CurrentUserService currentUserService;

    public InvoiceService(InvoiceRepository invoiceRepository, CurrentUserService currentUserService) {
        this.invoiceRepository = invoiceRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> myInvoices(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        return invoiceRepository.findByOrder_User_IdOrderByIssuedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse myInvoiceById(Authentication authentication, UUID id) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        Invoice invoice = invoiceRepository.findByIdAndOrder_User_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> allInvoices() {
        return invoiceRepository.findAll().stream().map(this::toResponse).toList();
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getOrder().getId(),
                invoice.getOrder().getOrderNumber(),
                invoice.getStatus().name(),
                invoice.getIssuedAt(),
                invoice.getDueAt(),
                invoice.getPaidAt(),
                invoice.getTotalAmount(),
                invoice.getCurrency(),
                invoice.getPdfUrl()
        );
    }
}
