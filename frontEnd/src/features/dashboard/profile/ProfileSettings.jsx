import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { getRoleLabel, setAuthSession } from '../../../utils/auth';
import PageHero from '../shared/PageHero';
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

const ProfileSettings = ({ currentUser, isDarkMode, toggleDarkMode, onProfileUpdated }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
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
        console.error(requestError);
        setError('Impossible de charger votre profil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

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
      onProfileUpdated?.(user);
      setMessage(response.data?.message || 'Profil mis à jour avec succès.');
      setForm((previous) => ({ ...previous, current_password: '', password: '', password_confirmation: '' }));
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
    <div className="profile-settings-page">
      <PageHero
        title="Mon profil"
        description="Modifiez vos informations personnelles, votre avatar et votre mot de passe depuis le backend."
        icon="fas fa-id-card"
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        adminLabel={currentUser?.name}
      />

      <div className="profile-settings-grid">
        <section className="profile-summary-card glass-card">
          <div className="profile-summary-avatar">
            {form.avatar ? <img src={form.avatar} alt={form.name} /> : <span>{(form.name || 'U').slice(0, 1).toUpperCase()}</span>}
          </div>
          <h3>{form.name || 'Utilisateur'}</h3>
          <p>{form.email}</p>
          <span className="profile-role-badge">{getRoleLabel(currentUser?.role)}</span>
          <ul>
            <li><strong>Téléphone :</strong> {form.phone || '—'}</li>
            <li><strong>Adresse :</strong> {form.address || '—'}</li>
          </ul>
        </section>

        <section className="profile-form-card glass-card">
          {loading ? (
            <div className="profile-state-message">Chargement du profil...</div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form-layout">
              {error && <div className="profile-alert error">{error}</div>}
              {message && <div className="profile-alert success">{message}</div>}

              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Avatar (URL)</label>
                  <input name="avatar" className="form-control" value={form.avatar} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <textarea name="address" className="form-control" rows="3" value={form.address} onChange={handleChange} />
              </div>

              <div className="profile-password-box">
                <h4>Changer le mot de passe</h4>
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input type="password" name="current_password" className="form-control" value={form.current_password} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Confirmation</label>
                    <input type="password" name="password_confirmation" className="form-control" value={form.password_confirmation} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
