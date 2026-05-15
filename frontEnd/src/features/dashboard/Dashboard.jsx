import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CategorieList from './categories/CategorieList';
import MedicineList from './medicaments/MedicineList';
import CommandesList from './commandes/CommandesList';
import Ordonnances from './ordonnances/Ordonnances';
import ProfileSettings from './profil/ProfileSettings';
import Sidebar from './sidebar/Sidebar';
import SiteSettings from './parametres/SiteSettings';
import Statistic from './statistiques/Statistic';
import StockAlertes from './stock/StockAlertes';
import StockEntrees from './stock/StockEntrees';
import StockExpiredProducts from './stock/StockExpiredProducts';
import StockSorties from './stock/StockSorties';
import FournisseurList from './fournisseurs/FournisseurList';
import TransactionsList from './transactions/TransactionsList';
import VentesList from './ventes/VentesList';
import UtilisateursList from './utilisateurs/UtilisateursList';
import BrandLoader from '../../components/BrandLoader';
import { getInitials, getRoleLabel } from '../../utils/auth';
import './Dashboard.css';

const Dashboard = ({ currentUser, isDarkMode, onLogout, searchQuery, setSearchQuery, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entryLoaderVisible, setEntryLoaderVisible] = useState(true);

  const isAdmin = currentUser?.role === 'admin';
  const dashboardTitle = isAdmin ? 'Tableau de bord administration' : 'Espace pharmacien';
  const dashboardSubtitle = isAdmin
    ? 'Pilotage complet, ventes comptoir/en ligne et supervision globale.'
    : 'Suivi opérationnel, validation des commandes web et interface pharmacien dédiée.';

  const routeConfigs = useMemo(() => {
    const commonRoutes = [
      { path: 'stats', element: <Statistic currentUser={currentUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'medicines', element: <MedicineList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'ordonnances', element: <Ordonnances isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'ventes', element: <VentesList saleType="counter" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'ventes-en-ligne', element: <VentesList saleType="online" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'stock/entrees', element: <StockEntrees isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'stock/sorties', element: <StockSorties isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'stock/alertes', element: <StockAlertes isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'stock/perimes', element: <StockExpiredProducts isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      {
        path: 'profile',
        element: (
          <ProfileSettings
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            onProfileUpdated={() => window.location.reload()}
            toggleDarkMode={toggleDarkMode}
          />
        ),
      },
    ];

    if (!isAdmin) {
      return commonRoutes;
    }

    return [
      ...commonRoutes,
      { path: 'categories', element: <CategorieList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'suppliers', element: <FournisseurList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'users', element: <UtilisateursList currentUser={currentUser} isDarkMode={isDarkMode} /> },
      { path: 'commandes', element: <CommandesList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'transactions', element: <TransactionsList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
      { path: 'settings', element: <SiteSettings currentUser={currentUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> },
    ];
  }, [currentUser, isAdmin, isDarkMode, toggleDarkMode]);

  const defaultRoute = routeConfigs[0]?.path || 'stats';

  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntryLoaderVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const handleLogout = async () => {
    await onLogout?.();
    navigate('/authentification', { replace: true });
  };

  if (entryLoaderVisible) {
    return (
      <BrandLoader
        title={dashboardTitle}
        message="Préparation de votre tableau de bord et chargement des modules métier..."
        kicker="Dashboard"
      />
    );
  }

  return (
    <div className={`dashboard-full-layout role-${currentUser?.role || 'admin'} ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDeconnexion={handleLogout}
      />

      <div className="dashboard-main">
        <div className="dashboard-header-shell" ref={dropdownRef}>
          <header className="dashboard-topbar glass-card">
            <div className="topbar-left">
              <button type="button" className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
                <i className="fas fa-bars"></i>
              </button>
              <div>
                <h4 className="topbar-title">{dashboardTitle}</h4>
                <p className="topbar-subtitle">{dashboardSubtitle}</p>
              </div>
            </div>

            <div className="topbar-right">
              {searchQuery !== undefined && (
                <div className="topbar-search">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Rechercher dans le dashboard..."
                    value={searchQuery || ''}
                    onChange={(event) => setSearchQuery?.(event.target.value)}
                  />
                </div>
              )}

              <button className="topbar-theme-btn" onClick={toggleDarkMode} title="Basculer le thème">
                {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
              </button>

              <div className="topbar-user-dropdown">
                <button
                  type="button"
                  className="topbar-user"
                  onClick={() => setProfileMenuOpen((previous) => !previous)}
                  aria-expanded={profileMenuOpen}
                >
                  <div className="user-avatar user-avatar--initials">{getInitials(currentUser?.name)}</div>
                  <div className="user-meta">
                    <strong>{currentUser?.name || 'Utilisateur'}</strong>
                    <span>{getRoleLabel(currentUser?.role)}</span>
                  </div>
                  <i className={`fas fa-chevron-${profileMenuOpen ? 'up' : 'down'} topbar-user-chevron`}></i>
                </button>
              </div>
            </div>
          </header>

          {profileMenuOpen && (
            <div className="dashboard-header-dropdown-row">
              <div className="topbar-dropdown-menu topbar-dropdown-menu--docked">
                <button type="button" onClick={() => navigate('/dashboard/profile')}>
                  <i className="fas fa-id-card"></i>
                  Profil
                </button>
                {isAdmin && (
                  <button type="button" onClick={() => navigate('/dashboard/settings')}>
                    <i className="fas fa-sliders-h"></i>
                    Paramètres
                  </button>
                )}
                <button type="button" className="danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>

        <main className="dashboard-content-area">
          <Routes>
            {routeConfigs.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route index element={<Navigate to={defaultRoute} replace />} />
            <Route path="*" element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
