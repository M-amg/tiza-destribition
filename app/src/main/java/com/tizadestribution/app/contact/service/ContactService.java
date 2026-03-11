package com.tizadestribution.app.contact.service;

import com.tizadestribution.app.contact.dto.ContactMessageRequest;
import com.tizadestribution.app.contact.dto.ContactMessageResponse;
import com.tizadestribution.app.contact.entity.ContactMessage;
import com.tizadestribution.app.contact.repository.ContactMessageRepository;
import com.tizadestribution.app.shared.model.ContactMessageStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public ContactMessageResponse submit(ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setFullName(request.fullName());
        message.setEmail(request.email());
        message.setPhone(request.phone());
        message.setSubject(request.subject());
        message.setMessage(request.message());
        message.setStatus(ContactMessageStatus.NEW);

        ContactMessage saved = contactMessageRepository.save(message);
        return new ContactMessageResponse(saved.getId(), saved.getStatus().name(), "Message received");
    }
}
