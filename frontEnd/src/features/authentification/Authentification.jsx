import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { backendBaseURL } from '../../services/api';
import { resolveDefaultRoute, setAuthSession } from '../../utils/auth';
import './Authentification.css';

const initialLoginState = {
  email: '',
  password: '',
};

const initialRegisterState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'client',
  password: '',
  password_confirmation: '',
};

const resolveModeFromQuery = (search = '') => {
  const params = new URLSearchParams(search);
  return params.get('mode') === 'register' ? 'register' : 'login';
};

const Authentification = ({ isDarkMode, onAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(() => resolveModeFromQuery(window.location.search));
  const [loginData, setLoginData] = useState(initialLoginState);
  const [registerData, setRegisterData] = useState(initialRegisterState);
  const [publicSettings, setPublicSettings] = useState({
    site_name: 'PharmaSoin',
    site_tagline: 'Votre santé, notre priorité',
    hero_title: 'Gestion moderne de pharmacie',
    hero_subtitle: 'Connectez votre équipe, vos clients et vos paramètres site dans une seule plateforme.',
    enable_registration: true,
    enable_google_auth: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setMode(resolveModeFromQuery(location.search));
  }, [location.search]);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await api.get('/site-settings/public');
        setPublicSettings((previous) => ({ ...previous, ...(response.data?.settings || {}) }));
      } catch (requestError) {
        console.error(requestError);
      }
    };

    fetchPublicSettings();
  }, []);

  const roleOptions = useMemo(
    () => [
      { value: 'admin', label: 'Admin', description: 'Accès complet au dashboard et aux paramètres.' },
      { value: 'pharmacien', label: 'Pharmacien', description: 'Accès opérationnel limité avec interface dédiée.' },
      { value: 'client', label: 'Client', description: 'Accès à un tableau client séparé.' },
    ],
    [],
  );

  const handleLoginChange = (event) => {
    setLoginData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError('');
    setSuccess('');
  };

  const handleRegisterChange = (event) => {
    setRegisterData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError('');
    setSuccess('');
  };

  const handleApiSuccess = (payload, isRegistration = false) => {
    const { token, user, message } = payload || {};
    const redirectTarget = typeof location.state?.from === 'string' ? location.state.from : resolveDefaultRoute(user);
    setAuthSession(token, user);
    onAuthenticated?.(user);
    setSuccess(message || (isRegistration ? 'Inscription réussie.' : 'Connexion réussie.'));
    navigate(redirectTarget, { replace: true });
  };

  const switchMode = (nextMode) => {
    const params = new URLSearchParams(location.search);

    if (nextMode === 'register') {
      params.set('mode', 'register');
    } else {
      params.delete('mode');
    }

    const query = params.toString();
    navigate(`/authentification${query ? `?${query}` : ''}`, { replace: true });
  };

  const handleSubmitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/login', loginData);
      handleApiSuccess(response.data, false);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/register', {
        ...registerData,
        password_confirmation: registerData.password_confirmation,
      });
      handleApiSuccess(response.data, true);
    } catch (requestError) {
      console.error(requestError);
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0];
        setError(firstError || 'Impossible de créer le compte.');
      } else {
        setError(requestError.response?.data?.message || 'Impossible de créer le compte.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendBaseURL}/auth/google/redirect?frontend_url=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <div className={`auth-page ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <i className="fas fa-clinic-medical"></i>
          </div>
          <div>
            <h1>{publicSettings.site_name || 'PharmaSoin'}</h1>
            <p>{publicSettings.site_tagline || 'Votre santé, notre priorité'}</p>
          </div>
        </div>

        <div className="auth-hero-copy">
          <span className="auth-badge">Plateforme connectée</span>
          <h2>{publicSettings.hero_title || 'Gestion moderne de pharmacie'}</h2>
          <p>{publicSettings.hero_subtitle || 'Centralisez le stock, les ventes, les utilisateurs et les paramètres.'}</p>
        </div>

        <div className="auth-illustration">
          <div className="auth-feature">
            <i className="fas fa-user-shield"></i>
            <div>
              <strong>Authentification sécurisée</strong>
              <p>Connexion par mot de passe hashé et support Google.</p>
            </div>
          </div>
          <div className="auth-feature">
            <i className="fas fa-user-tag"></i>
            <div>
              <strong>Trois rôles</strong>
              <p>Admin, pharmacien et client avec des espaces dédiés.</p>
            </div>
          </div>
          <div className="auth-feature">
            <i className="fas fa-sliders-h"></i>
            <div>
              <strong>Paramètres centralisés</strong>
              <p>Les réglages du site sont pilotés depuis le backend.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left me-2"></i>
            Retour à l'accueil
          </button>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Connexion
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
              disabled={!publicSettings.enable_registration}
            >
              Inscription
            </button>
          </div>

          <div className="auth-header">
            <div className="auth-icon">
              <i className={`fas ${mode === 'login' ? 'fa-lock-open' : 'fa-user-plus'}`}></i>
            </div>
            <h2>{mode === 'login' ? 'Connexion sécurisée' : 'Créer un compte'}</h2>
            <p>
              {mode === 'login'
                ? 'Accédez à votre tableau de bord selon votre rôle.'
                : 'Ajoutez un compte admin, pharmacien ou client depuis le backend d’authentification.'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmitLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Adresse email</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  className="form-control auth-input"
                  placeholder="admin@pharmacy.test"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  className="form-control auth-input"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="auth-demo-accounts">
                <span>Comptes de démonstration :</span>
                <small>admin@pharmacy.test · pharmacien@pharmacy.test · client@pharmacy.test</small>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitRegister} className="auth-form">
              <div className="auth-form-grid auth-form-grid--double">
                <div className="form-group">
                  <label htmlFor="register-name">Nom complet</label>
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    className="form-control auth-input"
                    placeholder="Nom complet"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Adresse email</label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    className="form-control auth-input"
                    placeholder="utilisateur@pharmacy.test"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-phone">Téléphone</label>
                  <input
                    type="text"
                    id="register-phone"
                    name="phone"
                    className="form-control auth-input"
                    placeholder="+212600000000"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-role">Rôle</label>
                  <select
                    id="register-role"
                    name="role"
                    className="form-select auth-input"
                    value={registerData.role}
                    onChange={handleRegisterChange}
                    required
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-address">Adresse</label>
                <textarea
                  id="register-address"
                  name="address"
                  className="form-control auth-input auth-textarea"
                  placeholder="Adresse du compte"
                  value={registerData.address}
                  onChange={handleRegisterChange}
                  rows="3"
                />
              </div>

              <div className="auth-role-grid">
                {roleOptions.map((role) => (
                  <label key={role.value} className={`auth-role-card ${registerData.role === role.value ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={registerData.role === role.value}
                      onChange={handleRegisterChange}
                    />
                    <strong>{role.label}</strong>
                    <span>{role.description}</span>
                  </label>
                ))}
              </div>

              <div className="auth-form-grid auth-form-grid--double">
                <div className="form-group">
                  <label htmlFor="register-password">Mot de passe</label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    className="form-control auth-input"
                    placeholder="Minimum 8 caractères"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password-confirmation">Confirmation</label>
                  <input
                    type="password"
                    id="register-password-confirmation"
                    name="password_confirmation"
                    className="form-control auth-input"
                    placeholder="Confirmez le mot de passe"
                    value={registerData.password_confirmation}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={loading || !publicSettings.enable_registration}>
                {loading ? 'Création du compte...' : 'Créer le compte'}
              </button>
            </form>
          )}

          <div className="auth-divider"><span>ou</span></div>

          <button
            type="button"
            className="btn-google-auth"
            onClick={handleGoogleLogin}
            disabled={!publicSettings.enable_google_auth}
          >
            <i className="fab fa-google"></i>
            Continuer avec Google
          </button>

          <div className="auth-footer-note">
            <i className="fas fa-info-circle me-1"></i>
            <small>
              L’inscription publique est {publicSettings.enable_registration ? 'activée' : 'désactivée'} et la connexion Google est{' '}
              {publicSettings.enable_google_auth ? 'activée' : 'désactivée'}.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentification;
