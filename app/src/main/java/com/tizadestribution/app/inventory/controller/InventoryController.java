package com.tizadestribution.app.inventory.controller;

import com.tizadestribution.app.inventory.dto.StockAdjustmentRequest;
import com.tizadestribution.app.inventory.dto.StockMovementResponse;
import com.tizadestribution.app.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/movements")
    public List<StockMovementResponse> allMovements() {
        return inventoryService.allMovements();
    }

    @PostMapping("/adjust")
    public StockMovementResponse adjust(Authentication authentication, @Valid @RequestBody StockAdjustmentRequest request) {
        return inventoryService.adjustStock(authentication, request);
    }
}
