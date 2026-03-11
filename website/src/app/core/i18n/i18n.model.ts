export type AppLanguage = 'fr' | 'en' | 'ar';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  dir: 'ltr' | 'rtl';
}
