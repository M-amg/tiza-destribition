package com.tizadestribution.app.setting.repository;

import com.tizadestribution.app.setting.entity.StoreSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StoreSettingRepository extends JpaRepository<StoreSetting, UUID> {
    Optional<StoreSetting> findBySettingKey(String settingKey);
}
