export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  affiliate_url: string;
  source_product_id?: string;
  images: string[];
  price?: number | null;
  previous_price?: number | null;
  category_id: string;
  is_featured: boolean;
  status: 'published' | 'draft' | 'hidden';
  clicks_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon?: string;
  status: 'published' | 'hidden';
  sort_order: number;
  created_at: string;
  updated_at: string;
  products_count?: number;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  button_color: string;
  background_color: string;
  text_color: string;
  card_radius: 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  hero_banner_title: string;
  hero_banner_subtitle: string;
  hero_banner_image: string;
  hero_banner_cta: string;
  hero_banner_enabled: boolean;
  featured_section_title: string;
  featured_section_enabled: boolean;
  most_clicked_section_title: string;
  most_clicked_section_enabled: boolean;
  recent_section_title: string;
  recent_section_enabled: boolean;
  items_per_section: number;
  header_links: Array<{ label: string; url: string }>;
  footer_text: string;
  affiliate_disclaimer: string;
  social_links: {
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
  };
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  contact_email: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  entity_type: 'product' | 'category' | 'settings' | 'auth';
  entity_id?: string;
  details: string;
  created_at: string;
}

export interface DashboardMetrics {
  stats: {
    totalProducts: number;
    publishedProducts: number;
    draftOrHiddenProducts: number;
    totalClicks: number;
    clicksToday: number;
    clicks7Days: number;
    clicks30Days: number;
  };
  chartData: Array<{ date: string; count: number }>;
  topClicked: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number | null;
    clicks_count: number;
    status: string;
  }>;
}
