import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Banknote,
  CreditCard,
  Landmark,
  LucideAngularModule,
  Save,
  Smartphone
} from 'lucide-angular/src/icons';
import { forkJoin } from 'rxjs';

import { ApiSettingValueType } from '../admin-settings-api.models';
import { AdminSettingsApiService } from '../admin-settings-api.service';

type SettingsTab = 'general' | 'homepage' | 'delivery' | 'payment' | 'notifications';

type ToggleControlName =
  | 'storeStatus'
  | 'maintenanceMode'
  | 'allowB2BRegistration'
  | 'homepagePromoEnabled'
  | 'enableExpressDelivery'
  | 'enableStorePickup'
  | 'paymentCard'
  | 'paymentCash'
  | 'paymentBank'
  | 'paymentWallet'
  | 'notifyNewOrders'
  | 'notifyLowStock'
  | 'notifyCustomerRegistration'
  | 'notifyDailyReport';

type SettingControlName =
  | 'companyName'
  | 'companyEmail'
  | 'companyPhone'
  | 'companyWebsite'
  | 'companyAddress'
  | 'companyLogoUrl'
  | 'homepagePromoBadge'
  | 'homepagePromoTitle'
  | 'homepagePromoDescription'
  | 'homepagePromoButtonLabel'
  | 'homepagePromoButtonLink'
  | 'homepagePromoImageUrl'
  | 'homepagePromoImageAlt'
  | 'storeStatus'
  | 'maintenanceMode'
  | 'allowB2BRegistration'
  | 'homepagePromoEnabled'
  | 'standardDeliveryPrice'
  | 'expressDeliveryPrice'
  | 'freeShippingThreshold'
  | 'enableExpressDelivery'
  | 'enableStorePickup'
  | 'paymentCard'
  | 'paymentCash'
  | 'paymentBank'
  | 'paymentWallet'
  | 'notifyNewOrders'
  | 'notifyLowStock'
  | 'notifyCustomerRegistration'
  | 'notifyDailyReport';

interface SettingBinding {
  key: string;
  control: SettingControlName;
  valueType: ApiSettingValueType;
  description: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  readonly iconSave = Save;
  readonly iconCard = CreditCard;
  readonly iconCash = Banknote;
  readonly iconBank = Landmark;
  readonly iconWallet = Smartphone;

  activeTab: SettingsTab = 'general';
  saved = false;
  loading = true;
  saving = false;
  errorMessage = '';

  private readonly fb = inject(FormBuilder);
  private readonly settingsApi = inject(AdminSettingsApiService);

  readonly form = this.fb.nonNullable.group({
    companyName: ['Tiza Distribution', Validators.required],
    companyEmail: ['info@tizadistribution.com', [Validators.required, Validators.email]],
    companyPhone: ['+1 (555) 123-4567', Validators.required],
    companyWebsite: ['www.tizadistribution.com', Validators.required],
    companyAddress: ['123 Business St, Suite 100, New York, NY 10001', Validators.required],
    companyLogoUrl: [''],
    homepagePromoBadge: ['Limited Time Offer', Validators.required],
    homepagePromoTitle: ['Refresh your catalog with stronger weekly offers', Validators.required],
    homepagePromoDescription: [
      'Use the new homepage design to surface promotions, featured products, and customer trust signals more clearly.',
      Validators.required
    ],
    homepagePromoButtonLabel: ['Browse Promotions', Validators.required],
    homepagePromoButtonLink: ['/shop', Validators.required],
    homepagePromoImageUrl: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      Validators.required
    ],
    homepagePromoImageAlt: ['Fresh vegetables', Validators.required],

    storeStatus: [true],
    maintenanceMode: [false],
    allowB2BRegistration: [true],
    homepagePromoEnabled: [true],

    standardDeliveryPrice: [10, [Validators.required, Validators.min(0)]],
    expressDeliveryPrice: [25, [Validators.required, Validators.min(0)]],
    freeShippingThreshold: [100, [Validators.required, Validators.min(0)]],
    enableExpressDelivery: [true],
    enableStorePickup: [true],

    paymentCard: [true],
    paymentCash: [true],
    paymentBank: [false],
    paymentWallet: [false],

    notifyNewOrders: [true],
    notifyLowStock: [true],
    notifyCustomerRegistration: [false],
    notifyDailyReport: [true]
  });

  private readonly bindings: SettingBinding[] = [
    { key: 'company.name', control: 'companyName', valueType: 'STRING', description: 'Company name', isPublic: true },
    { key: 'company.email', control: 'companyEmail', valueType: 'STRING', description: 'Company email', isPublic: true },
    { key: 'company.phone', control: 'companyPhone', valueType: 'STRING', description: 'Company phone', isPublic: true },
    { key: 'company.website', control: 'companyWebsite', valueType: 'STRING', description: 'Company website', isPublic: true },
    { key: 'company.address', control: 'companyAddress', valueType: 'STRING', description: 'Company address', isPublic: true },
    { key: 'company.logo_url', control: 'companyLogoUrl', valueType: 'STRING', description: 'Company logo URL', isPublic: true },
    { key: 'homepage.promo.badge', control: 'homepagePromoBadge', valueType: 'STRING', description: 'Homepage promo badge text', isPublic: true },
    { key: 'homepage.promo.title', control: 'homepagePromoTitle', valueType: 'STRING', description: 'Homepage promo title', isPublic: true },
    { key: 'homepage.promo.description', control: 'homepagePromoDescription', valueType: 'STRING', description: 'Homepage promo description', isPublic: true },
    { key: 'homepage.promo.button_label', control: 'homepagePromoButtonLabel', valueType: 'STRING', description: 'Homepage promo button label', isPublic: true },
    { key: 'homepage.promo.button_link', control: 'homepagePromoButtonLink', valueType: 'STRING', description: 'Homepage promo button link', isPublic: true },
    { key: 'homepage.promo.image_url', control: 'homepagePromoImageUrl', valueType: 'STRING', description: 'Homepage promo image URL', isPublic: true },
    { key: 'homepage.promo.image_alt', control: 'homepagePromoImageAlt', valueType: 'STRING', description: 'Homepage promo image alt text', isPublic: true },

    { key: 'store.status', control: 'storeStatus', valueType: 'BOOLEAN', description: 'Store enabled', isPublic: false },
    { key: 'store.maintenance_mode', control: 'maintenanceMode', valueType: 'BOOLEAN', description: 'Maintenance mode enabled', isPublic: false },
    { key: 'store.allow_b2b_registration', control: 'allowB2BRegistration', valueType: 'BOOLEAN', description: 'Allow B2B self registration', isPublic: false },
    { key: 'homepage.promo.enabled', control: 'homepagePromoEnabled', valueType: 'BOOLEAN', description: 'Homepage promo section enabled', isPublic: true },

    { key: 'delivery.standard_price', control: 'standardDeliveryPrice', valueType: 'NUMBER', description: 'Standard delivery fee', isPublic: false },
    { key: 'delivery.express_price', control: 'expressDeliveryPrice', valueType: 'NUMBER', description: 'Express delivery fee', isPublic: false },
    { key: 'delivery.free_shipping_threshold', control: 'freeShippingThreshold', valueType: 'NUMBER', description: 'Free shipping threshold amount', isPublic: false },
    { key: 'delivery.enable_express', control: 'enableExpressDelivery', valueType: 'BOOLEAN', description: 'Enable express delivery option', isPublic: false },
    { key: 'delivery.enable_pickup', control: 'enableStorePickup', valueType: 'BOOLEAN', description: 'Enable store pickup option', isPublic: false },

    { key: 'payment.card_enabled', control: 'paymentCard', valueType: 'BOOLEAN', description: 'Credit card payments enabled', isPublic: false },
    { key: 'payment.cash_enabled', control: 'paymentCash', valueType: 'BOOLEAN', description: 'Cash payments enabled', isPublic: false },
    { key: 'payment.bank_enabled', control: 'paymentBank', valueType: 'BOOLEAN', description: 'Bank transfer payments enabled', isPublic: false },
    { key: 'payment.wallet_enabled', control: 'paymentWallet', valueType: 'BOOLEAN', description: 'Digital wallet payments enabled', isPublic: false },

    { key: 'notifications.new_orders', control: 'notifyNewOrders', valueType: 'BOOLEAN', description: 'Notify on new orders', isPublic: false },
    { key: 'notifications.low_stock', control: 'notifyLowStock', valueType: 'BOOLEAN', description: 'Notify on low stock events', isPublic: false },
    { key: 'notifications.new_customers', control: 'notifyCustomerRegistration', valueType: 'BOOLEAN', description: 'Notify on new customer registration', isPublic: false },
    { key: 'notifications.daily_report', control: 'notifyDailyReport', valueType: 'BOOLEAN', description: 'Notify with daily report', isPublic: false }
  ];

  ngOnInit(): void {
    this.loadSettings();
  }

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
    this.saved = false;
  }

  toggleControl(controlName: ToggleControlName): void {
    const control = this.form.controls[controlName];
    control.setValue(!control.value);
  }

  save(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';

    if (this.form.invalid || this.loading || this.saving) {
      return;
    }

    this.saving = true;
    const rawValue = this.form.getRawValue();

    const requests = this.bindings.map((binding) => {
      const controlValue = rawValue[binding.control];
      return this.settingsApi.upsertSetting({
        key: binding.key,
        valueType: binding.valueType,
        value: this.stringifyValue(controlValue, binding.valueType),
        description: binding.description,
        isPublic: binding.isPublic
      });
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
      },
      error: (error: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = error.error?.message ?? 'Failed to save settings.';
      }
    });
  }

  private loadSettings(): void {
    this.loading = true;
    this.errorMessage = '';

    this.settingsApi.allSettings().subscribe({
      next: (settings) => {
        const byKey = new Map(settings.map((setting) => [setting.key, setting]));
        const patch: Record<string, string | number | boolean> = {};

        for (const binding of this.bindings) {
          const setting = byKey.get(binding.key);
          if (!setting) {
            continue;
          }

          patch[binding.control] = this.parseValue(setting.value, binding.valueType);
        }

        this.form.patchValue(patch as Partial<typeof this.form.value>);
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load settings.';
        this.loading = false;
      }
    });
  }

  private parseValue(value: string, type: ApiSettingValueType): string | number | boolean {
    if (type === 'BOOLEAN') {
      return value.trim().toLowerCase() === 'true';
    }

    if (type === 'NUMBER') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return value;
  }

  private stringifyValue(value: string | number | boolean, type: ApiSettingValueType): string {
    if (type === 'BOOLEAN') {
      return value ? 'true' : 'false';
    }

    if (type === 'NUMBER') {
      return String(Number(value));
    }

    return String(value ?? '');
  }
}
