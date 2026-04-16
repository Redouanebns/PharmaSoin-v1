import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { resolveDefaultRoute, setAuthSession } from '../../utils/auth';
import './Authentification.css';

const AuthCallback = ({ onAuthenticated }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Finalisation de la connexion Google...');
  const [error, setError] = useState('');

  useEffect(() => {
    const finishGoogleLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      const token = params.get('token');
      const callbackMessage = params.get('message');

      if (status !== 'success' || !token) {
        setError(callbackMessage || 'La connexion Google a échoué.');
        return;
      }

      try {
        setAuthSession(token, null);
        const response = await api.get('/auth/me');
        const user = response.data?.user;
        setAuthSession(token, user);
        onAuthenticated?.(user);
        setMessage('Connexion réussie, redirection en cours...');
        navigate(resolveDefaultRoute(user), { replace: true });
      } catch (requestError) {
        console.error(requestError);
        setError('Impossible de récupérer votre profil après la connexion Google.');
      }
    };

    finishGoogleLogin();
  }, [navigate, onAuthenticated]);

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-feedback-card glass-card">
        <div className="auth-icon">
          <i className={`fas ${error ? 'fa-exclamation-triangle' : 'fa-circle-notch fa-spin'}`}></i>
        </div>
        <h2>{error ? 'Connexion interrompue' : 'Connexion Google'}</h2>
        <p>{error || message}</p>
        {error && (
          <button type="button" className="btn-auth-submit" onClick={() => navigate('/authentification?mode=login', { replace: true })}>
            Retour à la connexion
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
