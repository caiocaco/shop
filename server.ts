import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { db, hashPassword, generateSlug, Product } from './src/server/db.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Anti open-redirect validator
function isValidRedirectUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.tokshop_admin_session || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login para continuar.' });
    return;
  }

  const user = db.getUserBySession(token);
  if (!user) {
    res.status(401).json({ error: 'Sessão expirada ou inválida.' });
    return;
  }

  (req as any).adminUser = user;
  next();
}

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

// Store configuration
app.get('/api/public/config', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({
    settings: {
      store_name: settings.store_name,
      tagline: settings.tagline,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      button_color: settings.button_color,
      background_color: settings.background_color,
      text_color: settings.text_color,
      card_radius: settings.card_radius,
      hero_banner_title: settings.hero_banner_title,
      hero_banner_subtitle: settings.hero_banner_subtitle,
      hero_banner_image: settings.hero_banner_image,
      hero_banner_cta: settings.hero_banner_cta,
      hero_banner_enabled: settings.hero_banner_enabled,
      featured_section_title: settings.featured_section_title,
      featured_section_enabled: settings.featured_section_enabled,
      most_clicked_section_title: settings.most_clicked_section_title,
      most_clicked_section_enabled: settings.most_clicked_section_enabled,
      recent_section_title: settings.recent_section_title,
      recent_section_enabled: settings.recent_section_enabled,
      items_per_section: settings.items_per_section,
      header_links: settings.header_links,
      footer_text: settings.footer_text,
      affiliate_disclaimer: settings.affiliate_disclaimer,
      social_links: settings.social_links,
      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      seo_keywords: settings.seo_keywords,
      contact_email: settings.contact_email
    }
  });
});

// Categories public list
app.get('/api/public/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories().filter(c => c.status === 'published');
  res.json({ categories });
});

// Products catalog
app.get('/api/public/products', (req: Request, res: Response) => {
  const { category, search, featured, sort, limit = '24', page = '1' } = req.query;

  let categoryId: string | undefined;
  if (category && typeof category === 'string') {
    const allCategories = db.getCategories();
    const found = allCategories.find(c => c.slug === category || c.id === category);
    if (found) categoryId = found.id;
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24));
  const offset = (pageNum - 1) * limitNum;

  const result = db.getProducts({
    status: 'published',
    categoryId,
    search: typeof search === 'string' ? search : undefined,
    featured: featured === 'true' ? true : undefined,
    sort: (sort as any) || 'newest',
    limit: limitNum,
    offset
  });

  res.json({
    products: result.items,
    pagination: {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(result.total / limitNum)
    }
  });
});

// Single product details
app.get('/api/public/products/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = db.getProductBySlug(slug);

  if (!product || product.status !== 'published') {
    res.status(404).json({ error: 'Produto não encontrado ou indisponível.' });
    return;
  }

  const category = db.getCategoryById(product.category_id);

  // Fetch up to 4 related products from the same category
  const relatedResult = db.getProducts({
    status: 'published',
    categoryId: product.category_id,
    limit: 5
  });
  const related = relatedResult.items.filter(p => p.id !== product.id).slice(0, 4);

  res.json({
    product,
    category,
    related
  });
});

// Real Click tracking endpoint with anti-abuse debounce
const clickCooldownMap = new Map<string, number>();

app.post('/api/track-click', (req: Request, res: Response) => {
  const { productId, source, campaign, referer } = req.body;

  if (!productId || typeof productId !== 'string') {
    res.status(400).json({ error: 'productId é obrigatório.' });
    return;
  }

  const product = db.getProductById(productId);
  if (!product) {
    res.status(404).json({ error: 'Produto não encontrado.' });
    return;
  }

  // Ensure affiliate link is safe
  if (!isValidRedirectUrl(product.affiliate_url)) {
    res.status(400).json({ error: 'Link de afiliado inválido cadastrado.' });
    return;
  }

  // Soft anti-spam filter (debounce by IP + Product ID within 3 seconds)
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const debounceKey = `${clientIp}-${productId}`;
  const now = Date.now();
  const lastClick = clickCooldownMap.get(debounceKey) || 0;

  if (now - lastClick > 3000) {
    clickCooldownMap.set(debounceKey, now);
    try {
      db.recordClick(productId, {
        source: typeof source === 'string' ? source : 'product_card',
        campaign: typeof campaign === 'string' ? campaign : 'organic',
        referer: typeof referer === 'string' ? referer : (req.headers.referer || ''),
        user_agent: req.headers['user-agent'],
        session_id: req.cookies?.tokshop_anon_sid || ''
      });
    } catch (err) {
      console.error('Click logging error:', err);
    }
  }

  res.json({
    success: true,
    affiliate_url: product.affiliate_url,
    message: 'Clique registrado com sucesso'
  });
});

// Direct friendly redirect route: /r/:id
app.get('/r/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = db.getProductById(id);

  if (!product || !isValidRedirectUrl(product.affiliate_url)) {
    res.status(404).send('Link não encontrado ou inválido.');
    return;
  }

  try {
    db.recordClick(product.id, {
      source: 'direct_redirect_link',
      campaign: 'quick_link',
      referer: req.headers.referer || '',
      user_agent: req.headers['user-agent']
    });
  } catch (err) {
    console.error('Direct link track error:', err);
  }

  res.redirect(302, product.affiliate_url);
});

// Sitemap.xml & Robots.txt for SEO
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: /sitemap.xml\n");
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const products = db.getProducts({ status: 'published' }).items;
  const categories = db.getCategories().filter(c => c.status === 'published');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>/catalogo</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${categories.map(c => `  <url>
    <loc>/catalogo?category=${encodeURIComponent(c.slug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
  ${products.map(p => `  <url>
    <loc>/produto/${encodeURIComponent(p.slug)}</loc>
    <lastmod>${p.updated_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user || user.password_hash !== hashPassword(password)) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    return;
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  db.setSessionToken(user.id, sessionToken);

  res.cookie('tokshop_admin_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000 // 30 days
  });

  db.logActivity('Login Administrativo', 'auth', `Usuário ${user.email} realizou login no painel.`, user.email);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      sessionToken
    }
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = req.cookies?.tokshop_admin_session || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const user = db.getUserBySession(token);
  if (!user) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.tokshop_admin_session || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    const user = db.getUserBySession(token);
    if (user) {
      db.setSessionToken(user.id, undefined);
      db.logActivity('Logout Administrativo', 'auth', `Usuário ${user.email} desconectou-se do painel.`, user.email);
    }
  }

  res.clearCookie('tokshop_admin_session');
  res.json({ success: true });
});

app.post('/api/auth/update-profile', requireAdmin, (req: Request, res: Response) => {
  const user = (req as any).adminUser;
  const { email, name, currentPassword, newPassword } = req.body;

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: 'Informe a senha atual para alterar para uma nova senha.' });
      return;
    }
    if (user.password_hash !== hashPassword(currentPassword)) {
      res.status(400).json({ error: 'Senha atual incorreta.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
  }

  try {
    const updated = db.updateUserCredentials(user.id, email, newPassword, name);
    db.logActivity('Perfil Atualizado', 'auth', `Credenciais de ${updated.email} foram atualizadas.`, updated.email);

    res.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao atualizar perfil.' });
  }
});

// ==========================================
// 3. ADMIN PRODUCT IMPORTER & VALIDATOR
// ==========================================

app.post('/api/admin/products/import-preview', requireAdmin, async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    res.status(400).json({ error: 'Cole um link válido para importar.' });
    return;
  }

  const trimmedUrl = url.trim();
  if (!isValidRedirectUrl(trimmedUrl)) {
    res.status(400).json({ error: 'URL inválida. O link deve começar com http:// ou https://' });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    res.status(400).json({ error: 'Formato de URL inválido.' });
    return;
  }

  // Extract candidate product ID or parameters from URL
  let extractedId = '';
  const pathname = parsedUrl.pathname;
  const match = pathname.match(/product\/(\d+)/i) || pathname.match(/\/(\d{10,})/);
  if (match) {
    extractedId = match[1];
  } else if (parsedUrl.searchParams.get('product_id')) {
    extractedId = parsedUrl.searchParams.get('product_id') || '';
  } else if (parsedUrl.searchParams.get('item_id')) {
    extractedId = parsedUrl.searchParams.get('item_id') || '';
  }

  // Check duplicate product
  if (extractedId) {
    const existing = db.getProducts({ includeDeleted: false }).items.find(
      p => p.source_product_id === extractedId || p.affiliate_url === trimmedUrl
    );
    if (existing) {
      res.json({
        duplicateWarning: true,
        existingProduct: { id: existing.id, name: existing.name, slug: existing.slug },
        message: `Atenção: Já existe um produto cadastrado com este identificador ("${existing.name}").`
      });
      return;
    }
  }

  // Attempt safe fetch with timeout to extract metadata
  let title = '';
  let description = '';
  let imageUrl = '';
  let price: number | null = null;
  let extractionSuccess = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(trimmedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow'
    });
    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();

      // Extract Open Graph tags
      const ogTitleMatch = html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) ||
                           html.match(/<title>([^<]+)<\/title>/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        title = ogTitleMatch[1].replace(/ - TikTok Shop.*$/i, '').replace(/ \| TikTok.*$/i, '').trim();
      }

      const ogDescMatch = html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i) ||
                          html.match(/<meta name=["']description["'] content=["']([^"']+)["']/i);
      if (ogDescMatch && ogDescMatch[1]) {
        description = ogDescMatch[1].trim();
      }

      const ogImageMatch = html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        imageUrl = ogImageMatch[1].trim();
      }

      // Check price tag if present
      const priceMatch = html.match(/["']price["']\s*:\s*["']?([\d.,]+)["']?/i);
      if (priceMatch && priceMatch[1]) {
        const parsedP = parseFloat(priceMatch[1].replace(',', '.'));
        if (!isNaN(parsedP)) price = parsedP;
      }

      if (title) extractionSuccess = true;
    }
  } catch {
    // Platform anti-scraping / network challenge / timeout expected on TikTok Shop
    extractionSuccess = false;
  }

  // Categories helper
  const categories = db.getCategories();
  const defaultCategory = categories[0]?.id || 'cat-1';

  // Smart heuristic if extraction was blocked by TikTok's WAF / anti-bot
  const defaultTitle = title || (extractedId ? `Produto TikTok Shop #${extractedId}` : '');
  const candidateSlug = defaultTitle ? generateSlug(defaultTitle) : '';

  res.json({
    success: true,
    extractionSuccess,
    notice: extractionSuccess
      ? 'Dados básicos extraídos com sucesso do link! Revise e ajuste conforme necessário antes de publicar.'
      : 'Link analisado com sucesso! Como as páginas do TikTok Shop possuem proteções contra robôs de extração, seus parâmetros e link de afiliado foram 100% preservados. Preencha ou confirme o título, imagem e valor abaixo para publicar.',
    preview: {
      name: defaultTitle,
      slug: candidateSlug,
      description: description || 'Produto em alta no TikTok Shop com ótimas recomendações. Clique no botão para conferir detalhes, variações e avaliações completas.',
      affiliate_url: trimmedUrl,
      source_product_id: extractedId || `tt-${Date.now().toString(36)}`,
      images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      price: price,
      previous_price: price ? Math.round(price * 1.35 * 100) / 100 : null,
      category_id: defaultCategory,
      is_featured: false,
      status: 'published'
    }
  });
});

// ==========================================
// 4. ADMIN PRODUCTS CRUD
// ==========================================

app.get('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  const { status, category, search, sort = 'newest' } = req.query;

  const result = db.getProducts({
    includeDeleted: false,
    status: (status as any) || undefined,
    categoryId: typeof category === 'string' ? category : undefined,
    search: typeof search === 'string' ? search : undefined,
    sort: (sort as any) || 'newest'
  });

  res.json({ products: result.items, total: result.total });
});

app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { name, affiliate_url, category_id } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'O nome do produto é obrigatório.' });
    return;
  }
  if (!affiliate_url || !affiliate_url.trim()) {
    res.status(400).json({ error: 'O link de afiliado é obrigatório.' });
    return;
  }
  if (!isValidRedirectUrl(affiliate_url.trim())) {
    res.status(400).json({ error: 'O link de afiliado deve ser uma URL válida (http/https).' });
    return;
  }
  if (!category_id) {
    res.status(400).json({ error: 'Selecione uma categoria válida.' });
    return;
  }

  try {
    const product = db.saveProduct(req.body);
    db.logActivity('Cadastro de Produto', 'product', `Produto "${product.name}" cadastrado com status ${product.status}.`, admin.email, product.id);

    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao cadastrar produto.' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { id } = req.params;

  try {
    const product = db.saveProduct({ ...req.body, id });
    db.logActivity('Edição de Produto', 'product', `Produto "${product.name}" atualizado.`, admin.email, product.id);

    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao atualizar produto.' });
  }
});

app.patch('/api/admin/products/:id/status', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { id } = req.params;
  const { status } = req.body;

  if (!['published', 'draft', 'hidden'].includes(status)) {
    res.status(400).json({ error: 'Status inválido. Escolha published, draft ou hidden.' });
    return;
  }

  const existing = db.getProductById(id);
  if (!existing) {
    res.status(404).json({ error: 'Produto não encontrado.' });
    return;
  }

  const updated = db.saveProduct({ ...existing, status });
  db.logActivity('Alteração de Status', 'product', `Status de "${updated.name}" alterado para ${status}.`, admin.email, updated.id);

  res.json({ success: true, product: updated });
});

app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { id } = req.params;
  const existing = db.getProductById(id);

  if (!existing) {
    res.status(404).json({ error: 'Produto não encontrado.' });
    return;
  }

  db.deleteProduct(id, false); // soft delete preserves analytics
  db.logActivity('Exclusão de Produto', 'product', `Produto "${existing.name}" foi arquivado/excluído logicamente.`, admin.email, id);

  res.json({ success: true, message: 'Produto removido com sucesso. Os dados de cliques foram preservados no histórico.' });
});

app.post('/api/admin/products/bulk-delete', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'Nenhum ID de produto fornecido para exclusão.' });
    return;
  }

  let removedCount = 0;
  for (const id of ids) {
    const existing = db.getProductById(id);
    if (existing) {
      db.deleteProduct(id, false);
      removedCount++;
    }
  }

  db.logActivity('Exclusão em Lote', 'product', `${removedCount} produto(s) foram excluídos pelo painel.`, admin.email);

  res.json({ success: true, count: removedCount, message: `${removedCount} produto(s) removido(s) com sucesso.` });
});

// ==========================================
// 5. ADMIN CATEGORIES CRUD
// ==========================================

app.get('/api/admin/categories', requireAdmin, (_req: Request, res: Response) => {
  const categories = db.getCategories();
  const products = db.getProducts({ includeDeleted: false }).items;

  // Append product count to each category
  const listWithCount = categories.map(cat => ({
    ...cat,
    products_count: products.filter(p => p.category_id === cat.id).length
  }));

  res.json({ categories: listWithCount });
});

app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
    return;
  }

  try {
    const category = db.saveCategory(req.body);
    db.logActivity('Criação de Categoria', 'category', `Categoria "${category.name}" criada.`, admin.email, category.id);

    res.json({ success: true, category });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao criar categoria.' });
  }
});

app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { id } = req.params;

  try {
    const category = db.saveCategory({ ...req.body, id });
    db.logActivity('Edição de Categoria', 'category', `Categoria "${category.name}" atualizada.`, admin.email, category.id);

    res.json({ success: true, category });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao atualizar categoria.' });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { id } = req.params;
  const existing = db.getCategoryById(id);

  if (!existing) {
    res.status(404).json({ error: 'Categoria não encontrada.' });
    return;
  }

  db.deleteCategory(id);
  db.logActivity('Exclusão de Categoria', 'category', `Categoria "${existing.name}" foi removida.`, admin.email, id);

  res.json({ success: true, message: 'Categoria excluída com sucesso.' });
});

// ==========================================
// 6. ADMIN DASHBOARD & ANALYTICS
// ==========================================

app.get('/api/admin/dashboard', requireAdmin, (_req: Request, res: Response) => {
  const allProducts = db.getProducts({ includeDeleted: false }).items;
  const totalProducts = allProducts.length;
  const publishedProducts = allProducts.filter(p => p.status === 'published').length;
  const draftOrHiddenProducts = allProducts.filter(p => p.status !== 'published').length;

  const metrics = db.getClicksMetrics();

  // Top clicked products
  const topClicked = [...allProducts]
    .sort((a, b) => b.clicks_count - a.clicks_count)
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] || '',
      price: p.price,
      clicks_count: p.clicks_count,
      status: p.status
    }));

  res.json({
    stats: {
      totalProducts,
      publishedProducts,
      draftOrHiddenProducts,
      totalClicks: metrics.totalClicks,
      clicksToday: metrics.clicksToday,
      clicks7Days: metrics.clicks7Days,
      clicks30Days: metrics.clicks30Days
    },
    chartData: metrics.chartData,
    topClicked
  });
});

// ==========================================
// 7. ADMIN SETTINGS & ACTIVITIES
// ==========================================

app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  res.json({ settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  try {
    const updated = db.updateSettings(req.body);
    db.logActivity('Personalização da Loja', 'settings', 'Configurações de identidade visual e layout atualizadas.', admin.email);

    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao salvar configurações.' });
  }
});

app.post('/api/admin/settings/reset', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const reset = db.resetSettings();
  db.logActivity('Restauração de Padrões', 'settings', 'Configurações visuais restauradas para o padrão.', admin.email);

  res.json({ success: true, settings: reset });
});

app.get('/api/admin/activities', requireAdmin, (req: Request, res: Response) => {
  const activities = db.getActivities(50);
  res.json({ activities });
});

// ==========================================
// VITE DEV SERVER OR STATIC SERVING
// ==========================================

async function startServer() {
  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TokShop Server rodando na porta ${PORT} (${isDev ? 'Modo Desenvolvimento' : 'Produção'})`);
  });
}

startServer().catch(err => {
  console.error('Falha ao iniciar servidor TokShop:', err);
  process.exit(1);
});
