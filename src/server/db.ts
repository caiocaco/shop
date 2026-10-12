import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  deleted_at?: string | null;
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
  deleted_at?: string | null;
}

export interface ClickEvent {
  id: string;
  product_id: string;
  product_name?: string;
  clicked_at: string;
  source?: string;
  campaign?: string;
  referer?: string;
  user_agent?: string;
  session_id?: string;
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
  password_hash: string;
  name: string;
  session_token?: string;
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

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  clicks: ClickEvent[];
  settings: StoreSettings;
  users: AdminUser[];
  activities: ActivityLog[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'tokshop_salt_2026').digest('hex');
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Achados do TikTok Shop',
  tagline: 'Os melhores achadinhos e tendências do TikTok Shop com desconto exclusivo',
  logo_url: '/src/assets/images/logo_achados_1791805418762.jpg',
  favicon_url: '/src/assets/images/logo_achados_1791805418762.jpg',
  primary_color: '#f59e0b',
  secondary_color: '#0f172a',
  button_color: '#f59e0b',
  background_color: '#f8fafc',
  text_color: '#0f172a',
  card_radius: 'rounded-2xl',
  hero_banner_title: 'Achados do TikTok Shop',
  hero_banner_subtitle: 'Descubra os produtos mais recomendados e testados por criadores com as melhores ofertas e cupons da plataforma.',
  hero_banner_image: '/src/assets/images/hero_achados_1791805439218.jpg',
  hero_banner_cta: 'Explorar Catálogo',
  hero_banner_enabled: true,
  featured_section_title: '⭐ Destaques da Semana',
  featured_section_enabled: true,
  most_clicked_section_title: '🔥 Mais Clicados no TikTok Shop',
  most_clicked_section_enabled: true,
  recent_section_title: '✨ Lançamentos e Recentes',
  recent_section_enabled: true,
  items_per_section: 8,
  header_links: [
    { label: 'Início', url: '/' },
    { label: 'Catálogo', url: '/catalogo' },
    { label: 'Mais Clicados', url: '/catalogo?sort=popularity' },
    { label: 'Destaques', url: '/catalogo?featured=true' }
  ],
  footer_text: '© 2026 TokShop Achadinhos. Todos os direitos reservados. Não somos uma loja oficial do TikTok, apenas curadores afiliados autorizados.',
  affiliate_disclaimer: 'Transparência: Este site contém links de afiliado do TikTok Shop. Ao clicar e concluir uma compra na loja parceira, podemos receber uma comissão sem qualquer custo adicional para você. Os preços e estoques são definidos diretamente pelo TikTok Shop e seus vendedores parceiros.',
  social_links: {
    instagram: 'https://instagram.com/tokshop.achadinhos',
    tiktok: 'https://tiktok.com/@tokshop.achadinhos',
    whatsapp: 'https://wa.me/5511999999999',
    youtube: 'https://youtube.com'
  },
  seo_title: 'TokShop - Os Melhores Achadinhos e Afiliados do TikTok Shop',
  seo_description: 'Encontre os melhores produtos virais, eletrônicos, cosméticos e utilidades domésticas testados no TikTok com links de afiliado oficiais.',
  seo_keywords: 'achadinhos tiktok shop, produtos virais, afiliados tiktok, compras tiktok, gadgets, ofertas',
  contact_email: 'contato@tokshop.com.br'
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Eletrônicos & Gadgets',
    slug: 'eletronicos-gadgets',
    description: 'Fones, relógios inteligentes, projetores e acessórios tech que bombaram.',
    image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    icon: 'Smartphone',
    status: 'published',
    sort_order: 1,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'cat-2',
    name: 'Beleza & Cuidados',
    slug: 'beleza-cuidados',
    description: 'Skincare, maquiagem viral, massageadores faciais e cuidados pessoais.',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    icon: 'Sparkles',
    status: 'published',
    sort_order: 2,
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 28 * 86400000).toISOString()
  },
  {
    id: 'cat-3',
    name: 'Casa & Cozinha Inteligente',
    slug: 'casa-cozinha-inteligente',
    description: 'Utilitários práticos, organizadores e gadgets para facilitar sua rotina.',
    image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    icon: 'Home',
    status: 'published',
    sort_order: 3,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'cat-4',
    name: 'Moda & Acessórios',
    slug: 'moda-acessorios',
    description: 'Bolsas, óculos de sol, joias minimalistas e roupas da moda do TikTok.',
    image_url: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=600&q=80',
    icon: 'ShoppingBag',
    status: 'published',
    sort_order: 4,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'cat-5',
    name: 'Achadinhos Virais',
    slug: 'achadinhos-virais',
    description: 'Itens inovadores que alcançaram milhões de visualizações e você precisa ter.',
    image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    icon: 'Flame',
    status: 'published',
    sort_order: 5,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

const INITIAL_PRODUCTS: Product[] = [];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDbDir();
    this.data = this.loadData();
  }

  private ensureDbDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure defaults if missing keys
        return {
          products: Array.isArray(parsed.products) ? parsed.products : [],
          categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_CATEGORIES,
          clicks: Array.isArray(parsed.clicks) ? parsed.clicks : [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          users: parsed.users && parsed.users.length > 0 ? parsed.users : this.createInitialUsers(),
          activities: parsed.activities || this.createInitialActivities()
        };
      } catch (err) {
        console.error('Error reading db.json, creating initial state:', err);
      }
    }

    const initial: DatabaseSchema = {
      products: [],
      categories: INITIAL_CATEGORIES,
      clicks: [],
      settings: DEFAULT_SETTINGS,
      users: this.createInitialUsers(),
      activities: this.createInitialActivities()
    };
    this.saveDataDirect(initial);
    return initial;
  }

  private createInitialUsers(): AdminUser[] {
    return [
      {
        id: 'usr-admin-1',
        email: 'admin@tokshop.com',
        password_hash: hashPassword('admin123'),
        name: 'Administrador TokShop'
      }
    ];
  }

  private createInitialActivities(): ActivityLog[] {
    return [
      {
        id: 'act-1',
        user_email: 'admin@tokshop.com',
        action: 'Configuração da Loja',
        entity_type: 'settings',
        details: 'Loja TokShop pronta para cadastro de novos produtos.',
        created_at: new Date().toISOString()
      }
    ];
  }

  private createInitialClicks(): ClickEvent[] {
    return [];
  }

  private saveData() {
    this.saveDataDirect(this.data);
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  // --- Products ---
  getProducts(options?: {
    includeDeleted?: boolean;
    status?: 'published' | 'draft' | 'hidden';
    categoryId?: string;
    search?: string;
    featured?: boolean;
    sort?: 'popularity' | 'newest' | 'price_asc' | 'price_desc';
    limit?: number;
    offset?: number;
  }): { items: Product[]; total: number } {
    let list = this.data.products.filter(p => {
      if (!options?.includeDeleted && p.deleted_at) return false;
      if (options?.status && p.status !== options.status) return false;
      if (options?.categoryId && p.category_id !== options.categoryId) return false;
      if (options?.featured !== undefined && p.is_featured !== options.featured) return false;
      if (options?.search) {
        const s = options.search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(s);
        const matchDesc = p.description.toLowerCase().includes(s);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });

    // Sorting
    const sort = options?.sort || 'newest';
    if (sort === 'popularity') {
      list.sort((a, b) => b.clicks_count - a.clicks_count);
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'price_asc') {
      list.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    const total = list.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || list.length;
    const items = list.slice(offset, offset + limit);

    return { items, total };
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id && !p.deleted_at);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug && !p.deleted_at);
  }

  saveProduct(productData: Partial<Product> & { name: string; affiliate_url: string; category_id: string }): Product {
    const isNew = !productData.id;
    const id = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Unique slug generation
    let baseSlug = productData.slug ? generateSlug(productData.slug) : generateSlug(productData.name);
    if (!baseSlug) baseSlug = `produto-${Date.now().toString(36)}`;
    
    let uniqueSlug = baseSlug;
    let count = 1;
    while (this.data.products.some(p => p.slug === uniqueSlug && p.id !== id && !p.deleted_at)) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    const now = new Date().toISOString();
    let product: Product;

    if (isNew) {
      product = {
        id,
        name: productData.name.trim(),
        slug: uniqueSlug,
        description: productData.description || '',
        affiliate_url: productData.affiliate_url.trim(),
        source_product_id: productData.source_product_id || '',
        images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        price: typeof productData.price === 'number' && !isNaN(productData.price) ? productData.price : null,
        previous_price: typeof productData.previous_price === 'number' && !isNaN(productData.previous_price) ? productData.previous_price : null,
        category_id: productData.category_id,
        is_featured: Boolean(productData.is_featured),
        status: productData.status || 'published',
        clicks_count: 0,
        created_at: now,
        updated_at: now,
        published_at: productData.status === 'published' ? now : null
      };
      this.data.products.unshift(product);
    } else {
      const index = this.data.products.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Produto não encontrado para atualização.');
      }
      const existing = this.data.products[index];
      product = {
        ...existing,
        ...productData,
        id,
        name: productData.name ? productData.name.trim() : existing.name,
        slug: uniqueSlug,
        affiliate_url: productData.affiliate_url ? productData.affiliate_url.trim() : existing.affiliate_url,
        updated_at: now,
        published_at: productData.status === 'published' && !existing.published_at ? now : existing.published_at
      };
      this.data.products[index] = product;
    }

    this.saveData();
    return product;
  }

  deleteProduct(id: string, hardDelete: boolean = false): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    if (hardDelete) {
      this.data.products.splice(index, 1);
    } else {
      // Soft delete preserves click logs and history
      this.data.products[index].deleted_at = new Date().toISOString();
      this.data.products[index].status = 'hidden';
    }
    this.saveData();
    return true;
  }

  // --- Click Tracking ---
  recordClick(productId: string, metadata?: { source?: string; campaign?: string; referer?: string; user_agent?: string; session_id?: string }): { success: boolean; affiliate_url: string; clicks_count: number } {
    const product = this.data.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Produto inválido para rastreamento.');
    }

    // Increment click counter
    product.clicks_count = (product.clicks_count || 0) + 1;
    product.updated_at = new Date().toISOString();

    const clickEvent: ClickEvent = {
      id: `clk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      product_id: product.id,
      product_name: product.name,
      clicked_at: new Date().toISOString(),
      source: metadata?.source || 'direct',
      campaign: metadata?.campaign || 'general',
      referer: metadata?.referer || '',
      user_agent: metadata?.user_agent ? metadata.user_agent.slice(0, 150) : '',
      session_id: metadata?.session_id || ''
    };

    this.data.clicks.push(clickEvent);
    this.saveData();

    return {
      success: true,
      affiliate_url: product.affiliate_url,
      clicks_count: product.clicks_count
    };
  }

  getClicksMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 86400000;
    const thirtyDaysAgo = now.getTime() - 30 * 86400000;

    let clicksToday = 0;
    let clicks7Days = 0;
    let clicks30Days = 0;

    // Daily buckets for chart (last 14 days)
    const dailyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      dailyMap.set(key, 0);
    }

    for (const c of this.data.clicks) {
      const clickTime = new Date(c.clicked_at).getTime();
      if (clickTime >= todayStart) clicksToday++;
      if (clickTime >= sevenDaysAgo) clicks7Days++;
      if (clickTime >= thirtyDaysAgo) clicks30Days++;

      const cDate = new Date(c.clicked_at);
      const key = `${cDate.getDate().toString().padStart(2, '0')}/${(cDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    }

    const chartData = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    return {
      totalClicks: this.data.clicks.length,
      clicksToday,
      clicks7Days,
      clicks30Days,
      chartData
    };
  }

  // --- Categories ---
  getCategories(includeDeleted: boolean = false): Category[] {
    return this.data.categories
      .filter(c => includeDeleted || !c.deleted_at)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id && !c.deleted_at);
  }

  saveCategory(catData: Partial<Category> & { name: string }): Category {
    const isNew = !catData.id;
    const id = catData.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const slug = catData.slug ? generateSlug(catData.slug) : generateSlug(catData.name);
    const now = new Date().toISOString();

    let category: Category;
    if (isNew) {
      category = {
        id,
        name: catData.name.trim(),
        slug,
        description: catData.description || '',
        image_url: catData.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
        icon: catData.icon || 'Tag',
        status: catData.status || 'published',
        sort_order: catData.sort_order || (this.data.categories.length + 1),
        created_at: now,
        updated_at: now
      };
      this.data.categories.push(category);
    } else {
      const idx = this.data.categories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Categoria não encontrada.');
      const existing = this.data.categories[idx];
      category = {
        ...existing,
        ...catData,
        id,
        name: catData.name.trim(),
        slug,
        updated_at: now
      };
      this.data.categories[idx] = category;
    }

    this.saveData();
    return category;
  }

  deleteCategory(id: string, fallbackCategoryId?: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;

    // Reassign or unbind products associated with this category
    const defaultCat = fallbackCategoryId || (this.data.categories.find(c => c.id !== id && !c.deleted_at)?.id || 'cat-1');
    for (const p of this.data.products) {
      if (p.category_id === id) {
        p.category_id = defaultCat;
      }
    }

    this.data.categories[idx].deleted_at = new Date().toISOString();
    this.saveData();
    return true;
  }

  // --- Settings ---
  getSettings(): StoreSettings {
    return this.data.settings;
  }

  updateSettings(newSettings: Partial<StoreSettings>): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...newSettings
    };
    this.saveData();
    return this.data.settings;
  }

  resetSettings(): StoreSettings {
    this.data.settings = { ...DEFAULT_SETTINGS };
    this.saveData();
    return this.data.settings;
  }

  // --- Activities ---
  logActivity(action: string, entity_type: ActivityLog['entity_type'], details: string, user_email: string = 'admin@tokshop.com', entity_id?: string) {
    const log: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_email,
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString()
    };
    this.data.activities.unshift(log);
    if (this.data.activities.length > 200) {
      this.data.activities = this.data.activities.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  getActivities(limit: number = 50): ActivityLog[] {
    return this.data.activities.slice(0, limit);
  }

  // --- Users & Auth ---
  getUserByEmail(email: string): AdminUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserBySession(token: string): AdminUser | undefined {
    if (!token) return undefined;
    return this.data.users.find(u => u.session_token === token);
  }

  setSessionToken(userId: string, token: string | undefined): void {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.session_token = token;
      this.saveData();
    }
  }

  updateUserCredentials(userId: string, newEmail?: string, newPassword?: string, newName?: string): AdminUser {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('Usuário não encontrado.');

    if (newEmail) user.email = newEmail.toLowerCase().trim();
    if (newName) user.name = newName.trim();
    if (newPassword) user.password_hash = hashPassword(newPassword);

    this.saveData();
    return user;
  }
}

export const db = new DatabaseManager();
