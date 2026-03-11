export interface StorefrontInfo {
  name: string;
  tagline: string;
  announcement: string;
  logoUrl: string | null;
  phone: string;
  salesPhone: string | null;
  supportPhone: string | null;
  email: string;
  salesEmail: string | null;
  supportEmail: string | null;
  address: string;
  addressLines: string[];
  businessHours: string[];
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
}
