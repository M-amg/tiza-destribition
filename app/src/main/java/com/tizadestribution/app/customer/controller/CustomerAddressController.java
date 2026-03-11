package com.tizadestribution.app.customer.controller;

import com.tizadestribution.app.customer.dto.AddressRequest;
import com.tizadestribution.app.customer.dto.AddressResponse;
import com.tizadestribution.app.customer.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customer/addresses")
public class CustomerAddressController {

    private final AddressService addressService;

    public CustomerAddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public List<AddressResponse> myAddresses(Authentication authentication) {
        return addressService.myAddresses(authentication);
    }

    @PostMapping
    public AddressResponse create(Authentication authentication, @Valid @RequestBody AddressRequest request) {
        return addressService.createAddress(authentication, request);
    }

    @PutMapping("/{id}")
    public AddressResponse update(Authentication authentication, @PathVariable UUID id, @Valid @RequestBody AddressRequest request) {
        return addressService.updateAddress(authentication, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(Authentication authentication, @PathVariable UUID id) {
        addressService.deleteAddress(authentication, id);
    }
}
