import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Accueil from './features/accueil/Accueil';
import AuthCallback from './features/authentification/AuthCallback';
import Authentification from './features/authentification/Authentification';
import ClientDashboard from './features/dashboard/client/ClientDashboard';
import Dashboard from './features/dashboard/Dashboard';
import Paiement from './features/paiement/Paiement';
import { CartProvider } from './context/CartContext';
import api from './services/api';
import BrandLoader from './components/BrandLoader';
import { clearAuthSession, getAuthToken, getStoredUser, resolveDefaultRoute, setAuthSession } from './utils/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function ProtectedRoute({ authReady, currentUser, allowRoles, children }) {
  const location = useLocation();

  if (!authReady) {
    return (
      <BrandLoader
        title="Connexion sécurisée"
        message="Vérification de votre session et préparation de votre espace..."
        kicker="Authentification"
      />
    );
  }

  if (!currentUser) {
    return <Navigate to="/authentification" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (allowRoles?.length && !allowRoles.includes(currentUser.role)) {
    return <Navigate to={resolveDefaultRoute(currentUser)} replace />;
  }

  return children;
}

function AppRoutes({
  authReady,
  currentUser,
  isDarkMode,
  onAuthenticated,
  onLogout,
  searchQuery,
  setSearchQuery,
  toggleDarkMode,
}) {
  const authLoader = (
    <BrandLoader
      title="Connexion sécurisée"
      message="Vérification de votre session et préparation de votre espace..."
      kicker="Authentification"
    />
  );
  const location = useLocation();
  const shouldEnableDarkMode = isDarkMode && location.pathname !== '/';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', shouldEnableDarkMode);
  }, [shouldEnableDarkMode]);

  const homeElement = useMemo(
    () => <Accueil searchQuery={searchQuery} setSearchQuery={setSearchQuery} />,
    [searchQuery, setSearchQuery],
  );

  return (
    <Routes>
      <Route path="/" element={homeElement} />
      <Route
        path="/authentification"
        element={
          !authReady ? (
            authLoader
          ) : currentUser ? (
            <Navigate to={resolveDefaultRoute(currentUser)} replace />
          ) : (
            <Authentification
              isDarkMode={isDarkMode}
              onAuthenticated={onAuthenticated}
            />
          )
        }
      />
      <Route
        path="/auth/callback"
        element={<AuthCallback onAuthenticated={onAuthenticated} />}
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute authReady={authReady} currentUser={currentUser} allowRoles={['admin', 'pharmacien']}>
            <Dashboard
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              onLogout={onLogout}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              toggleDarkMode={toggleDarkMode}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-dashboard"
        element={
          <ProtectedRoute authReady={authReady} currentUser={currentUser} allowRoles={['client']}>
            <ClientDashboard
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              onLogout={onLogout}
              onAuthenticated={onAuthenticated}
              toggleDarkMode={toggleDarkMode}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute authReady={authReady} currentUser={currentUser} allowRoles={['client']}>
            <Paiement currentUser={currentUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to={currentUser ? resolveDefaultRoute(currentUser) : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getAuthToken();
      const storedUser = getStoredUser();

      if (!token) {
        setCurrentUser(null);
        setAuthReady(true);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const user = response.data?.user || storedUser;
        setAuthSession(token, user);
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        clearAuthSession();
        setCurrentUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser) {
      return undefined;
    }

    let cancelled = false;

    const validateSession = async () => {
      const token = getAuthToken();

      if (!token) {
        clearAuthSession();
        setCurrentUser(null);
        return;
      }

      try {
        const response = await api.get('/auth/me');

        if (cancelled) {
          return;
        }

        const user = response.data?.user || currentUser;
        setAuthSession(token, user);
        setCurrentUser(user);
      } catch (error) {
        console.error(error);

        if (cancelled) {
          return;
        }

        clearAuthSession();
        setCurrentUser(null);
      }
    };

    const intervalId = window.setInterval(validateSession, 5000);
    const handleWindowFocus = () => {
      validateSession();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateSession();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authReady, currentUser?.id, currentUser?.role]);

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    setAuthReady(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthSession();
      setCurrentUser(null);
    }
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <CartProvider>
      <Router>
        <AppRoutes
          authReady={authReady}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          onAuthenticated={handleAuthenticated}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleDarkMode={toggleDarkMode}
        />
      </Router>
    </CartProvider>
  );
}
