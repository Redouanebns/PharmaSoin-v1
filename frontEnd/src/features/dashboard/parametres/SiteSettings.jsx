import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Settings, Type, Mail, Phone, MapPin, Image, Palette, ToggleLeft, Save } from 'lucide-react';
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

const SiteSettings = ({ currentUser, isDarkMode }) => {
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
    <div className={`site-settings-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="site-page-header">
        <div className="page-header-icon">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="header-title">Paramètres du Site</h1>
          <p className="header-subtitle">Personnalisez l’identité, les couleurs, l’inscription publique et les fonctionnalités globales.</p>
        </div>
      </div>

      <div className="site-settings-layout">
        <section className="site-settings-form">
          {loading ? (
            <div className="site-settings-state loading">
              <div className="spinner-border spinner-border-sm me-2"></div> Chargement des paramètres...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="site-settings-stack">
              {error && <div className="site-settings-alert error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
              {message && <div className="site-settings-alert success"><i className="fas fa-check-circle me-2"></i>{message}</div>}

              <div className="form-section-title">
                <Type size={20} />
                <h4>Identité Visuelle</h4>
              </div>

              <div className="site-settings-grid">
                <div className="custom-input-group">
                  <label>Nom du site</label>
                  <div className="input-with-icon">
                    <Type size={18} className="input-icon" />
                    <input name="site_name" className="custom-control" value={form.site_name} onChange={handleChange} placeholder="ex: PharmaSoin" />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>Slogan (Tagline)</label>
                  <div className="input-with-icon">
                    <Type size={18} className="input-icon" />
                    <input name="site_tagline" className="custom-control" value={form.site_tagline} onChange={handleChange} placeholder="Votre santé, notre priorité" />
                  </div>
                </div>
                <div className="custom-input-group site-settings-grid-span-2">
                  <label>URL du logo</label>
                  <div className="input-with-icon">
                    <Image size={18} className="input-icon" />
                    <input name="logo_url" className="custom-control" value={form.logo_url} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>Couleur principale</label>
                  <div className="input-with-icon">
                    <Palette size={18} className="input-icon" />
                    <input type="color" name="primary_color" className="custom-control form-control-color" value={form.primary_color || '#0f766e'} onChange={handleChange} />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>Couleur secondaire</label>
                  <div className="input-with-icon">
                    <Palette size={18} className="input-icon" />
                    <input type="color" name="secondary_color" className="custom-control form-control-color" value={form.secondary_color || '#134e4a'} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-section-divider"></div>

              <div className="form-section-title">
                <Mail size={20} />
                <h4>Informations de Contact</h4>
              </div>

              <div className="site-settings-grid">
                <div className="custom-input-group">
                  <label>Email de contact</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input type="email" name="contact_email" className="custom-control" value={form.contact_email} onChange={handleChange} placeholder="contact@pharmacie.com" />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>Téléphone de contact</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input name="contact_phone" className="custom-control" value={form.contact_phone} onChange={handleChange} placeholder="+212 5..." />
                  </div>
                </div>
                <div className="custom-input-group site-settings-grid-span-2">
                  <label>Adresse physique de la pharmacie</label>
                  <div className="input-with-icon align-top">
                    <MapPin size={18} className="input-icon" />
                    <textarea name="address" rows="2" className="custom-control" value={form.address} onChange={handleChange} placeholder="123 Rue de la Santé, Ville" />
                  </div>
                </div>
              </div>

              <div className="form-section-divider"></div>

              <div className="form-section-title">
                <Type size={20} />
                <h4>Bannière Accueil (Hero)</h4>
              </div>

              <div className="site-settings-grid">
                <div className="custom-input-group site-settings-grid-span-2">
                  <label>Titre principal (Hero)</label>
                  <div className="input-with-icon">
                    <Type size={18} className="input-icon" />
                    <input name="hero_title" className="custom-control" value={form.hero_title} onChange={handleChange} placeholder="Bienvenue sur notre parapharmacie en ligne" />
                  </div>
                </div>
                <div className="custom-input-group site-settings-grid-span-2">
                  <label>Sous-titre (Hero)</label>
                  <div className="input-with-icon align-top">
                    <Type size={18} className="input-icon" />
                    <textarea name="hero_subtitle" rows="3" className="custom-control" value={form.hero_subtitle} onChange={handleChange} placeholder="Un petit mot d'accueil pour vos clients..." />
                  </div>
                </div>
              </div>

              <div className="form-section-divider"></div>

              <div className="form-section-title">
                <ToggleLeft size={20} />
                <h4>Fonctionnalités & Accès</h4>
              </div>

              <div className="site-settings-toggle-grid">
                <label className="site-toggle-card">
                  <div className="toggle-switch">
                    <input type="checkbox" name="enable_registration" checked={Boolean(form.enable_registration)} onChange={handleChange} />
                    <span className="slider round"></span>
                  </div>
                  <div className="toggle-info">
                    <strong>Inscription publique</strong>
                    <span>Autoriser la création de compte depuis le site public.</span>
                  </div>
                </label>
                <label className="site-toggle-card">
                  <div className="toggle-switch">
                    <input type="checkbox" name="enable_google_auth" checked={Boolean(form.enable_google_auth)} onChange={handleChange} />
                    <span className="slider round"></span>
                  </div>
                  <div className="toggle-info">
                    <strong>Connexion Google</strong>
                    <span>Afficher le bouton de connexion Google.</span>
                  </div>
                </label>
              </div>

              <div className="site-settings-actions">
                <button type="submit" className="site-settings-save-btn" disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Sauvegarde...</>
                  ) : (
                    <><Save size={18} className="me-2" />Sauvegarder les paramètres</>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="site-preview-card">
          <span className="site-preview-badge"><Settings size={14} className="me-1"/> Aperçu</span>
          <div className="site-preview-header" style={{ background: `linear-gradient(135deg, ${form.primary_color || '#0f766e'}, ${form.secondary_color || '#134e4a'})` }}>
            <h3>{form.site_name || 'PharmaSoin'}</h3>
            <p>{form.site_tagline || 'Votre santé, notre priorité'}</p>
          </div>
          <div className="site-preview-body">
            <h4>{form.hero_title || 'Gestion moderne de pharmacie'}</h4>
            <p className="subtitle-preview">{form.hero_subtitle || 'Centralisez vos opérations et vos parcours utilisateurs.'}</p>
            <div className="preview-info-list">
              <div className="preview-info-item">
                <Mail size={16} /> <span>{form.contact_email || '—'}</span>
              </div>
              <div className="preview-info-item">
                <Phone size={16} /> <span>{form.contact_phone || '—'}</span>
              </div>
              <div className="preview-info-item">
                <MapPin size={16} /> <span>{form.address || '—'}</span>
              </div>
            </div>
            
            <div className="preview-features">
              <div className={`feature-pill ${form.enable_registration ? 'active' : ''}`}>
                Inscription {form.enable_registration ? 'OUI' : 'NON'}
              </div>
              <div className={`feature-pill ${form.enable_google_auth ? 'active' : ''}`}>
                Google {form.enable_google_auth ? 'OUI' : 'NON'}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SiteSettings;
