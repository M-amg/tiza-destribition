package com.tizadestribution.app.invoice.controller;

import com.tizadestribution.app.invoice.dto.InvoiceResponse;
import com.tizadestribution.app.invoice.service.InvoiceService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public List<InvoiceResponse> myInvoices(Authentication authentication) {
        return invoiceService.myInvoices(authentication);
    }

    @GetMapping("/{id}")
    public InvoiceResponse myInvoiceById(Authentication authentication, @PathVariable UUID id) {
        return invoiceService.myInvoiceById(authentication, id);
    }
}
