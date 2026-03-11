package com.tizadestribution.app.setting.entity;

import com.tizadestribution.app.common.entity.AuditableEntity;
import com.tizadestribution.app.shared.model.SettingValueType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "store_settings")
public class StoreSetting extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 120)
    private String settingKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false, length = 20)
    private SettingValueType valueType = SettingValueType.STRING;

    @Column(name = "value_text", nullable = false, length = 4000)
    private String valueText;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_public", nullable = false)
    private boolean publicSetting;

    public UUID getId() {
        return id;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public SettingValueType getValueType() {
        return valueType;
    }

    public void setValueType(SettingValueType valueType) {
        this.valueType = valueType;
    }

    public String getValueText() {
        return valueText;
    }

    public void setValueText(String valueText) {
        this.valueText = valueText;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPublicSetting() {
        return publicSetting;
    }

    public void setPublicSetting(boolean publicSetting) {
        this.publicSetting = publicSetting;
    }
}
