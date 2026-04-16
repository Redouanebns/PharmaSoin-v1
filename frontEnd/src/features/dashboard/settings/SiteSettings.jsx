import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import PageHero from '../shared/PageHero';
import './SiteSettings.css';

const defaultSettings = {
  site_name: '',
  site_tagline: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  logo_url: '',
  primary_color: '#0f766e',
  secondary_color: '#134e4a',
  hero_title: '',
  hero_subtitle: '',
  enable_registration: true,
  enable_google_auth: true,
};

const SiteSettings = ({ currentUser, isDarkMode, toggleDarkMode }) => {
  const [form, setForm] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/site-settings');
        setForm((previous) => ({ ...previous, ...(response.data?.settings || {}) }));
      } catch (requestError) {
        console.error(requestError);
        setError('Impossible de charger les paramètres du site.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await api.put('/site-settings', { settings: form });
      setForm((previous) => ({ ...previous, ...(response.data?.settings || {}) }));
      setMessage(response.data?.message || 'Paramètres mis à jour.');
    } catch (requestError) {
      console.error(requestError);
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError || 'Impossible de sauvegarder les paramètres.');
      } else {
        setError(requestError.response?.data?.message || 'Impossible de sauvegarder les paramètres.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="site-settings-page">
      <PageHero
        title="Paramètres du site"
        description="Personnalisez l’identité, les couleurs, l’inscription publique et la connexion Google depuis le backend."
        icon="fas fa-sliders-h"
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        adminLabel={currentUser?.name}
      />

      <div className="site-settings-layout">
        <section className="site-settings-form glass-card">
          {loading ? (
            <div className="site-settings-state">Chargement des paramètres...</div>
          ) : (
            <form onSubmit={handleSubmit} className="site-settings-stack">
              {error && <div className="site-settings-alert error">{error}</div>}
              {message && <div className="site-settings-alert success">{message}</div>}

              <div className="site-settings-grid">
                <div className="form-group">
                  <label>Nom du site</label>
                  <input name="site_name" className="form-control" value={form.site_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Slogan</label>
                  <input name="site_tagline" className="form-control" value={form.site_tagline} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Email contact</label>
                  <input type="email" name="contact_email" className="form-control" value={form.contact_email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Téléphone contact</label>
                  <input name="contact_phone" className="form-control" value={form.contact_phone} onChange={handleChange} />
                </div>
                <div className="form-group site-settings-grid-span-2">
                  <label>Adresse</label>
                  <input name="address" className="form-control" value={form.address} onChange={handleChange} />
                </div>
                <div className="form-group site-settings-grid-span-2">
                  <label>URL du logo</label>
                  <input name="logo_url" className="form-control" value={form.logo_url} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Couleur principale</label>
                  <input type="color" name="primary_color" className="form-control form-control-color" value={form.primary_color || '#0f766e'} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Couleur secondaire</label>
                  <input type="color" name="secondary_color" className="form-control form-control-color" value={form.secondary_color || '#134e4a'} onChange={handleChange} />
                </div>
                <div className="form-group site-settings-grid-span-2">
                  <label>Titre hero</label>
                  <input name="hero_title" className="form-control" value={form.hero_title} onChange={handleChange} />
                </div>
                <div className="form-group site-settings-grid-span-2">
                  <label>Sous-titre hero</label>
                  <textarea name="hero_subtitle" rows="4" className="form-control" value={form.hero_subtitle} onChange={handleChange} />
                </div>
              </div>

              <div className="site-settings-toggle-grid">
                <label className="site-toggle-card">
                  <input type="checkbox" name="enable_registration" checked={Boolean(form.enable_registration)} onChange={handleChange} />
                  <div>
                    <strong>Inscription publique</strong>
                    <span>Autoriser la création de compte depuis le front.</span>
                  </div>
                </label>
                <label className="site-toggle-card">
                  <input type="checkbox" name="enable_google_auth" checked={Boolean(form.enable_google_auth)} onChange={handleChange} />
                  <div>
                    <strong>Connexion Google</strong>
                    <span>Afficher le bouton Google sur la page d’authentification.</span>
                  </div>
                </label>
              </div>

              <div className="site-settings-actions">
                <button type="submit" className="site-settings-save-btn" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="site-preview-card glass-card">
          <span className="site-preview-badge">Aperçu</span>
          <div className="site-preview-header" style={{ background: `linear-gradient(135deg, ${form.primary_color || '#0f766e'}, ${form.secondary_color || '#134e4a'})` }}>
            <h3>{form.site_name || 'PharmaSoin'}</h3>
            <p>{form.site_tagline || 'Votre santé, notre priorité'}</p>
          </div>
          <div className="site-preview-body">
            <h4>{form.hero_title || 'Gestion moderne de pharmacie'}</h4>
            <p>{form.hero_subtitle || 'Centralisez vos opérations et vos parcours utilisateurs.'}</p>
            <ul>
              <li><strong>Email :</strong> {form.contact_email || '—'}</li>
              <li><strong>Téléphone :</strong> {form.contact_phone || '—'}</li>
              <li><strong>Adresse :</strong> {form.address || '—'}</li>
              <li><strong>Inscription :</strong> {form.enable_registration ? 'Activée' : 'Désactivée'}</li>
              <li><strong>Google :</strong> {form.enable_google_auth ? 'Activée' : 'Désactivée'}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SiteSettings;
