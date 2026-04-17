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

  return (
    <div className={`client-dashboard ${isDarkMode ? 'dark-mode' : ''}`}>
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
              <div className="client-dashboard__activity-list">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="client-dashboard__activity-item">
                      <div className="client-dashboard__activity-dot"></div>
                      <div>
                        <strong>{order.numero}</strong>
                        <p>{order.date} · {order.items_count} article(s)</p>
                      </div>
                      <span className={`client-dashboard__activity-status status-${(order.statut || '').toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                        {order.statut}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="client-dashboard__empty-state">Aucune activité récente pour le moment.</div>
                )}
              </div>
            </div>
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
    </div>
  );
};

export default ClientDashboard;
