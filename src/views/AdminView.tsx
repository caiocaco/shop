import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Product, Category, StoreSettings, DashboardMetrics, ActivityLog } from '../types.ts';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Layers,
  Palette,
  Settings,
  History,
  UserCheck,
  LogOut,
  Flame,
  ExternalLink,
  Search,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Image,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Save,
  RotateCcw,
  Sliders,
  DollarSign,
  Link,
  ShoppingBag,
  Lock,
  Mail,
  Key,
  X
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { settings, categories, refreshSettings, refreshCategories, showToast, navigate } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@tokshop.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'create_product' | 'products' | 'categories' | 'customization' | 'general' | 'activities' | 'account'
  >('dashboard');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Products Tab State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productFilterStatus, setProductFilterStatus] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [quickRemoveModalOpen, setQuickRemoveModalOpen] = useState(false);
  const [quickRemoveSelectedId, setQuickRemoveSelectedId] = useState<string>('');
  const [quickRemoveSearch, setQuickRemoveSearch] = useState<string>('');

  // Create Product / Importer State
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<{ text: string; success: boolean } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const [formProduct, setFormProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    affiliate_url: '',
    source_product_id: '',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    price: null,
    previous_price: null,
    category_id: categories[0]?.id || 'cat-1',
    is_featured: false,
    status: 'published'
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Categories Tab State
  const [categoryModal, setCategoryModal] = useState<Partial<Category> | null>(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Customization Form State
  const [customForm, setCustomForm] = useState<StoreSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Activities Tab State
  const [activitiesList, setActivitiesList] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Account Form State
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountSubmitting, setAccountSubmitting] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const d = await res.json();
        if (d.authenticated) {
          setIsAuthenticated(true);
          setCurrentUser(d.user);
          setAccountName(d.user.name || '');
          setAccountEmail(d.user.email || '');
          return;
        }
      }
      setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setAccountName(data.user.name || '');
        setAccountEmail(data.user.email || '');
        showToast('Login realizado com sucesso!', 'success');
      } else {
        setLoginError(data.error || 'Credenciais inválidas.');
      }
    } catch {
      setLoginError('Erro de conexão ao efetuar login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('Você saiu do painel.', 'info');
  };

  // Load section-specific data when activeTab changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'customization' || activeTab === 'general') {
      setCustomForm(settings);
    } else if (activeTab === 'activities') {
      loadActivities();
    }
  }, [activeTab, isAuthenticated, settings]);

  const loadDashboard = async () => {
    setDashboardLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const d = await res.json();
        setDashboardData(d);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const d = await res.json();
        setProductsList(d.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch('/api/admin/activities');
      if (res.ok) {
        const d = await res.json();
        setActivitiesList(d.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // --- TikTok Product Importer ---
  const handleImportUrl = async () => {
    if (!importUrl.trim()) {
      showToast('Por favor, cole um link de produto ou afiliado.', 'error');
      return;
    }
    setImporting(true);
    setImportNotice(null);
    setDuplicateWarning(null);

    try {
      const res = await fetch('/api/admin/products/import-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();

      if (data.duplicateWarning) {
        setDuplicateWarning(data.message);
        showToast(data.message, 'error');
        return;
      }

      if (data.success && data.preview) {
        setFormProduct(prev => ({
          ...prev,
          ...data.preview,
          category_id: prev.category_id || data.preview.category_id || categories[0]?.id || 'cat-1'
        }));
        setImportNotice({
          text: data.notice,
          success: data.extractionSuccess
        });
        showToast('Link analisado com sucesso!', 'success');
      } else {
        showToast(data.error || 'Não foi possível processar o link.', 'error');
      }
    } catch {
      showToast('Erro ao contatar o analisador de links.', 'error');
    } finally {
      setImporting(false);
    }
  };

  // --- Save / Publish Product ---
  const handleSaveProduct = async (status: 'published' | 'draft') => {
    if (!formProduct.name?.trim()) {
      showToast('O nome do produto é obrigatório.', 'error');
      return;
    }
    if (!formProduct.affiliate_url?.trim()) {
      showToast('O link de afiliado é obrigatório.', 'error');
      return;
    }

    setSubmittingProduct(true);
    try {
      const payload = {
        ...formProduct,
        status,
        price: formProduct.price ? Number(formProduct.price) : null,
        previous_price: formProduct.previous_price ? Number(formProduct.previous_price) : null
      };

      const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (status === 'published') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          showToast('Produto publicado com sucesso!', 'success');
        } else {
          showToast('Produto salvo como rascunho.', 'info');
        }

        // Reset form
        setFormProduct({
          name: '',
          slug: '',
          description: '',
          affiliate_url: '',
          source_product_id: '',
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          price: null,
          previous_price: null,
          category_id: categories[0]?.id || 'cat-1',
          is_featured: false,
          status: 'published'
        });
        setImportUrl('');
        setImportNotice(null);
        setEditingProduct(null);

        // Switch to products list
        setActiveTab('products');
        loadProducts();
      } else {
        showToast(data.error || 'Erro ao salvar produto.', 'error');
      }
    } catch {
      showToast('Falha na comunicação com o servidor.', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // --- Change Product Status ---
  const handleToggleProductStatus = async (product: Product, newStatus: 'published' | 'hidden' | 'draft') => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Status alterado para ${newStatus}.`, 'success');
        loadProducts();
      }
    } catch {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  // --- Delete Product ---
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Produto removido com sucesso.', 'info');
        setDeleteConfirmId(null);
        setSelectedProductIds(prev => prev.filter(item => item !== id));
        if (quickRemoveSelectedId === id) setQuickRemoveSelectedId('');
        loadProducts();
      }
    } catch {
      showToast('Erro ao remover produto.', 'error');
    }
  };

  // --- Bulk Selection & Deletion (Sem Link) ---
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = (products: Product[]) => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedProductIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`${data.count} produto(s) removido(s) com sucesso.`, 'info');
        setSelectedProductIds([]);
        setBulkDeleteConfirm(false);
        loadProducts();
      } else {
        showToast(data.error || 'Erro ao remover produtos.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao remover produtos.', 'error');
    }
  };

  // --- Save Category ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryModal?.name?.trim()) {
      showToast('Nome da categoria é obrigatório.', 'error');
      return;
    }

    setCategorySubmitting(true);
    try {
      const endpoint = categoryModal.id ? `/api/admin/categories/${categoryModal.id}` : '/api/admin/categories';
      const method = categoryModal.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryModal)
      });
      if (res.ok) {
        showToast('Categoria salva com sucesso!', 'success');
        setCategoryModal(null);
        refreshCategories();
      } else {
        const d = await res.json();
        showToast(d.error || 'Erro ao salvar categoria.', 'error');
      }
    } catch {
      showToast('Erro ao comunicar com o servidor.', 'error');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os produtos serão mantidos e realocados para uma categoria padrão.')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Categoria removida com sucesso.', 'info');
        refreshCategories();
      }
    } catch {
      showToast('Erro ao excluir categoria.', 'error');
    }
  };

  // --- Save Customization Settings ---
  const handleSaveCustomization = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customForm)
      });
      if (res.ok) {
        showToast('Personalização salva e aplicada com sucesso!', 'success');
        await refreshSettings();
      } else {
        showToast('Erro ao salvar personalização.', 'error');
      }
    } catch {
      showToast('Erro ao conectar com o servidor.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('Deseja restaurar todas as configurações visuais para o padrão? Seus produtos não serão afetados.')) return;
    try {
      const res = await fetch('/api/admin/settings/reset', { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setCustomForm(d.settings);
        await refreshSettings();
        showToast('Configurações restauradas com sucesso!', 'info');
      }
    } catch {
      showToast('Erro ao restaurar padrões.', 'error');
    }
  };

  // --- Account Profile Save ---
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSubmitting(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName,
          email: accountEmail,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setCurrentPassword('');
        setNewPassword('');
        showToast('Perfil administrativo atualizado com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao atualizar perfil.', 'error');
      }
    } catch {
      showToast('Falha ao atualizar dados.', 'error');
    } finally {
      setAccountSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (if not authenticated)
  // ----------------------------------------------------
  if (isAuthenticated === false) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-100">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: settings.primary_color || '#7c3aed' }}
            >
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Painel Administrativo</h1>
            <p className="text-xs text-slate-500">
              Autenticação segura para gerenciamento da loja {settings.store_name}
            </p>
          </div>

          {/* Quick Credential Helper Banner */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Credenciais Padrão Pré-configuradas:
            </span>
            <div className="text-purple-700 font-mono text-[11px] pt-1">
              E-mail: <strong>admin@tokshop.com</strong>
              <br />
              Senha: <strong>admin123</strong>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@tokshop.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-purple-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-purple-600"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:brightness-105 active:scale-98 cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: settings.button_color || '#7c3aed' }}
            >
              {loginLoading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-purple-600 font-semibold cursor-pointer"
            >
              ← Voltar para a loja pública
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD LAYOUT
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 bg-black shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: settings.primary_color || '#f59e0b' }}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-extrabold text-sm text-white block truncate max-w-[130px]">
                  {settings.store_name}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Painel Admin
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Dashboard</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setActiveTab('create_product');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'create_product' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>2. Cadastrar Produto</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'products' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>3. Produtos Cadastrados</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'categories' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>4. Categorias</span>
            </button>

            <button
              onClick={() => setActiveTab('customization')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'customization' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>5. Personalização do Site</span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'general' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>6. Configurações Gerais</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'activities' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <History className="w-4 h-4" />
              <span>7. Atividades</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'account' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>8. Minha Conta</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Loja Pública</span>
            </span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>9. Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {/* ========================================================
            TAB 1: DASHBOARD
            ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Dashboard de Desempenho
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Métricas reais calculadas diretamente do banco de dados persistente.
                </p>
              </div>
              <button
                onClick={loadDashboard}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar</span>
              </button>
            </div>

            {/* Disclaimer box as required by prompt */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de Transparência sobre Métricas: </strong>
                Estes dados representam <strong>cliques e intenções de compra direcionadas ao TikTok Shop</strong>. Como o checkout e a compensação ocorrem externamente na plataforma do TikTok, cliques não constituem garantia de vendas confirmadas ou comissões recebidas.
              </div>
            </div>

            {/* Indicator Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Produtos</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {dashboardData?.stats.totalProducts ?? '...'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {dashboardData?.stats.publishedProducts} publicados • {dashboardData?.stats.draftOrHiddenProducts} rascunhos/ocultos
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Cliques</span>
                <div className="text-2xl sm:text-3xl font-black text-purple-700">
                  {dashboardData?.stats.totalClicks ?? '...'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Acumulado histórico de cliques
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cliques Hoje</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center gap-2">
                  <span>{dashboardData?.stats.clicksToday ?? '...'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Hoje</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Últimas 24 horas
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Últimos 7 e 30 Dias</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {dashboardData?.stats.clicks7Days ?? '...'}
                </div>
                <div className="text-[11px] text-slate-500">
                  7 dias: {dashboardData?.stats.clicks7Days} • 30 dias: {dashboardData?.stats.clicks30Days}
                </div>
              </div>
            </div>

            {/* Daily Click Evolution Chart (SVG) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Evolução Diária de Cliques (Últimos 14 Dias)
                  </h3>
                  <p className="text-xs text-slate-400">Acompanhe os picos de tráfego enviados ao TikTok Shop</p>
                </div>
              </div>

              {dashboardData?.chartData && dashboardData.chartData.length > 0 ? (
                <div className="pt-4">
                  <div className="h-48 flex items-end gap-2 sm:gap-4 px-2 border-b border-slate-200">
                    {dashboardData.chartData.map((d, idx) => {
                      const max = Math.max(...dashboardData.chartData.map(c => c.count), 1);
                      const heightPercent = Math.max(8, Math.round((d.count / max) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-20">
                            {d.count} cliques em {d.date}
                          </div>
                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-purple-500 group-hover:bg-purple-600 rounded-t-lg transition-all"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold truncate max-w-full">
                            {d.date.split('/')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  Nenhum dado registrado para exibir no gráfico.
                </div>
              )}
            </div>

            {/* Top Clicked Products Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    Top Produtos Mais Clicados
                  </h3>
                  <p className="text-xs text-slate-400">Ranking dos achadinhos de maior conversão de interesse</p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  Ver todos os produtos →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-6">Posição</th>
                      <th className="py-3 px-6">Produto</th>
                      <th className="py-3 px-6">Preço</th>
                      <th className="py-3 px-6">Cliques Reais</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {dashboardData?.topClicked?.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-6 font-bold text-slate-900">#{idx + 1}</td>
                        <td className="py-3 px-6 flex items-center gap-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=60&q=80'}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <span className="font-bold text-slate-900 truncate max-w-xs">{p.name}</span>
                        </td>
                        <td className="py-3 px-6 font-semibold">
                          {p.price ? `R$ ${p.price.toFixed(2)}` : 'Preço Dinâmico'}
                        </td>
                        <td className="py-3 px-6">
                          <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                            <Flame className="w-3 h-3 fill-orange-500" />
                            {p.clicks_count}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status === 'published' ? 'Publicado' : 'Oculto'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: CADASTRAR PRODUTO (IMPORTER & EDIT FORM)
            ======================================================== */}
        {activeTab === 'create_product' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Produto com Link de Afiliado'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cole o link de afiliado do TikTok Shop para analisar os parâmetros ou preencha os dados manualmente.
              </p>
            </div>

            {/* Importer Section */}
            {!editingProduct && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Link className="w-4 h-4 text-purple-600" />
                  <span>Importar a partir do Link TikTok Shop</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="https://shop.tiktok.com/view/product/... ou link curto de afiliado"
                    className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={handleImportUrl}
                    disabled={importing}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {importing ? 'Analisando Link...' : 'Importar Produto'}
                  </button>
                </div>

                {importNotice && (
                  <div
                    className={`p-4 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 ${
                      importNotice.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-purple-50 text-purple-900 border border-purple-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
                    <span>{importNotice.text}</span>
                  </div>
                )}

                {duplicateWarning && (
                  <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}
              </div>
            )}

            {/* Product Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Fields */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Informações do Produto
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formProduct.name || ''}
                      onChange={e => setFormProduct({ ...formProduct, name: e.target.value })}
                      placeholder="Ex: Mini Projetor Portátil Smart 4K Android"
                      className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-purple-600"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Slug da URL Amigável
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">/produto/</span>
                      <input
                        type="text"
                        value={formProduct.slug || ''}
                        onChange={e => setFormProduct({ ...formProduct, slug: e.target.value })}
                        placeholder="mini-projetor-portatil-smart"
                        className="flex-1 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Affiliate Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Link de Afiliado Original TikTok Shop *
                    </label>
                    <input
                      type="url"
                      required
                      value={formProduct.affiliate_url || ''}
                      onChange={e => setFormProduct({ ...formProduct, affiliate_url: e.target.value })}
                      placeholder="https://shop.tiktok.com/view/product/... ou link com código de afiliado"
                      className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600 font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Este link será acionado quando o usuário clicar no botão de compra. Seus parâmetros de rastreamento são 100% mantidos.
                    </span>
                  </div>

                  {/* Category & Prices */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formProduct.category_id || categories[0]?.id}
                        onChange={e => setFormProduct({ ...formProduct, category_id: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preço Atual (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formProduct.price ?? ''}
                        onChange={e =>
                          setFormProduct({
                            ...formProduct,
                            price: e.target.value === '' ? null : parseFloat(e.target.value)
                          })
                        }
                        placeholder="Ex: 89.90 (ou vazio)"
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preço Anterior (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formProduct.previous_price ?? ''}
                        onChange={e =>
                          setFormProduct({
                            ...formProduct,
                            previous_price: e.target.value === '' ? null : parseFloat(e.target.value)
                          })
                        }
                        placeholder="Ex: 149.90 (ou vazio)"
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      URL da Imagem Principal
                    </label>
                    <input
                      type="url"
                      value={formProduct.images?.[0] || ''}
                      onChange={e => setFormProduct({ ...formProduct, images: [e.target.value] })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Descrição do Produto
                    </label>
                    <textarea
                      rows={4}
                      value={formProduct.description || ''}
                      onChange={e => setFormProduct({ ...formProduct, description: e.target.value })}
                      placeholder="Descreva os pontos fortes, benefícios e características virais do produto..."
                      className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600"
                    />
                  </div>

                  {/* Featured Toggle */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(formProduct.is_featured)}
                        onChange={e => setFormProduct({ ...formProduct, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded-md text-purple-600"
                      />
                      <span>Destacar este produto na página inicial</span>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={submittingProduct}
                    onClick={() => handleSaveProduct('draft')}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                  >
                    Salvar como Rascunho
                  </button>

                  <button
                    type="button"
                    disabled={submittingProduct}
                    onClick={() => handleSaveProduct('published')}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: settings.button_color || '#7c3aed' }}
                  >
                    {submittingProduct ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Publicar Produto'}
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="lg:col-span-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prévia em Tempo Real
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative">
                    <img
                      src={
                        formProduct.images?.[0] ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
                      }
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                    {formProduct.is_featured && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold uppercase">
                      {categories.find(c => c.id === formProduct.category_id)?.name || 'Categoria'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {formProduct.name || 'Nome do produto aparecerá aqui'}
                    </h4>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {formProduct.price ? (
                        <span className="text-sm font-extrabold text-slate-900">
                          R$ {Number(formProduct.price).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-purple-700">
                          Preço no TikTok Shop
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] bg-purple-600 text-white font-bold px-2.5 py-1 rounded-lg">
                      Ver no TikTok Shop
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: PRODUTOS CADASTRADOS (TABLE & ACTIONS)
            ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Gerenciamento de Produtos
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Visualize, edite ou remova produtos diretamente da sua vitrine sem precisar do link original.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Dedicated button to remove products without needing link */}
                <button
                  type="button"
                  onClick={() => {
                    setQuickRemoveSearch('');
                    setQuickRemoveSelectedId('');
                    setQuickRemoveModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Remover Produto (Sem Link)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormProduct({
                      name: '',
                      slug: '',
                      description: '',
                      affiliate_url: '',
                      source_product_id: '',
                      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
                      price: null,
                      previous_price: null,
                      category_id: categories[0]?.id || 'cat-1',
                      is_featured: false,
                      status: 'published'
                    });
                    setActiveTab('create_product');
                  }}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>
            </div>

            {/* Explanatory helper box about removing products without needing links */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Remoção Simplificada: </strong>
                  Para remover qualquer produto cadastrado, você não precisa ter nem abrir o link dele. Basta marcar os produtos na tabela abaixo para excluir em lote ou clicar em <strong>"Remover"</strong> na linha do item desejado.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickRemoveModalOpen(true)}
                className="text-xs font-bold text-rose-600 hover:underline shrink-0"
              >
                Abrir Busca Rápida de Exclusão →
              </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Buscar produto por nome para remover ou editar..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-purple-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={productFilterStatus}
                  onChange={e => setProductFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="all">Todos os Status</option>
                  <option value="published">Publicados</option>
                  <option value="draft">Rascunhos</option>
                  <option value="hidden">Ocultos</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {selectedProductIds.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>{selectedProductIds.length} produto(s) selecionado(s) para remoção</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                  >
                    Desmarcar Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDeleteConfirm(true)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir {selectedProductIds.length} Selecionado(s) Agora</span>
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          title="Selecionar Todos"
                          checked={
                            productsList.length > 0 &&
                            selectedProductIds.length ===
                              productsList.filter(p => {
                                if (productFilterStatus !== 'all' && p.status !== productFilterStatus) return false;
                                if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
                                return true;
                              }).length
                          }
                          onChange={() =>
                            handleSelectAllProducts(
                              productsList.filter(p => {
                                if (productFilterStatus !== 'all' && p.status !== productFilterStatus) return false;
                                if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
                                return true;
                              })
                            )
                          }
                          className="w-4 h-4 rounded-md text-purple-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-3.5 px-6">Produto</th>
                      <th className="py-3.5 px-6">Categoria</th>
                      <th className="py-3.5 px-6">Preço</th>
                      <th className="py-3.5 px-6">Cliques</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {productsList
                      .filter(p => {
                        if (productFilterStatus !== 'all' && p.status !== productFilterStatus) return false;
                        if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
                        return true;
                      })
                      .map(prod => (
                        <tr
                          key={prod.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            selectedProductIds.includes(prod.id) ? 'bg-purple-50/40' : ''
                          }`}
                        >
                          <td className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(prod.id)}
                              onChange={() => handleToggleSelectProduct(prod.id)}
                              className="w-4 h-4 rounded-md text-purple-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-6 flex items-center gap-3">
                            <img
                              src={prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=60&q=80'}
                              alt={prod.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-xs"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-xs">{prod.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">/produto/{prod.slug}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            {categories.find(c => c.id === prod.category_id)?.name || 'Sem categoria'}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {prod.price ? `R$ ${prod.price.toFixed(2)}` : 'Preço dinâmico'}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                              <Flame className="w-3 h-3 fill-orange-500" />
                              {prod.clicks_count}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={prod.status}
                              onChange={e => handleToggleProductStatus(prod, e.target.value as any)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer focus:outline-hidden ${
                                prod.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prod.status === 'draft'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <option value="published">Publicado</option>
                              <option value="draft">Rascunho</option>
                              <option value="hidden">Oculto</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                title="Ver página pública"
                                onClick={() => navigate(`/produto/${prod.slug}`)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                title="Editar produto"
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setFormProduct(prod);
                                  setActiveTab('create_product');
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Prominent direct remove button */}
                              <button
                                title="Remover produto (sem precisar do link)"
                                onClick={() => setDeleteConfirmId(prod.id)}
                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200/60 rounded-lg cursor-pointer flex items-center gap-1 font-bold text-[11px] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Single Delete Confirmation Modal */}
            {deleteConfirmId && (() => {
              const targetProduct = productsList.find(p => p.id === deleteConfirmId);
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center gap-3 text-rose-600">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">Remover Produto</h3>
                    </div>

                    {targetProduct && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                        <img
                          src={targetProduct.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=60&q=80'}
                          alt={targetProduct.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate text-xs">{targetProduct.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {targetProduct.price ? `R$ ${targetProduct.price.toFixed(2)}` : 'Preço dinâmico'} • {targetProduct.clicks_count} cliques
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tem certeza que deseja remover este produto da vitrine? <strong>Você não precisa do link original do produto.</strong> A remoção é imediata no site público e o histórico de cliques será preservado no dashboard para suas métricas.
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(deleteConfirmId)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer"
                      >
                        Sim, Remover Produto
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3 text-rose-600">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      Remover {selectedProductIds.length} Produtos Selecionados
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você está prestes a remover <strong>{selectedProductIds.length} produto(s)</strong> do catálogo sem precisar de nenhum link. Eles deixarão de aparecer na vitrine pública imediatamente.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBulkDeleteConfirm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmBulkDelete}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer"
                    >
                      Confirmar Remoção em Lote
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Remoção Rápida de Produtos (Sem Link) */}
            {quickRemoveModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          Remover Produto do Catálogo (Sem Link)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuickRemoveModalOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Encontre o produto diretamente pelo nome ou categoria e remova-o com 1 clique, sem precisar buscar link de afiliado ou URL externa.
                    </p>
                  </div>

                  {/* Search input in modal */}
                  <div className="relative">
                    <input
                      type="text"
                      value={quickRemoveSearch}
                      onChange={e => setQuickRemoveSearch(e.target.value)}
                      placeholder="Digite parte do nome do produto..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Products Selector List */}
                  <div className="overflow-y-auto max-h-60 space-y-2 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                    {productsList
                      .filter(p => !quickRemoveSearch || p.name.toLowerCase().includes(quickRemoveSearch.toLowerCase()))
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => setQuickRemoveSelectedId(p.id)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                            quickRemoveSelectedId === p.id
                              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <img
                              src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=60&q=80'}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-xs text-slate-900 block truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {categories.find(c => c.id === p.category_id)?.name || 'Categoria'} • {p.price ? `R$ ${p.price.toFixed(2)}` : 'Preço dinâmico'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              quickRemoveSelectedId === p.id ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {quickRemoveSelectedId === p.id ? 'Selecionado' : 'Escolher'}
                          </span>
                        </div>
                      ))}

                    {productsList.filter(p => !quickRemoveSearch || p.name.toLowerCase().includes(quickRemoveSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400">
                        Nenhum produto encontrado com esse nome.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {quickRemoveSelectedId
                        ? '1 produto selecionado para exclusão imediata.'
                        : 'Selecione um produto acima para remover.'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickRemoveModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Fechar
                      </button>
                      <button
                        type="button"
                        disabled={!quickRemoveSelectedId}
                        onClick={() => {
                          if (quickRemoveSelectedId) {
                            handleDeleteProduct(quickRemoveSelectedId);
                            setQuickRemoveModalOpen(false);
                          }
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer disabled:opacity-40"
                      >
                        Remover Produto Selecionado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: CATEGORIAS
            ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Gerenciamento de Categorias
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Crie e organize categorias para estruturar os achadinhos da sua loja.
                </p>
              </div>
              <button
                onClick={() => setCategoryModal({ name: '', slug: '', description: '', image_url: '' })}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova Categoria</span>
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 overflow-hidden shrink-0">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-6 h-6 text-purple-600 m-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">/catalogo?category={cat.slug}</span>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                      {cat.products_count ?? 0} produtos
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCategoryModal(cat)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Modal */}
            {categoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                <form
                  onSubmit={handleSaveCategory}
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
                >
                  <h3 className="text-base font-bold text-slate-900">
                    {categoryModal.id ? 'Editar Categoria' : 'Nova Categoria'}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={categoryModal.name || ''}
                      onChange={e => setCategoryModal({ ...categoryModal, name: e.target.value })}
                      placeholder="Ex: Eletrônicos & Gadgets"
                      className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                    <input
                      type="text"
                      value={categoryModal.slug || ''}
                      onChange={e => setCategoryModal({ ...categoryModal, slug: e.target.value })}
                      placeholder="eletronicos-gadgets"
                      className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL da Imagem</label>
                    <input
                      type="url"
                      value={categoryModal.image_url || ''}
                      onChange={e => setCategoryModal({ ...categoryModal, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição</label>
                    <textarea
                      rows={2}
                      value={categoryModal.description || ''}
                      onChange={e => setCategoryModal({ ...categoryModal, description: e.target.value })}
                      placeholder="Breve descrição da categoria..."
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCategoryModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={categorySubmitting}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                    >
                      Salvar Categoria
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: PERSONALIZAÇÃO DO SITE (VISUAL IDENTITY & HOME)
            ======================================================== */}
        {activeTab === 'customization' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Personalização da Loja
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Altere a identidade visual, cores, banners e seções da vitrine em tempo real sem alterar código.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-105 active:scale-95"
                  style={{ backgroundColor: customForm.button_color || '#7c3aed' }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSettings ? 'Salvando...' : 'Salvar Personalização'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Settings Form */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. Visual Identity */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Identidade Visual e Cores
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Loja</label>
                      <input
                        type="text"
                        value={customForm.store_name}
                        onChange={e => setCustomForm({ ...customForm, store_name: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slogan / Tagline</label>
                      <input
                        type="text"
                        value={customForm.tagline}
                        onChange={e => setCustomForm({ ...customForm, tagline: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Preset Palettes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Paletas de Cores Rápidas</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Roxo TokShop', primary: '#7c3aed', secondary: '#ec4899', btn: '#7c3aed' },
                        { label: 'Azul Shopee', primary: '#2563eb', secondary: '#0284c7', btn: '#2563eb' },
                        { label: 'Laranja Vibe', primary: '#ea580c', secondary: '#f97316', btn: '#ea580c' },
                        { label: 'Rosa Pink', primary: '#db2777', secondary: '#f43f5e', btn: '#db2777' },
                        { label: 'Esmeralda Tech', primary: '#059669', secondary: '#10b981', btn: '#059669' }
                      ].map(pal => (
                        <button
                          key={pal.label}
                          type="button"
                          onClick={() =>
                            setCustomForm({
                              ...customForm,
                              primary_color: pal.primary,
                              secondary_color: pal.secondary,
                              button_color: pal.btn
                            })
                          }
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                        >
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: pal.primary }}></span>
                          <span>{pal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color pickers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cor Primária</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customForm.primary_color}
                          onChange={e => setCustomForm({ ...customForm, primary_color: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs font-mono">{customForm.primary_color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cor Secundária</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customForm.secondary_color}
                          onChange={e => setCustomForm({ ...customForm, secondary_color: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs font-mono">{customForm.secondary_color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cor dos Botões</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customForm.button_color}
                          onChange={e => setCustomForm({ ...customForm, button_color: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs font-mono">{customForm.button_color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bordas dos Cards</label>
                      <select
                        value={customForm.card_radius}
                        onChange={e => setCustomForm({ ...customForm, card_radius: e.target.value as any })}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="rounded-none">Retas (none)</option>
                        <option value="rounded-md">Médias (md)</option>
                        <option value="rounded-xl">Arredondadas (xl)</option>
                        <option value="rounded-2xl">Super Arredondadas (2xl)</option>
                        <option value="rounded-3xl">Pills (3xl)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Hero Banner Settings */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-600" />
                      Banner Principal (Hero)
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={customForm.hero_banner_enabled}
                        onChange={e => setCustomForm({ ...customForm, hero_banner_enabled: e.target.checked })}
                        className="rounded-md text-purple-600"
                      />
                      <span>Exibir Banner</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título do Banner</label>
                      <input
                        type="text"
                        value={customForm.hero_banner_title}
                        onChange={e => setCustomForm({ ...customForm, hero_banner_title: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtítulo</label>
                      <textarea
                        rows={2}
                        value={customForm.hero_banner_subtitle}
                        onChange={e => setCustomForm({ ...customForm, hero_banner_subtitle: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Texto do Botão CTA</label>
                        <input
                          type="text"
                          value={customForm.hero_banner_cta}
                          onChange={e => setCustomForm({ ...customForm, hero_banner_cta: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Imagem de Fundo</label>
                        <input
                          type="url"
                          value={customForm.hero_banner_image}
                          onChange={e => setCustomForm({ ...customForm, hero_banner_image: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Home Sections Control */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    Seções da Página Inicial
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Seção Mais Clicados</span>
                        <input
                          type="text"
                          value={customForm.most_clicked_section_title}
                          onChange={e => setCustomForm({ ...customForm, most_clicked_section_title: e.target.value })}
                          className="mt-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={customForm.most_clicked_section_enabled}
                        onChange={e => setCustomForm({ ...customForm, most_clicked_section_enabled: e.target.checked })}
                        className="w-4 h-4 rounded-md text-purple-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Seção Destaques da Semana</span>
                        <input
                          type="text"
                          value={customForm.featured_section_title}
                          onChange={e => setCustomForm({ ...customForm, featured_section_title: e.target.value })}
                          className="mt-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={customForm.featured_section_enabled}
                        onChange={e => setCustomForm({ ...customForm, featured_section_enabled: e.target.checked })}
                        className="w-4 h-4 rounded-md text-purple-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Seção Lançamentos e Recentes</span>
                        <input
                          type="text"
                          value={customForm.recent_section_title}
                          onChange={e => setCustomForm({ ...customForm, recent_section_title: e.target.value })}
                          className="mt-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={customForm.recent_section_enabled}
                        onChange={e => setCustomForm({ ...customForm, recent_section_enabled: e.target.checked })}
                        className="w-4 h-4 rounded-md text-purple-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prévia Visual da Loja
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  {/* Fake header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: customForm.primary_color }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{customForm.store_name}</span>
                    </div>
                  </div>

                  {/* Fake banner */}
                  <div
                    className="p-4 rounded-2xl text-white space-y-2 relative overflow-hidden"
                    style={{ backgroundColor: '#0f172a' }}
                  >
                    <span className="text-[10px] font-bold text-purple-300">Achadinhos do TikTok</span>
                    <h5 className="text-xs font-black leading-tight line-clamp-2">
                      {customForm.hero_banner_title}
                    </h5>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: customForm.button_color }}
                    >
                      {customForm.hero_banner_cta}
                    </button>
                  </div>

                  {/* Fake card */}
                  <div className={`p-3 bg-slate-50 border border-slate-200/90 ${customForm.card_radius} space-y-2`}>
                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80"
                        alt="Demo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 block truncate">
                      Fone TWS Sem Fio Bluetooth
                    </span>
                    <button
                      type="button"
                      className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white"
                      style={{ backgroundColor: customForm.button_color }}
                    >
                      Ver no TikTok Shop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: CONFIGURAÇÕES GERAIS
            ======================================================== */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Configurações Gerais
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ajuste dados de contato, redes sociais, aviso de afiliados e metadados de SEO.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    value={customForm.contact_email}
                    onChange={e => setCustomForm({ ...customForm, contact_email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instagram (@)</label>
                  <input
                    type="url"
                    value={customForm.social_links?.instagram || ''}
                    onChange={e =>
                      setCustomForm({
                        ...customForm,
                        social_links: { ...customForm.social_links, instagram: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TikTok (@)</label>
                  <input
                    type="url"
                    value={customForm.social_links?.tiktok || ''}
                    onChange={e =>
                      setCustomForm({
                        ...customForm,
                        social_links: { ...customForm.social_links, tiktok: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp Link</label>
                  <input
                    type="url"
                    value={customForm.social_links?.whatsapp || ''}
                    onChange={e =>
                      setCustomForm({
                        ...customForm,
                        social_links: { ...customForm.social_links, whatsapp: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Texto do Aviso de Afiliado (Transparência / Rodapé)
                </label>
                <textarea
                  rows={3}
                  value={customForm.affiliate_disclaimer}
                  onChange={e => setCustomForm({ ...customForm, affiliate_disclaimer: e.target.value })}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-md cursor-pointer"
                >
                  {savingSettings ? 'Salvando...' : 'Salvar Configurações Gerais'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: ATIVIDADES ADMINISTRATIVAS (AUDIT TRAIL)
            ======================================================== */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Atividades Administrativas
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Registro de auditoria persistente de alterações cadastrais e operacionais.
                </p>
              </div>
              <button
                onClick={loadActivities}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Data e Hora</th>
                      <th className="py-3.5 px-6">Usuário</th>
                      <th className="py-3.5 px-6">Ação</th>
                      <th className="py-3.5 px-6">Tipo</th>
                      <th className="py-3.5 px-6">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activitiesList.map(act => (
                      <tr key={act.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">
                          {new Date(act.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">{act.user_email}</td>
                        <td className="py-3.5 px-6 font-bold">{act.action}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 uppercase">
                            {act.entity_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600 max-w-md truncate">{act.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: MINHA CONTA
            ======================================================== */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Minha Conta
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Atualize seus dados cadastrais e senha de acesso administrativo.
              </p>
            </div>

            <form
              onSubmit={handleSaveAccount}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs max-w-xl space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={accountEmail}
                  onChange={e => setAccountEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <span className="text-xs font-bold text-slate-900 block">Alterar Senha de Acesso</span>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={accountSubmitting}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {accountSubmitting ? 'Atualizando...' : 'Atualizar Dados da Conta'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
