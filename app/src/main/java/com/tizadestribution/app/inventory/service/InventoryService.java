package com.tizadestribution.app.inventory.service;

import com.tizadestribution.app.catalog.entity.Product;
import com.tizadestribution.app.catalog.repository.ProductRepository;
import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.inventory.dto.StockAdjustmentRequest;
import com.tizadestribution.app.inventory.dto.StockMovementResponse;
import com.tizadestribution.app.inventory.entity.StockMovement;
import com.tizadestribution.app.inventory.repository.StockMovementRepository;
import com.tizadestribution.app.shared.model.StockChangeType;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class InventoryService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    public InventoryService(
            StockMovementRepository stockMovementRepository,
            ProductRepository productRepository,
            CurrentUserService currentUserService
    ) {
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> allMovements() {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StockMovementResponse adjustStock(Authentication authentication, StockAdjustmentRequest request) {
        AppUser actor = currentUserService.getRequiredUser(authentication);
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        int previous = product.getStockQuantity();
        int next = previous + request.quantityChange();
        if (next < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot become negative");
        }

        product.setStockQuantity(next);
        product.setInStock(next > 0);
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setChangeType(request.quantityChange() >= 0 ? StockChangeType.RESTOCK : StockChangeType.ADJUSTMENT);
        movement.setQuantityChange(request.quantityChange());
        movement.setPreviousQuantity(previous);
        movement.setNewQuantity(next);
        movement.setNote(request.note());
        movement.setChangedByUser(actor);

        return toResponse(stockMovementRepository.save(movement));
    }

    private StockMovementResponse toResponse(StockMovement m) {
        String changedBy = "System";
        if (m.getChangedByUser() != null) {
            String fullName = m.getChangedByUser().getFullName();
            changedBy = (fullName != null && !fullName.isBlank()) ? fullName : m.getChangedByUser().getEmail();
        }

        return new StockMovementResponse(
                m.getId(),
                m.getProduct().getId(),
                m.getProduct().getName(),
                m.getChangeType().name(),
                m.getQuantityChange(),
                m.getPreviousQuantity(),
                m.getNewQuantity(),
                changedBy,
                m.getNote(),
                m.getCreatedAt()
        );
    }
}
