import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

<<<<<<< HEAD
=======
const statusToSlug = (value = '') => value
  .toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const numberFormatter = new Intl.NumberFormat('fr-FR');
const decimalFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (amount) => `${decimalFormatter.format(Number(amount || 0))} DH`;
const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const formatOrderDate = (value) => {
  if (!value) return '—';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const formatShortLabel = (value) => {
  if (!value) return '—';
  if (value.length <= 12) return value;
  return `${value.slice(0, 10)}…`;
};

>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
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
<<<<<<< HEAD
=======
  const [activeSection, setActiveSection] = useState('overview');
  const [orderSearch, setOrderSearch] = useState('');
  const [sortMode, setSortMode] = useState('recent');

  const navItems = useMemo(() => ([
    { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'orders', label: 'Commandes', icon: 'fa-bag-shopping' },
    { id: 'support', label: 'Assistance', icon: 'fa-headset' },
    { id: 'profile', label: 'Profil', icon: 'fa-user-gear' },
  ]), []);
>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed

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
<<<<<<< HEAD
  const recentOrders = useMemo(() => (summary.orders || []).slice(0, 4), [summary]);
=======

  const latestOrders = useMemo(() => (
    [...orders].sort((first, second) => {
      const left = new Date(second.date || second.created_at || 0).getTime();
      const right = new Date(first.date || first.created_at || 0).getTime();
      return left - right;
    })
  ), [orders]);

  const recentOrders = useMemo(() => latestOrders.slice(0, 4), [latestOrders]);

>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.statut === 'En attente').length,
    completed: orders.filter((order) => ['Complétée', 'Payée'].includes(order.statut)).length,
    cancelled: orders.filter((order) => ['Annulée', 'Refusée'].includes(order.statut)).length,
  }), [orders]);

<<<<<<< HEAD
=======
  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders]);
  const completionRate = orderStats.total > 0 ? Math.round((orderStats.completed / orderStats.total) * 1000) / 10 : 0;
  const pendingRate = orderStats.total > 0 ? Math.round((orderStats.pending / orderStats.total) * 1000) / 10 : 0;

  const availabilityCard = useMemo(() => (
    (summary.cards || []).find((card) => card?.label?.toLowerCase().includes('produits')) || summary.cards?.[0] || null
  ), [summary.cards]);

  const waitingCard = useMemo(() => (
    (summary.cards || []).find((card) => card?.label?.toLowerCase().includes('attente')) || summary.cards?.[2] || null
  ), [summary.cards]);

  const metricCards = useMemo(() => ([
    {
      label: 'Total commandes',
      value: formatNumber(orderStats.total),
      helper: `${formatNumber(orderStats.pending)} en attente`,
      icon: 'fa-bag-shopping',
      accent: 'primary',
    },
    {
      label: 'Commandes validées',
      value: formatNumber(orderStats.completed),
      helper: `${completionRate}% de réussite`,
      icon: 'fa-circle-check',
      accent: 'light',
    },
    {
      label: 'Demandes en attente',
      value: formatNumber(waitingCard?.value ?? orderStats.pending),
      helper: waitingCard?.helper || 'Commandes web en cours de validation',
      icon: 'fa-clock',
      accent: 'light',
    },
    {
      label: 'Montant cumulé',
      value: formatCurrency(totalSpent),
      helper: availabilityCard?.helper || 'Valeur totale de vos commandes',
      icon: 'fa-wallet',
      accent: 'light',
    },
  ]), [availabilityCard, completionRate, orderStats.completed, orderStats.pending, orderStats.total, totalSpent, waitingCard]);

  const performanceBars = useMemo(() => {
    const fallback = [
      { label: 'Total', amount: orderStats.total },
      { label: 'Validées', amount: orderStats.completed },
      { label: 'En attente', amount: orderStats.pending },
      { label: 'Annulées', amount: orderStats.cancelled },
    ];

    const source = latestOrders.length > 0
      ? latestOrders.slice(0, 6).reverse().map((order) => ({
          label: formatShortLabel(order.numero || formatOrderDate(order.date)),
          amount: Number(order.total || 0),
          status: order.statut,
          date: formatOrderDate(order.date),
          items: order.produits?.length || order.items_count || 0,
        }))
      : fallback.map((item) => ({
          ...item,
          status: item.label,
          date: 'Vue synthétique',
          items: item.amount,
        }));

    const maxAmount = Math.max(...source.map((item) => Number(item.amount || 0)), 1);

    return source.map((item, index) => ({
      ...item,
      amount: Number(item.amount || 0),
      height: Math.max(16, Math.round((Number(item.amount || 0) / maxAmount) * 100)),
      highlighted: index === source.length - 2,
    }));
  }, [latestOrders, orderStats.cancelled, orderStats.completed, orderStats.pending, orderStats.total]);

  const displayedOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    let collection = [...latestOrders];

    if (query) {
      collection = collection.filter((order) => {
        const products = (order.produits || []).map((product) => product.medicament).join(' ');
        return [
          order.numero,
          order.statut,
          order.paiement,
          order.payment_reference,
          order.delivery_address,
          products,
        ].some((field) => field?.toString().toLowerCase().includes(query));
      });
    }

    if (sortMode === 'amount-desc') {
      collection.sort((first, second) => Number(second.total || 0) - Number(first.total || 0));
    } else if (sortMode === 'amount-asc') {
      collection.sort((first, second) => Number(first.total || 0) - Number(second.total || 0));
    } else if (sortMode === 'status') {
      collection.sort((first, second) => (first.statut || '').localeCompare(second.statut || '', 'fr'));
    }

    return collection;
  }, [latestOrders, orderSearch, sortMode]);

  const infoItems = useMemo(() => ([
    { label: 'Slogan', value: site.site_tagline || 'Votre santé, notre priorité' },
    { label: 'Contact', value: site.contact_email || '—' },
    { label: 'Téléphone', value: site.contact_phone || '—' },
    { label: 'Adresse', value: site.address || '—' },
    { label: 'Inscriptions', value: site.enable_registration ? 'Ouvertes' : 'Fermées' },
  ]), [site]);

  const supportCards = useMemo(() => ([
    {
      icon: 'fa-shield-heart',
      title: 'Paiement sécurisé',
      text: 'Chaque commande en ligne reste contrôlée et validée par la pharmacie avant préparation.',
    },
    {
      icon: 'fa-truck-fast',
      title: 'Suivi centralisé',
      text: 'Consultez les statuts, références et adresses de livraison depuis un seul tableau de bord.',
    },
    {
      icon: 'fa-headset',
      title: 'Support utile',
      text: 'Les informations de contact et vos dernières activités restent visibles en permanence.',
    },
  ]), []);

>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
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

<<<<<<< HEAD
=======
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
  if (loading) {
    return (
      <BrandLoader
        title="Espace client"
        message="Chargement de vos informations, commandes et services utiles..."
        kicker="Dashboard client"
      />
    );
  }

  return (
    <div className={`client-dashboard ${isDarkMode ? 'dark-mode' : ''}`}>
<<<<<<< HEAD
      <header className="client-dashboard__hero glass-card">
        <div className="client-dashboard__hero-main">
          <span className="client-dashboard__badge">Espace client</span>
          <h1>{site.site_name || 'PharmaSoin'}</h1>
          <p>
            Gérez vos commandes, suivez leur avancement et mettez à jour votre profil dans un espace plus clair,
            plus moderne et pensé pour le parcours client.
          </p>
          <div className="client-dashboard__actions">
            <button type="button" className="client-dashboard__ghost-btn" onClick={() => navigate('/home')}>
              <i className="fas fa-store"></i>
              Retour boutique
            </button>
            <button type="button" className="client-dashboard__ghost-btn primary" onClick={() => navigate('/payment')}>
              <i className="fas fa-credit-card"></i>
              Passer une commande
            </button>
            <button type="button" className="client-dashboard__ghost-btn" onClick={toggleDarkMode}>
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              Thème
            </button>
            <button type="button" className="client-dashboard__ghost-btn danger" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          </div>
        </div>

        <div className="client-dashboard__user-card">
          <div className="client-dashboard__avatar">{getInitials(profileForm.name || currentUser?.name)}</div>
          <strong>{profileForm.name || currentUser?.name}</strong>
          <span>{getRoleLabel(currentUser?.role)}</span>
          <small>{profileForm.email || currentUser?.email}</small>
          <small>{profileForm.phone || 'Téléphone non renseigné'}</small>
        </div>
      </header>

      {error && <div className="client-dashboard__error">{error}</div>}

      <section className="client-dashboard__cards">
        {(summary.cards || []).map((card) => (
          <article key={card.label} className="client-dashboard__card glass-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="client-dashboard__status-grid">
        <article className="client-dashboard__mini-stat glass-card">
          <span>Commandes totales</span>
          <strong>{orderStats.total}</strong>
        </article>
        <article className="client-dashboard__mini-stat glass-card warning">
          <span>En attente</span>
          <strong>{orderStats.pending}</strong>
        </article>
        <article className="client-dashboard__mini-stat glass-card success">
          <span>Validées</span>
          <strong>{orderStats.completed}</strong>
        </article>
        <article className="client-dashboard__mini-stat glass-card danger">
          <span>Annulées / refusées</span>
          <strong>{orderStats.cancelled}</strong>
        </article>
      </section>

      <section className="client-dashboard__content-grid client-dashboard__content-grid--wide">
        <div className="client-dashboard__orders glass-card">
          <div className="client-dashboard__section-head">
            <div>
              <h2>Mes commandes</h2>
              <p>Les commandes payées en ligne passent d’abord en attente, puis sont acceptées ou refusées par l’équipe pharmacie.</p>
            </div>
          </div>

          <div className="client-dashboard__orders-list">
            {orders.length === 0 ? (
              <div className="client-dashboard__empty-state">Aucune commande enregistrée pour le moment.</div>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="client-dashboard__order-card">
                  <div className="client-dashboard__order-head">
                    <div>
                      <h3>{order.numero}</h3>
                      <p>{order.date} · {order.produits?.length || 0} produit(s)</p>
                    </div>
                    <span className={`client-dashboard__order-status status-${(order.statut || '').toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                      {order.statut}
                    </span>
                  </div>

                  <div className="client-dashboard__order-meta">
                    <span><strong>Paiement :</strong> {order.paiement}</span>
                    <span><strong>Référence :</strong> {order.payment_reference || '****'}</span>
                    <span><strong>Total :</strong> {Number(order.total || 0).toFixed(2)} DH</span>
                  </div>

                  <div className="client-dashboard__order-items">
                    {(order.produits || []).map((product) => (
                      <div key={product.id} className="client-dashboard__order-item">
                        <span>{product.medicament}</span>
                        <span>{product.qte} x {Number(product.prix_unitaire || 0).toFixed(2)} DH</span>
                      </div>
                    ))}
                  </div>

                  <div className="client-dashboard__order-footer">
                    <div>
                      <strong>Adresse :</strong> {order.delivery_address || '—'}
                      {order.status_reason && <p className="client-dashboard__order-reason">Motif: {order.status_reason}</p>}
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
        </div>

        <aside className="client-dashboard__info-stack">
          <section className="client-dashboard__info glass-card">
            <h2>Informations utiles</h2>
            <ul>
              <li><strong>Slogan :</strong> {site.site_tagline || 'Votre santé, notre priorité'}</li>
              <li><strong>Contact :</strong> {site.contact_email || '—'}</li>
              <li><strong>Téléphone :</strong> {site.contact_phone || '—'}</li>
              <li><strong>Adresse :</strong> {site.address || '—'}</li>
              <li><strong>Inscription :</strong> {site.enable_registration ? 'Ouverte' : 'Fermée'}</li>
            </ul>
          </section>

          <section className="client-dashboard__support glass-card">
            <div className="client-dashboard__section-head">
              <div>
                <h2>Suivi & assistance</h2>
                <p>Retrouvez les services essentiels sans afficher la section des médicaments sans ordonnance.</p>
              </div>
            </div>

            <div className="client-dashboard__support-grid">
              <article className="client-dashboard__support-card">
                <i className="fas fa-shield-check"></i>
                <strong>Paiement sécurisé</strong>
                <span>Vos commandes en ligne restent en attente jusqu’à validation par la pharmacie.</span>
              </article>
              <article className="client-dashboard__support-card">
                <i className="fas fa-truck"></i>
                <strong>Suivi rapide</strong>
                <span>Visualisez l’état de vos commandes et les motifs de refus si nécessaire.</span>
              </article>
              <article className="client-dashboard__support-card">
                <i className="fas fa-headset"></i>
                <strong>Assistance</strong>
                <span>Les coordonnées du site sont disponibles à tout moment dans ce tableau de bord.</span>
              </article>
            </div>

            <div className="client-dashboard__activity-box">
              <div className="client-dashboard__activity-header">
                <h3>Dernière activité</h3>
                <span>{recentOrders.length} élément(s)</span>
              </div>
=======
      <div className="client-dashboard__shell">
        <header className="client-dashboard__topbar">
          <div className="client-dashboard__brand">
            <div className="client-dashboard__brand-mark">
              <i className="fas fa-bolt"></i>
            </div>
            <div>
              <strong>{site.site_name || 'PharmaSoin'}</strong>
              <span>Espace client premium</span>
            </div>
          </div>

          <nav className="client-dashboard__nav" aria-label="Navigation du dashboard client">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`client-dashboard__nav-item ${activeSection === item.id ? 'is-active' : ''}`}
                onClick={() => handleSectionClick(item.id)}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="client-dashboard__topbar-actions">
            <button type="button" className="client-dashboard__icon-btn" onClick={toggleDarkMode} title="Basculer le thème">
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button type="button" className="client-dashboard__icon-btn" onClick={() => handleSectionClick('support')} title="Support">
              <i className="fas fa-bell"></i>
            </button>
            <button type="button" className="client-dashboard__user-chip" onClick={() => handleSectionClick('profile')}>
              <div className="client-dashboard__user-avatar client-dashboard__user-avatar--small">
                {getInitials(profileForm.name || currentUser?.name)}
              </div>
              <div>
                <strong>{profileForm.name || currentUser?.name}</strong>
                <span>{profileForm.email || currentUser?.email}</span>
              </div>
            </button>
          </div>
        </header>

        <section className="client-dashboard__hero" id="overview">
          <div className="client-dashboard__hero-copy">
            <span className="client-dashboard__hero-badge">Dashboard client</span>
            <h1>Sales Overview orienté expérience client</h1>
            <p>
              Une refonte plus proche du visuel de référence&nbsp;: navigation horizontale, cartes KPI modernes,
              bloc performance, résumé des commandes et zone profil dans un style premium très épuré.
            </p>

            <div className="client-dashboard__hero-actions">
              <button type="button" className="client-dashboard__pill-btn" onClick={() => navigate('/home')}>
                <i className="fas fa-store"></i>
                Retour boutique
              </button>
              <button type="button" className="client-dashboard__pill-btn client-dashboard__pill-btn--primary" onClick={() => navigate('/payment')}>
                <i className="fas fa-credit-card"></i>
                Commander
              </button>
              <button type="button" className="client-dashboard__pill-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Déconnexion
              </button>
            </div>
          </div>

          <aside className="client-dashboard__hero-side">
            <div className="client-dashboard__hero-filter">Ce mois</div>
            <div className="client-dashboard__hero-user-card">
              <div className="client-dashboard__user-avatar">{getInitials(profileForm.name || currentUser?.name)}</div>
              <strong>{profileForm.name || currentUser?.name}</strong>
              <span>{getRoleLabel(currentUser?.role)}</span>
              <small>{profileForm.email || currentUser?.email}</small>
              <small>{profileForm.phone || 'Téléphone non renseigné'}</small>
            </div>
          </aside>
        </section>

        {error && <div className="client-dashboard__error">{error}</div>}

        <section className="client-dashboard__metrics-grid">
          {metricCards.map((card) => (
            <article
              key={card.label}
              className={`client-dashboard__metric-card ${card.accent === 'primary' ? 'client-dashboard__metric-card--primary' : ''}`}
            >
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.helper}</p>
              </div>
              <div className="client-dashboard__metric-icon">
                <i className={`fas ${card.icon}`}></i>
              </div>
            </article>
          ))}
        </section>

        <section className="client-dashboard__analytics-grid">
          <article className="client-dashboard__panel client-dashboard__panel--chart">
            <div className="client-dashboard__panel-head">
              <div>
                <h2>Performance Overview</h2>
                <p>Vue graphique de vos dernières commandes et de leurs montants.</p>
              </div>
              <button type="button" className="client-dashboard__panel-filter" onClick={() => handleSectionClick('orders')}>
                Cette semaine
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>

            <div className="client-dashboard__bar-chart">
              {performanceBars.map((bar) => (
                <div key={`${bar.label}-${bar.date}`} className="client-dashboard__bar-col">
                  <div className={`client-dashboard__bar-track ${bar.highlighted ? 'is-highlighted' : ''}`}>
                    <div
                      className={`client-dashboard__bar-fill ${bar.highlighted ? 'is-highlighted' : ''}`}
                      style={{ height: `${bar.height}%` }}
                      title={`${bar.label} · ${formatCurrency(bar.amount)}`}
                    >
                      <span className="client-dashboard__bar-tooltip">
                        <strong>{bar.label}</strong>
                        <small>{bar.date}</small>
                        <em>{formatCurrency(bar.amount)}</em>
                      </span>
                    </div>
                  </div>
                  <span className="client-dashboard__bar-label">{bar.label}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="client-dashboard__panel client-dashboard__panel--gauge">
            <div className="client-dashboard__panel-head client-dashboard__panel-head--compact">
              <div>
                <h2>Sales Overview</h2>
                <p>Progression de vos commandes traitées.</p>
              </div>
              <button type="button" className="client-dashboard__panel-menu" aria-label="Options">
                <i className="fas fa-ellipsis-h"></i>
              </button>
            </div>

            <div className="client-dashboard__gauge-wrap" style={{ '--gauge-value': `${Math.min(completionRate, 100)}` }}>
              <div className="client-dashboard__gauge">
                <div className="client-dashboard__gauge-inner">
                  <strong>{completionRate}%</strong>
                  <span>Commandes validées</span>
                </div>
              </div>
            </div>

            <div className="client-dashboard__gauge-stats">
              <article>
                <span>Nombre de commandes</span>
                <strong>{formatNumber(orderStats.total)}</strong>
                <small>{pendingRate}% en attente</small>
              </article>
              <article>
                <span>Total dépensé</span>
                <strong>{formatCurrency(totalSpent)}</strong>
                <small>{formatNumber(orderStats.completed)} validée(s)</small>
              </article>
            </div>
          </aside>
        </section>

        <section className="client-dashboard__orders-section client-dashboard__panel" id="orders">
          <div className="client-dashboard__panel-head client-dashboard__panel-head--table">
            <div>
              <h2>Recent orders</h2>
              <p>Suivez vos références, vos produits et le statut de traitement en un coup d’œil.</p>
            </div>

            <div className="client-dashboard__table-tools">
              <label className="client-dashboard__search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                />
              </label>

              <label className="client-dashboard__sort-box">
                <i className="fas fa-sliders-h"></i>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                  <option value="recent">Plus récentes</option>
                  <option value="amount-desc">Montant décroissant</option>
                  <option value="amount-asc">Montant croissant</option>
                  <option value="status">Par statut</option>
                </select>
              </label>
            </div>
          </div>

          <div className="client-dashboard__table-wrap">
            {displayedOrders.length === 0 ? (
              <div className="client-dashboard__empty-state client-dashboard__empty-state--large">
                Aucune commande ne correspond à votre recherche.
              </div>
            ) : (
              <table className="client-dashboard__table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Commande</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Articles</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order) => {
                    const firstProduct = order.produits?.[0]?.medicament || 'Commande pharmacie';
                    const itemsCount = order.produits?.length || order.items_count || 0;
                    const statusClass = statusToSlug(order.statut);

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="client-dashboard__table-product">
                            <div className="client-dashboard__table-product-icon">
                              <i className="fas fa-capsules"></i>
                            </div>
                            <div>
                              <strong>{firstProduct}</strong>
                              <span>{order.paiement || 'Paiement non défini'}</span>
                            </div>
                          </div>
                        </td>
                        <td>{order.numero}</td>
                        <td>{formatOrderDate(order.date)}</td>
                        <td>
                          <span className={`client-dashboard__status-badge status-${statusClass}`}>
                            {order.statut}
                          </span>
                        </td>
                        <td>{itemsCount}</td>
                        <td>{formatCurrency(order.total)}</td>
                        <td>
                          {canCancelOrder(order) ? (
                            <button
                              type="button"
                              className="client-dashboard__inline-btn"
                              disabled={isCancellingOrderId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              {isCancellingOrderId === order.id ? 'Annulation...' : 'Annuler'}
                            </button>
                          ) : (
                            <button type="button" className="client-dashboard__inline-btn client-dashboard__inline-btn--ghost" onClick={() => handleSectionClick('support')}>
                              Détail
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="client-dashboard__bottom-grid">
          <aside className="client-dashboard__panel client-dashboard__panel--stack" id="support">
            <div className="client-dashboard__panel-head">
              <div>
                <h2>Informations & assistance</h2>
                <p>Un bloc condensé pour retrouver les services essentiels du compte client.</p>
              </div>
            </div>

            <div className="client-dashboard__info-list">
              {infoItems.map((item) => (
                <div key={item.label} className="client-dashboard__info-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="client-dashboard__support-grid">
              {supportCards.map((card) => (
                <article key={card.title} className="client-dashboard__support-card">
                  <i className={`fas ${card.icon}`}></i>
                  <strong>{card.title}</strong>
                  <span>{card.text}</span>
                </article>
              ))}
            </div>

            <div className="client-dashboard__activity-box">
              <div className="client-dashboard__activity-head">
                <h3>Dernière activité</h3>
                <span>{recentOrders.length} élément(s)</span>
              </div>

>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
              <div className="client-dashboard__activity-list">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="client-dashboard__activity-item">
                      <div className="client-dashboard__activity-dot"></div>
                      <div>
                        <strong>{order.numero}</strong>
<<<<<<< HEAD
                        <p>{order.date} · {order.items_count} article(s)</p>
                      </div>
                      <span className={`client-dashboard__activity-status status-${(order.statut || '').toLowerCase().replace(/[^a-z]+/g, '-')}`}>
=======
                        <p>{formatOrderDate(order.date)} · {order.produits?.length || order.items_count || 0} article(s)</p>
                      </div>
                      <span className={`client-dashboard__status-badge status-${statusToSlug(order.statut)}`}>
>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
                        {order.statut}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="client-dashboard__empty-state">Aucune activité récente pour le moment.</div>
                )}
              </div>
            </div>
<<<<<<< HEAD
          </section>
        </aside>
      </section>

      <section className="client-dashboard__profile-panel glass-card">
        <div className="client-dashboard__section-head">
          <div>
            <h2>Mon profil</h2>
            <p>Vous pouvez modifier vos coordonnées et votre mot de passe.</p>
          </div>
        </div>

        <form className="client-dashboard__profile-form" onSubmit={handleProfileSubmit}>
          {profileError && <div className="client-dashboard__alert error">{profileError}</div>}
          {profileMessage && <div className="client-dashboard__alert success">{profileMessage}</div>}

          <div className="client-dashboard__form-grid">
            <div className="form-group">
              <label>Nom complet</label>
              <input className="form-control" name="name" value={profileForm.name} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input className="form-control" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label>Avatar (URL)</label>
              <input className="form-control" name="avatar" value={profileForm.avatar} onChange={handleProfileChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <textarea className="form-control" rows="3" name="address" value={profileForm.address} onChange={handleProfileChange} />
          </div>

          <div className="client-dashboard__password-box">
            <h3>Sécurité</h3>
            <div className="client-dashboard__form-grid">
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input className="form-control" type="password" name="current_password" value={profileForm.current_password} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input className="form-control" type="password" name="password" value={profileForm.password} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label>Confirmation</label>
                <input className="form-control" type="password" name="password_confirmation" value={profileForm.password_confirmation} onChange={handleProfileChange} />
              </div>
            </div>
          </div>

          <div className="client-dashboard__profile-actions">
            <button type="submit" className="client-dashboard__save-btn" disabled={isSavingProfile}>
              {isSavingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </section>
=======
          </aside>

          <section className="client-dashboard__panel client-dashboard__panel--profile" id="profile">
            <div className="client-dashboard__panel-head">
              <div>
                <h2>Mon profil</h2>
                <p>Modifiez vos coordonnées, votre avatar et vos informations de sécurité.</p>
              </div>
            </div>

            <form className="client-dashboard__profile-form" onSubmit={handleProfileSubmit}>
              {profileError && <div className="client-dashboard__alert error">{profileError}</div>}
              {profileMessage && <div className="client-dashboard__alert success">{profileMessage}</div>}

              <div className="client-dashboard__form-grid">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input className="form-control" name="name" value={profileForm.name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-control" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label>Avatar (URL)</label>
                  <input className="form-control" name="avatar" value={profileForm.avatar} onChange={handleProfileChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <textarea className="form-control" rows="3" name="address" value={profileForm.address} onChange={handleProfileChange} />
              </div>

              <div className="client-dashboard__security-box">
                <h3>Sécurité</h3>
                <div className="client-dashboard__form-grid">
                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input className="form-control" type="password" name="current_password" value={profileForm.current_password} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input className="form-control" type="password" name="password" value={profileForm.password} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label>Confirmation</label>
                    <input className="form-control" type="password" name="password_confirmation" value={profileForm.password_confirmation} onChange={handleProfileChange} />
                  </div>
                </div>
              </div>

              <div className="client-dashboard__profile-actions">
                <button type="submit" className="client-dashboard__save-btn" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </section>
        </section>
      </div>
>>>>>>> 4d92b36a61ee5f05e383ac13783e8fdaeebba5ed
    </div>
  );
};

export default ClientDashboard;
