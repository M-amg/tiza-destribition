package com.tizadestribution.app.customer.service;

import com.tizadestribution.app.common.security.CurrentUserService;
import com.tizadestribution.app.customer.dto.AddressRequest;
import com.tizadestribution.app.customer.dto.AddressResponse;
import com.tizadestribution.app.customer.entity.CustomerAddress;
import com.tizadestribution.app.customer.repository.CustomerAddressRepository;
import com.tizadestribution.app.user.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AddressService {

    private final CustomerAddressRepository customerAddressRepository;
    private final CurrentUserService currentUserService;

    public AddressService(CustomerAddressRepository customerAddressRepository, CurrentUserService currentUserService) {
        this.customerAddressRepository = customerAddressRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> myAddresses(Authentication authentication) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        return customerAddressRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(Authentication authentication, AddressRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);

        CustomerAddress address = new CustomerAddress();
        address.setUser(user);
        applyRequest(address, request);

        if (request.defaultShipping() || request.defaultBilling()) {
            resetDefaults(user.getId(), request.defaultShipping(), request.defaultBilling());
        }

        return toResponse(customerAddressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Authentication authentication, UUID id, AddressRequest request) {
        AppUser user = currentUserService.getRequiredUser(authentication);

        CustomerAddress address = customerAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        if (request.defaultShipping() || request.defaultBilling()) {
            resetDefaults(user.getId(), request.defaultShipping(), request.defaultBilling());
        }

        applyRequest(address, request);
        return toResponse(customerAddressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Authentication authentication, UUID id) {
        AppUser user = currentUserService.getRequiredUser(authentication);
        CustomerAddress address = customerAddressRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        customerAddressRepository.delete(address);
    }

    private void resetDefaults(UUID userId, boolean resetShipping, boolean resetBilling) {
        List<CustomerAddress> addresses = customerAddressRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        for (CustomerAddress existing : addresses) {
            if (resetShipping && existing.isDefaultShipping()) {
                existing.setDefaultShipping(false);
            }
            if (resetBilling && existing.isDefaultBilling()) {
                existing.setDefaultBilling(false);
            }
        }
    }

    private void applyRequest(CustomerAddress address, AddressRequest request) {
        address.setLabel(request.label());
        address.setRecipientName(request.recipientName());
        address.setPhone(request.phone());
        address.setAddressLine1(request.addressLine1());
        address.setAddressLine2(request.addressLine2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZipCode(request.zipCode());
        address.setCountry(request.country());
        address.setDefaultShipping(request.defaultShipping());
        address.setDefaultBilling(request.defaultBilling());
    }

    private AddressResponse toResponse(CustomerAddress address) {
        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry(),
                address.isDefaultShipping(),
                address.isDefaultBilling(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}
