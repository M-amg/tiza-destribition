package com.tizadestribution.app.contact.controller;

import com.tizadestribution.app.contact.dto.ContactMessageRequest;
import com.tizadestribution.app.contact.dto.ContactMessageResponse;
import com.tizadestribution.app.contact.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse submit(@Valid @RequestBody ContactMessageRequest request) {
        return contactService.submit(request);
    }
}
