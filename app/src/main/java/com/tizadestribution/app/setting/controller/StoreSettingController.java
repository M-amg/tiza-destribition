package com.tizadestribution.app.setting.controller;

import com.tizadestribution.app.setting.dto.StoreSettingResponse;
import com.tizadestribution.app.setting.dto.StoreSettingUpsertRequest;
import com.tizadestribution.app.setting.service.StoreSettingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/settings")
public class StoreSettingController {

    private final StoreSettingService storeSettingService;

    public StoreSettingController(StoreSettingService storeSettingService) {
        this.storeSettingService = storeSettingService;
    }

    @GetMapping
    public List<StoreSettingResponse> allSettings() {
        return storeSettingService.allSettings();
    }

    @PostMapping
    public StoreSettingResponse upsert(@Valid @RequestBody StoreSettingUpsertRequest request) {
        return storeSettingService.upsert(request);
    }
}
