package com.tizadestribution.app.setting.service;

import com.tizadestribution.app.setting.dto.StoreSettingResponse;
import com.tizadestribution.app.setting.dto.StoreSettingUpsertRequest;
import com.tizadestribution.app.setting.entity.StoreSetting;
import com.tizadestribution.app.setting.repository.StoreSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StoreSettingService {
    private static final Set<String> FORCED_PUBLIC_KEYS = Set.of(
            "company.name",
            "company.email",
            "company.phone",
            "company.website",
            "company.address",
            "company.logo_url",
            "company.tagline",
            "company.business_hours",
            "company.sales_phone",
            "company.support_phone",
            "company.sales_email",
            "company.support_email",
            "company.facebook_url",
            "company.instagram_url",
            "company.linkedin_url",
            "company.twitter_url"
    );

    private final StoreSettingRepository storeSettingRepository;

    public StoreSettingService(StoreSettingRepository storeSettingRepository) {
        this.storeSettingRepository = storeSettingRepository;
    }

    @Transactional(readOnly = true)
    public List<StoreSettingResponse> allSettings() {
        return storeSettingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, String> publicSettings() {
        return storeSettingRepository.findAll().stream()
                .filter(setting -> setting.isPublicSetting() || FORCED_PUBLIC_KEYS.contains(setting.getSettingKey()))
                .collect(Collectors.toMap(
                        StoreSetting::getSettingKey,
                        StoreSetting::getValueText,
                        (left, right) -> right
                ));
    }

    @Transactional
    public StoreSettingResponse upsert(StoreSettingUpsertRequest request) {
        StoreSetting setting = storeSettingRepository.findBySettingKey(request.key())
                .orElseGet(StoreSetting::new);

        setting.setSettingKey(request.key());
        setting.setValueType(request.valueType());
        setting.setValueText(request.value());
        setting.setDescription(request.description());
        setting.setPublicSetting(request.isPublic());

        return toResponse(storeSettingRepository.save(setting));
    }

    private StoreSettingResponse toResponse(StoreSetting setting) {
        return new StoreSettingResponse(
                setting.getId(),
                setting.getSettingKey(),
                setting.getValueType(),
                setting.getValueText(),
                setting.getDescription(),
                setting.isPublicSetting(),
                setting.getUpdatedAt()
        );
    }
}
