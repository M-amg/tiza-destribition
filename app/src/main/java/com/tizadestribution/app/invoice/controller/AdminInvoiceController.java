package com.tizadestribution.app.invoice.controller;

import com.tizadestribution.app.invoice.dto.InvoiceResponse;
import com.tizadestribution.app.invoice.service.InvoiceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/invoices")
public class AdminInvoiceController {

    private final InvoiceService invoiceService;

    public AdminInvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public List<InvoiceResponse> allInvoices() {
        return invoiceService.allInvoices();
    }
}
