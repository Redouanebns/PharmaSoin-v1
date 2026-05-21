import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Image as ImageIcon, Lock, ShieldCheck, KeyRound,
  ShoppingBag, CreditCard, Sun, Moon, LogOut, CheckCircle2, 
  AlertCircle, XCircle, Info, Truck, HelpCircle, Activity, Sparkles,
  ExternalLink, Calendar, Hash, ShieldAlert, BadgeInfo, LayoutDashboard,
  Menu, X, ChevronRight, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../../services/api';
import BrandLoader from '../../../components/BrandLoader';
import { getInitials, getRoleLabel, setAuthSession } from '../../../utils/auth';
import './ClientDashboard.css';

const initialProfileForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  current_password: '',
  password: '',
  password_confirmation: '',
};

const canCancelOrder = (order) => order?.statut === 'En attente';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  }
};

const ClientDashboard = ({ currentUser, isDarkMode, onLogout, onAuthenticated, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ cards: [], featuredMedicines: [], site: {}, user: {}, orders: [] });
  const [orders, setOrders] = useState([]);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCancellingOrderId, setIsCancellingOrderId] = useState(null);
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'profile', 'info'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchDashboardData = async () => {
    const [summaryResponse, profileResponse, ordersResponse] = await Promise.all([
      api.get('/client/dashboard/summary'),
      api.get('/profile'),
      api.get('/client/orders'),
    ]);

    const nextSummary = summaryResponse.data || { cards: [], featuredMedicines: [], site: {}, user: {}, orders: [] };
    const user = profileResponse.data?.user || currentUser;
    const nextOrders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];

    setSummary(nextSummary);
    setOrders(nextOrders);
    setProfileForm((previous) => ({
      ...previous,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatar: user?.avatar || '',
      current_password: '',
      password: '',
      password_confirmation: '',
    }));
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchDashboardData();
      } catch (requestError) {
        console.error(requestError);
        setError('Impossible de charger votre espace client.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const site = useMemo(() => summary.site || {}, [summary]);
  const recentOrders = useMemo(() => (summary.orders || []).slice(0, 4), [summary]);
  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.statut === 'En attente').length,
    completed: orders.filter((order) => ['Complétée', 'Payée'].includes(order.statut)).length,
    cancelled: orders.filter((order) => ['Annulée', 'Refusée'].includes(order.statut)).length,
  }), [orders]);

  const handleLogout = async () => {
    await onLogout?.();
    navigate('/authentification', { replace: true });
  };

  const handleProfileChange = (event) => {
    setProfileForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setProfileMessage('');
    setProfileError('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const response = await api.put('/profile', profileForm);
      const user = response.data?.user;
      const token = localStorage.getItem('pharma_auth_token');
      if (token && user) {
        setAuthSession(token, user);
      }
      if (user) {
        onAuthenticated?.(user);
      }
      setProfileMessage(response.data?.message || 'Profil mis à jour avec succès.');
      await fetchDashboardData();
    } catch (requestError) {
      console.error(requestError);
      const validationErrors = requestError.response?.data?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      setProfileError(firstError || requestError.response?.data?.message || 'Impossible de mettre à jour votre profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) {
      return;
    }

    try {
      setIsCancellingOrderId(orderId);
      await api.put(`/client/orders/${orderId}/cancel`);
      await fetchDashboardData();
    } catch (requestError) {
      console.error(requestError);
      window.alert(requestError.response?.data?.message || 'Impossible d’annuler cette commande.');
    } finally {
      setIsCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <BrandLoader
        title="Espace client"
        message="Chargement de vos informations, commandes et services utiles..."
        kicker="Dashboard client"
      />
    );
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className={`client-dashboard ${isDarkMode ? 'dark-mode' : ''}`}>
      
      {/* Mobile Top Bar */}
      <header className="client-dashboard__mobile-header glass-card">
        <button className="mobile-menu-btn" onClick={toggleMobileSidebar} aria-label="Ouvrir le menu">
          <Menu size={22} />
        </button>
        <span className="mobile-brand-name">{site.site_name || 'PharmaSoin'}</span>
        <button className="mobile-theme-btn" onClick={toggleDarkMode} aria-label="Changer le thème">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="client-dashboard__sidebar-overlay"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside className={`client-dashboard__sidebar glass-card ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-area">
          <div className="brand-logo-glow">
            <img 
              src="/assets/images/logo.png" 
              alt="Logo PharmaSoin" 
              className="brand-logo-img" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px', padding: '2px' }}
              onError={(e) => {
                // Inline medical fallback if logo image does not load
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h2>{site.site_name || 'PharmaSoin'}</h2>
            <small>{site.site_tagline || 'Espace Santé'}</small>
          </div>
          <button className="sidebar-close-btn" onClick={toggleMobileSidebar}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-divider"></div>

        {/* User Quick Info */}
        <div className="sidebar-user-block">
          <div className="user-avatar-wrap">
            {profileForm.avatar ? (
              <img src={profileForm.avatar} alt="Avatar" className="user-avatar-img" />
            ) : (
              <div className="user-avatar-initials">{getInitials(profileForm.name || currentUser?.name)}</div>
            )}
            <span className="user-status-dot"></span>
          </div>
          <div className="user-meta-info">
            <strong>{profileForm.name || currentUser?.name}</strong>
            <span className="user-role-badge">{getRoleLabel(currentUser?.role)}</span>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        {/* Navigation Menu Links */}
        <nav className="sidebar-navigation">
          <button 
            type="button" 
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
          >
            <LayoutDashboard size={18} />
            <span>Aperçu</span>
            <ChevronRight size={14} className="arrow-indicator" />
          </button>

          <button 
            type="button" 
            className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
          >
            <ShoppingBag size={18} />
            <span>Mes commandes</span>
            {orderStats.pending > 0 && (
              <span className="pending-badge-count">{orderStats.pending}</span>
            )}
            <ChevronRight size={14} className="arrow-indicator" />
          </button>

          <button 
            type="button" 
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setIsMobileSidebarOpen(false); }}
          >
            <User size={18} />
            <span>Mon profil</span>
            <ChevronRight size={14} className="arrow-indicator" />
          </button>

          <button 
            type="button" 
            className={`sidebar-nav-item ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => { setActiveTab('info'); setIsMobileSidebarOpen(false); }}
          >
            <Info size={18} />
            <span>Informations</span>
            <ChevronRight size={14} className="arrow-indicator" />
          </button>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="client-dashboard__sidebar-footer">
          <button type="button" className="client-dashboard__sidebar-control-btn theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>Mode {isDarkMode ? 'Clair' : 'Sombre'}</span>
          </button>

          <button type="button" className="client-dashboard__sidebar-control-btn boutique-btn" onClick={() => navigate('/home')}>
            <ShoppingBag size={16} />
            <span>Boutique</span>
          </button>

          <button type="button" className="client-dashboard__sidebar-control-btn logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="client-dashboard__main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={containerVariants}
              className="dashboard-tab-panel"
            >
              {/* Welcome Banner */}
              <motion.header variants={itemVariants} className="client-dashboard__hero glass-card">
                <div className="client-dashboard__hero-main">
                  <span className="client-dashboard__badge">
                    <Sparkles size={14} className="me-1 animate-pulse" />
                    Bienvenue dans votre espace personnel
                  </span>
                  <h1>Ravi de vous revoir, {profileForm.name || currentUser?.name} !</h1>
                  <p>
                    Retrouvez ici la synthèse de vos activités, le suivi de vos commandes en cours et 
                    les informations utiles pour vos futurs achats en ligne.
                  </p>
                  <div className="client-dashboard__actions">
                    <button type="button" className="client-dashboard__ghost-btn primary" onClick={() => navigate('/payment')}>
                      <CreditCard size={16} />
                      Passer une commande
                    </button>
                    <button type="button" className="client-dashboard__ghost-btn" onClick={() => navigate('/home')}>
                      <ShoppingBag size={16} />
                      Retour boutique
                    </button>
                  </div>
                </div>
              </motion.header>

              {error && <div className="client-dashboard__error"><ShieldAlert size={18} className="me-2" />{error}</div>}

              {/* Cards Grid */}
              <motion.section variants={itemVariants} className="client-dashboard__cards">
                {(summary.cards || []).map((card, idx) => {
                  let cardIcon = <Sparkles size={22} />;
                  if (idx === 0) cardIcon = <ShoppingBag size={22} />;
                  if (idx === 1) cardIcon = <Hash size={22} />;
                  if (idx === 2) cardIcon = <Activity size={22} />;
                  
                  return (
                    <article key={card.label} className="client-dashboard__card glass-card">
                      <div className="client-dashboard__card-top">
                        <span>{card.label}</span>
                        <span className="client-dashboard__card-icon">{cardIcon}</span>
                      </div>
                      <strong>{card.value}</strong>
                      <p>{card.helper}</p>
                    </article>
                  );
                })}
              </motion.section>

              {/* Status Stats */}
              <motion.section variants={itemVariants} className="client-dashboard__status-grid">
                <article className="client-dashboard__mini-stat glass-card border-all">
                  <div className="mini-stat-info">
                    <span>Commandes totales</span>
                    <strong>{orderStats.total}</strong>
                  </div>
                  <div className="mini-stat-icon-wrapper blue">
                    <ShoppingBag size={18} />
                  </div>
                </article>
                <article className="client-dashboard__mini-stat glass-card border-pending">
                  <div className="mini-stat-info">
                    <span>En attente</span>
                    <strong>{orderStats.pending}</strong>
                  </div>
                  <div className="mini-stat-icon-wrapper orange">
                    <Activity size={18} />
                  </div>
                </article>
                <article className="client-dashboard__mini-stat glass-card border-success">
                  <div className="mini-stat-info">
                    <span>Validées</span>
                    <strong>{orderStats.completed}</strong>
                  </div>
                  <div className="mini-stat-icon-wrapper green">
                    <CheckCircle2 size={18} />
                  </div>
                </article>
                <article className="client-dashboard__mini-stat glass-card border-danger">
                  <div className="mini-stat-info">
                    <span>Annulées / refusées</span>
                    <strong>{orderStats.cancelled}</strong>
                  </div>
                  <div className="mini-stat-icon-wrapper red">
                    <XCircle size={18} />
                  </div>
                </article>
              </motion.section>

              <div className="client-dashboard__content-grid">
                {/* Recent activity box */}
                <section className="client-dashboard__support glass-card">
                  <div className="client-dashboard__section-head">
                    <div className="section-title-icon-row">
                      <div className="section-icon-bg purple">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h2>Activité récente</h2>
                        <p>Suivez en un coup d'œil l'état de vos dernières interactions.</p>
                      </div>
                    </div>
                  </div>

                  <div className="client-dashboard__activity-list">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div key={order.id} className="client-dashboard__activity-item">
                          <div className="client-dashboard__activity-dot"></div>
                          <div className="activity-details">
                            <strong>{order.numero}</strong>
                            <p>{order.date} · {order.items_count} article(s)</p>
                          </div>
                          <span className={`client-dashboard__activity-status status-${(order.statut || '').toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                            {order.statut}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="client-dashboard__empty-state-mini">Aucune activité récente.</div>
                    )}
                  </div>
                </section>

                {/* Support cards list */}
                <section className="client-dashboard__support glass-card">
                  <div className="client-dashboard__section-head">
                    <div className="section-title-icon-row">
                      <div className="section-icon-bg blue">
                        <HelpCircle size={18} />
                      </div>
                      <div>
                        <h2>Assistance & Sécurité</h2>
                        <p>Nos services restent entièrement à votre disposition.</p>
                      </div>
                    </div>
                  </div>

                  <div className="client-dashboard__support-grid">
                    <article className="client-dashboard__support-card">
                      <ShieldCheck size={18} className="support-icon text-emerald" />
                      <div>
                        <strong>Paiement 100% sécurisé</strong>
                        <span>Vos commandes sont examinées et validées par nos pharmaciens.</span>
                      </div>
                    </article>
                    <article className="client-dashboard__support-card">
                      <Truck size={18} className="support-icon text-indigo" />
                      <div>
                        <strong>Suivi de livraison</strong>
                        <span>Consultez l'avancement de vos colis directement en ligne.</span>
                      </div>
                    </article>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={containerVariants}
              className="dashboard-tab-panel"
            >
              <motion.div variants={itemVariants} className="client-dashboard__orders glass-card">
                <div className="client-dashboard__section-head">
                  <div className="section-title-icon-row">
                    <div className="section-icon-bg green">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h2>Mes commandes</h2>
                      <p>Les commandes payées en ligne passent d’abord en attente, puis sont acceptées ou refusées par l’équipe pharmacie.</p>
                    </div>
                  </div>
                </div>

                <div className="client-dashboard__orders-list">
                  {orders.length === 0 ? (
                    <div className="client-dashboard__empty-state">
                      <div className="empty-state-illust">
                        <ShoppingBag size={48} />
                      </div>
                      <p>Aucune commande enregistrée pour le moment.</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <article key={order.id} className="client-dashboard__order-card">
                        <div className="client-dashboard__order-head">
                          <div className="order-main-info">
                            <h3>{order.numero}</h3>
                            <p><Calendar size={12} className="inline me-1" /> {order.date} · {order.produits?.length || 0} produit(s)</p>
                          </div>
                          <span className={`client-dashboard__order-status status-${(order.statut || '').toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                            <span className="status-dot"></span>
                            {order.statut}
                          </span>
                        </div>

                        <div className="client-dashboard__order-meta">
                          <span><strong>Paiement :</strong> {order.paiement}</span>
                          <span><strong>Référence :</strong> {order.payment_reference || '—'}</span>
                          <span className="order-total-highlight"><strong>Total :</strong> {Number(order.total || 0).toFixed(2)} DH</span>
                        </div>

                        <div className="client-dashboard__order-items">
                          {(order.produits || []).map((product) => (
                            <div key={product.id} className="client-dashboard__order-item">
                              <span className="item-name">{product.medicament}</span>
                              <span className="item-price">{product.qte} x {Number(product.prix_unitaire || 0).toFixed(2)} DH</span>
                            </div>
                          ))}
                        </div>

                        <div className="client-dashboard__order-footer">
                          <div className="delivery-address-row">
                            <MapPin size={14} className="me-1 text-muted" />
                            <div>
                              <strong>Adresse de livraison :</strong> {order.delivery_address || '—'}
                              {order.status_reason && (
                                <div className="client-dashboard__order-reason">
                                  <BadgeInfo size={12} className="me-1 inline" />
                                  <strong>Motif :</strong> {order.status_reason}
                                </div>
                              )}
                            </div>
                          </div>
                          {canCancelOrder(order) && (
                            <button
                              type="button"
                              className="client-dashboard__cancel-btn"
                              disabled={isCancellingOrderId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              {isCancellingOrderId === order.id ? 'Annulation...' : 'Annuler la commande'}
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={containerVariants}
              className="dashboard-tab-panel"
            >
              <motion.section variants={itemVariants} className="client-dashboard__profile-panel glass-card">
                <div className="client-dashboard__section-head">
                  <div className="section-title-icon-row">
                    <div className="section-icon-bg blue">
                      <User size={20} />
                    </div>
                    <div>
                      <h2>Mon profil</h2>
                      <p>Mettez à jour vos coordonnées et sécurisez votre compte utilisateur.</p>
                    </div>
                  </div>
                </div>

                <form className="client-dashboard__profile-form" onSubmit={handleProfileSubmit}>
                  {profileError && <div className="client-dashboard__alert error"><AlertCircle size={16} className="me-2" />{profileError}</div>}
                  {profileMessage && <div className="client-dashboard__alert success"><CheckCircle2 size={16} className="me-2" />{profileMessage}</div>}

                  <div className="client-dashboard__form-grid">
                    <div className="custom-input-group">
                      <label>Nom complet</label>
                      <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input className="custom-control" name="name" value={profileForm.name} onChange={handleProfileChange} required placeholder="Votre nom complet" />
                      </div>
                    </div>
                    <div className="custom-input-group">
                      <label>Email</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input className="custom-control" type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required placeholder="exemple@email.com" />
                      </div>
                    </div>
                    <div className="custom-input-group">
                      <label>Téléphone</label>
                      <div className="input-with-icon">
                        <Phone size={18} className="input-icon" />
                        <input className="custom-control" name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="+212 6..." />
                      </div>
                    </div>
                    <div className="custom-input-group">
                      <label>Avatar (URL)</label>
                      <div className="input-with-icon">
                        <ImageIcon size={18} className="input-icon" />
                        <input className="custom-control" name="avatar" value={profileForm.avatar} onChange={handleProfileChange} placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div className="custom-input-group" style={{ marginTop: '1.25rem' }}>
                    <label>Adresse complète</label>
                    <div className="input-with-icon align-top">
                      <MapPin size={18} className="input-icon" />
                      <textarea className="custom-control" rows="3" name="address" value={profileForm.address} onChange={handleProfileChange} placeholder="Votre adresse physique de livraison" />
                    </div>
                  </div>

                  <div className="client-dashboard__password-box">
                    <div className="client-dashboard__section-head" style={{ marginBottom: '1.25rem' }}>
                      <div className="section-title-icon-row">
                        <KeyRound size={18} className="text-primary" />
                        <h3 className="mb-0 fw-bold" style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Sécurité</h3>
                      </div>
                    </div>
                    <div className="client-dashboard__form-grid">
                      <div className="custom-input-group">
                        <label>Mot de passe actuel</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon text-muted" />
                          <input className="custom-control" type="password" name="current_password" value={profileForm.current_password} onChange={handleProfileChange} placeholder="Requis pour modifier" />
                        </div>
                      </div>
                      <div className="custom-input-group">
                        <label>Nouveau mot de passe</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon text-success" />
                          <input className="custom-control" type="password" name="password" value={profileForm.password} onChange={handleProfileChange} placeholder="Nouveau mot de passe" />
                        </div>
                      </div>
                      <div className="custom-input-group">
                        <label>Confirmation</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon text-success" />
                          <input className="custom-control" type="password" name="password_confirmation" value={profileForm.password_confirmation} onChange={handleProfileChange} placeholder="Retapez le mot de passe" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-submit-row">
                    <button type="submit" className="client-dashboard__submit-btn" disabled={isSavingProfile}>
                      {isSavingProfile ? (
                        <><div className="spinner-border spinner-border-sm me-2"></div> Enregistrement...</>
                      ) : (
                        <><ShieldCheck size={18} className="me-2" /> Mettre à jour le profil</>
                      )}
                    </button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div 
              key="info"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={containerVariants}
              className="dashboard-tab-panel"
            >
              <motion.section variants={itemVariants} className="client-dashboard__info glass-card">
                <div className="client-dashboard__section-head">
                  <div className="section-title-icon-row">
                    <div className="section-icon-bg info">
                      <Info size={20} />
                    </div>
                    <div>
                      <h2>Informations sur l'établissement</h2>
                      <p>Retrouvez toutes les coordonnées et informations de contact de notre pharmacie.</p>
                    </div>
                  </div>
                </div>

                <ul>
                  <li>
                    <strong>Slogan :</strong> 
                    <span>{site.site_tagline || 'Votre santé, notre priorité'}</span>
                  </li>
                  <li>
                    <strong>Contact email :</strong> 
                    <span>{site.contact_email || '—'}</span>
                  </li>
                  <li>
                    <strong>Téléphone :</strong> 
                    <span>{site.contact_phone || '—'}</span>
                  </li>
                  <li>
                    <strong>Adresse physique :</strong> 
                    <span>{site.address || '—'}</span>
                  </li>
                  <li>
                    <strong>Inscriptions en ligne :</strong> 
                    <span className="tag-status">{site.enable_registration ? 'Ouverte' : 'Fermée'}</span>
                  </li>
                </ul>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClientDashboard;
