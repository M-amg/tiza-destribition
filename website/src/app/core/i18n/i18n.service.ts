import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AppLanguage, LanguageOption } from './i18n.model';
import { TRANSLATIONS } from './translations';

const STORAGE_KEY = 'tiza.language';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly languageState = signal<AppLanguage>('fr');

  readonly languages: LanguageOption[] = [
    { code: 'fr', label: 'FR', dir: 'ltr' },
    { code: 'en', label: 'EN', dir: 'ltr' },
    { code: 'ar', label: 'AR', dir: 'rtl' }
  ];

  readonly language = this.languageState.asReadonly();

  constructor() {
    if (this.browser) {
      const stored = window.localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
      if (stored && this.languages.some((language) => language.code === stored)) {
        this.languageState.set(stored);
      }
    }

    effect(() => {
      const language = this.languageState();
      const dir = this.languages.find((item) => item.code === language)?.dir ?? 'ltr';
      this.document.documentElement.lang = language;
      this.document.documentElement.dir = dir;

      if (this.browser) {
        window.localStorage.setItem(STORAGE_KEY, language);
      }
    });
  }

  setLanguage(language: AppLanguage): void {
    this.languageState.set(language);
  }

  t(key: string, params?: Record<string, string | number | null | undefined>): string {
    const language = this.languageState();
    const template = TRANSLATIONS[language][key] ?? TRANSLATIONS.fr[key] ?? key;

    if (!params) {
      return template;
    }

    return Object.entries(params).reduce((value, [paramKey, paramValue]) => {
      return value.replaceAll(`{${paramKey}}`, String(paramValue ?? ''));
    }, template);
  }
}
