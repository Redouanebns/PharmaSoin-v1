import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Authentification.css';

const Authentification = ({ isDarkMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation d'authentification — à connecter à l'API Laravel
      // const response = await axios.post('/api/login', formData);
      // localStorage.setItem('token', response.data.token);

      // Vérification simple pour la démo
      if (formData.email && formData.password) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setError('Veuillez remplir tous les champs.');
        setLoading(false);
      }
    } catch (err) {
      setError('Identifiants incorrects. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="auth-left">
        <div className="auth-brand">
          <img
            src="/assets/images/logo.png"
            alt="PharmaSoin"
            className="auth-logo"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <h1>
            Pharma<span>Soin</span>
          </h1>
        </div>
        <div className="auth-illustration">
          <div className="auth-feature">
            <i className="fas fa-shield-alt"></i>
            <div>
              <strong>Sécurisé</strong>
              <p>Vos données sont protégées</p>
            </div>
          </div>
          <div className="auth-feature">
            <i className="fas fa-chart-line"></i>
            <div>
              <strong>Tableau de bord</strong>
              <p>Gérez votre pharmacie facilement</p>
            </div>
          </div>
          <div className="auth-feature">
            <i className="fas fa-pills"></i>
            <div>
              <strong>Stocks</strong>
              <p>Suivez vos médicaments en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left me-2"></i>Retour à l'accueil
          </button>

          <div className="auth-header">
            <div className="auth-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <h2>Connexion</h2>
            <p>Accédez à votre espace professionnel</p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope me-2"></i>Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control auth-input"
                placeholder="admin@pharmasoin.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock me-2"></i>Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control auth-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="forgot-password">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-note">
            <i className="fas fa-info-circle me-1 text-muted"></i>
            <small className="text-muted">
              Accès réservé au personnel autorisé de la pharmacie.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentification;
