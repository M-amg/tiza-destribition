package com.tizadestribution.app.setting.controller;

import com.tizadestribution.app.setting.service.StoreSettingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
public class PublicStoreSettingController {

    private final StoreSettingService storeSettingService;

    public PublicStoreSettingController(StoreSettingService storeSettingService) {
        this.storeSettingService = storeSettingService;
    }

    @GetMapping("/public")
    public Map<String, String> publicSettings() {
        return storeSettingService.publicSettings();
    }
}
