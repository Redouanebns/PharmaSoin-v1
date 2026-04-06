import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Accueil from './features/accueil/Accueil';
import Authentification from './features/authentification/Authentification';
import Dashboard from './features/dashboard/Dashboard';
import Paiement from './features/paiement/Paiement';
import { CartProvider } from './context/CartContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function AppRoutes({ isDarkMode, toggleDarkMode, searchQuery, setSearchQuery }) {
  const location = useLocation();
  const shouldEnableDarkMode = isDarkMode && location.pathname !== '/';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', shouldEnableDarkMode);
  }, [shouldEnableDarkMode]);

  return (
    <Routes>
      <Route path="/" element={<Accueil searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />

      <Route
        path="/authentification"
        element={<Authentification isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/dashboard/*"
        element={
          <Dashboard
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
      />

      <Route path="/payment" element={<Paiement isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <CartProvider>
      <Router>
        <AppRoutes
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </Router>
    </CartProvider>
  );
}
