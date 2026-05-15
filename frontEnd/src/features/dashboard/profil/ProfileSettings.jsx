import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { getRoleLabel, setAuthSession } from '../../../utils/auth';
import { User, Mail, Phone, MapPin, Image, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import './ProfileSettings.css';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  current_password: '',
  password: '',
  password_confirmation: '',
};

const ProfileSettings = ({ currentUser, isDarkMode }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        if (!isMounted) return;
        const user = response.data?.user || currentUser;
        setForm((previous) => ({
          ...previous,
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || '',
          avatar: user?.avatar || '',
        }));
      } catch (requestError) {
        if (!isMounted) return;
        console.error(requestError);
        setError('Impossible de charger votre profil.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await api.put('/profile', form);
      const user = response.data?.user;
      const token = localStorage.getItem('pharma_auth_token');
      if (token) {
        setAuthSession(token, user);
      }
      setMessage(response.data?.message || 'Profil mis à jour avec succès.');
      setForm((previous) => ({ ...previous, current_password: '', password: '', password_confirmation: '' }));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (requestError) {
      console.error(requestError);
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError || 'Impossible de mettre à jour le profil.');
      } else {
        setError(requestError.response?.data?.message || 'Impossible de mettre à jour le profil.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`profile-settings-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="profile-page-header">
        <div className="page-header-icon">
          <User size={28} />
        </div>
        <div>
          <h1 className="header-title">Mon Profil</h1>
          <p className="header-subtitle">Modifiez vos informations personnelles, votre avatar et votre mot de passe de sécurité.</p>
        </div>
      </div>

      <div className="profile-settings-grid">
        <section className="profile-summary-card">
          <div className="profile-summary-avatar">
            {form.avatar ? <img src={form.avatar} alt={form.name} /> : <span>{(form.name || 'U').slice(0, 1).toUpperCase()}</span>}
          </div>
          <h3>{form.name || 'Utilisateur'}</h3>
          <p>{form.email}</p>
          <span className="profile-role-badge">
            <ShieldCheck size={16} className="me-1" />
            {getRoleLabel(currentUser?.role)}
          </span>
          <div className="profile-summary-details">
            <div className="detail-item">
              <Phone size={16} />
              <span>{form.phone || 'Non renseigné'}</span>
            </div>
            <div className="detail-item">
              <MapPin size={16} />
              <span>{form.address || 'Non renseigné'}</span>
            </div>
          </div>
        </section>

        <section className="profile-form-card">
          {loading ? (
            <div className="profile-state-message loading">
              <div className="spinner-border spinner-border-sm me-2"></div> Chargement de vos informations...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form-layout">
              {error && <div className="profile-alert error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
              {message && <div className="profile-alert success"><i className="fas fa-check-circle me-2"></i>{message}</div>}

              <div className="form-section-title">
                <User size={20} />
                <h4>Informations générales</h4>
              </div>

              <div className="profile-form-grid">
                <div className="custom-input-group">
                  <label>Nom complet</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input name="name" className="custom-control" value={form.name} onChange={handleChange} required placeholder="Votre nom complet" />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>Email professionnel</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input type="email" name="email" className="custom-control" value={form.email} onChange={handleChange} required placeholder="exemple@pharmasoin.com" />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>Téléphone</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input name="phone" className="custom-control" value={form.phone} onChange={handleChange} placeholder="+212 6..." />
                  </div>
                </div>
                <div className="custom-input-group">
                  <label>URL de l'avatar</label>
                  <div className="input-with-icon">
                    <Image size={18} className="input-icon" />
                    <input name="avatar" className="custom-control" value={form.avatar} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="custom-input-group full-width">
                <label>Adresse physique</label>
                <div className="input-with-icon align-top">
                  <MapPin size={18} className="input-icon" />
                  <textarea name="address" className="custom-control" rows="3" value={form.address} onChange={handleChange} placeholder="Votre adresse complète" />
                </div>
              </div>

              <div className="profile-password-box">
                <div className="form-section-title">
                  <KeyRound size={20} />
                  <h4>Sécurité et mot de passe</h4>
                </div>
                <div className="profile-form-grid">
                  <div className="custom-input-group">
                    <label>Mot de passe actuel</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon text-muted" />
                      <input type="password" name="current_password" className="custom-control" value={form.current_password} onChange={handleChange} placeholder="Requis pour modifier" />
                    </div>
                  </div>
                  <div className="custom-input-group">
                    <label>Nouveau mot de passe</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon text-success" />
                      <input type="password" name="password" className="custom-control" value={form.password} onChange={handleChange} placeholder="Nouveau mot de passe" />
                    </div>
                  </div>
                  <div className="custom-input-group">
                    <label>Confirmer le mot de passe</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon text-success" />
                      <input type="password" name="password_confirmation" className="custom-control" value={form.password_confirmation} onChange={handleChange} placeholder="Retapez le mot de passe" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                  ) : (
                    <><ShieldCheck size={18} className="me-2" />Enregistrer les modifications</>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
