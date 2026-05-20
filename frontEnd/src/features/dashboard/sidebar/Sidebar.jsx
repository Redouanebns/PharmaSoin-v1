import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getRoleLabel } from '../../../utils/auth';
import './Sidebar.css';

const Sidebar = ({ currentUser, isDarkMode, isOpen, onClose, onDeconnexion }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(true);
  const [isSalesOpen, setIsSalesOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = currentUser?.role === 'admin';

  const navItems = useMemo(() => {
    const items = [
      { name: 'Statistiques', icon: 'fas fa-chart-pie', path: '/dashboard/stats' },
      { name: 'Médicaments', icon: 'fas fa-pills', path: '/dashboard/medicines' },
      { name: 'Catégories', icon: 'fas fa-tags', path: '/dashboard/categories' },
      { name: 'Fournisseurs', icon: 'fas fa-truck', path: '/dashboard/suppliers' },
      { name: 'Commandes', icon: 'fas fa-shopping-bag', path: '/dashboard/commandes' },
      { name: 'Ordonnances', icon: 'fas fa-file-medical', path: '/dashboard/ordonnances' },
    ];

    if (isAdmin) {
      items.push({ name: 'Transactions', icon: 'fas fa-wallet', path: '/dashboard/transactions' });
    }

    return items;
  }, [isAdmin]);

  const bottomItems = useMemo(() => {
    const items = [
      { name: 'Profil', icon: 'fas fa-id-card', path: '/dashboard/profile' },
    ];
    if (isAdmin) {
      items.push({ name: 'Utilisateurs', icon: 'fas fa-users-cog', path: '/dashboard/users' });
      items.push({ name: 'Paramètres', icon: 'fas fa-sliders-h', path: '/dashboard/settings' });
    }
    return items;
  }, [isAdmin]);

  const salesItems = [
    { name: 'Ventes comptoir', icon: 'fas fa-cash-register', path: '/dashboard/ventes' },
    { name: 'Ventes en ligne', icon: 'fas fa-globe', path: '/dashboard/ventes-en-ligne' },
  ];

  const stockItems = [
    { name: 'Entrées', icon: 'fas fa-arrow-circle-down', path: '/dashboard/stock/entrees' },
    { name: 'Sorties', icon: 'fas fa-arrow-circle-up', path: '/dashboard/stock/sorties' },
    { name: 'Alertes', icon: 'fas fa-exclamation-triangle', path: '/dashboard/stock/alertes' },
    { name: 'Périmés', icon: 'fas fa-calendar-times', path: '/dashboard/stock/perimes' },
  ];

  const isSalesActive = salesItems.some((item) => location.pathname === item.path);

  useEffect(() => {
    if (isSalesActive) {
      setIsSalesOpen(true);
    }
  }, [isSalesActive]);

  const handleNavigateHome = () => {
    navigate('/');
    onClose?.();
  };

  const handleLogout = () => {
    onDeconnexion?.();
    onClose?.();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside
        className={`dashboard-sidebar-nav role-${currentUser?.role || 'admin'} ${isCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark-mode' : ''} ${isOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-brand">
          {!isCollapsed && (
            <div className="brand-info">
              <img 
                src="/assets/images/logo.png" 
                alt="Logo PharmaSoin" 
                style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '2px' }} 
              />
              <div>
                <span className="brand-name">PharmaSoin</span>
                <small className="brand-role">{getRoleLabel(currentUser?.role)}</small>
              </div>
            </div>
          )}

          <div className="sidebar-brand-actions">
            <button className="sidebar-mobile-close" type="button" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
            <button
              className="collapse-btn"
              type="button"
              onClick={() => setIsCollapsed((previous) => !previous)}
              title={isCollapsed ? 'Agrandir' : 'Réduire'}
            >
              <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
            </button>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <nav className="sidebar-nav-list">
          {!isCollapsed && <span className="nav-section-label">Navigation</span>}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title={isCollapsed ? item.name : ''}
            >
              <i className={item.icon}></i>
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}

          <div className="sidebar-divider sidebar-divider--section"></div>
          {!isCollapsed && <span className="nav-section-label">Ventes</span>}

          <button
            type="button"
            className={`sidebar-nav-link stock-toggle-btn ${isSalesOpen ? 'stock-open' : ''} ${isSalesActive ? 'active' : ''}`}
            onClick={() => !isCollapsed && setIsSalesOpen((previous) => !previous)}
            title={isCollapsed ? 'Ventes' : ''}
          >
            <i className="fas fa-cash-register"></i>
            {!isCollapsed && (
              <>
                <span>Ventes</span>
                <i className={`fas fa-chevron-${isSalesOpen ? 'up' : 'down'} stock-chevron`}></i>
              </>
            )}
          </button>

          {!isCollapsed && isSalesOpen && (
            <div className="stock-submenu">
              {salesItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-nav-link stock-sub-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}

          {isCollapsed && (
            <div className="stock-collapsed-submenu">
              {salesItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  title={item.name}
                >
                  <i className={item.icon}></i>
                </NavLink>
              ))}
            </div>
          )}

          <div className="sidebar-divider sidebar-divider--section"></div>
          {!isCollapsed && <span className="nav-section-label">Gestion du stock</span>}

          <button
            type="button"
            className={`sidebar-nav-link stock-toggle-btn ${isStockOpen ? 'stock-open' : ''}`}
            onClick={() => !isCollapsed && setIsStockOpen((previous) => !previous)}
            title={isCollapsed ? 'Stock' : ''}
          >
            <i className="fas fa-warehouse"></i>
            {!isCollapsed && (
              <>
                <span>Stock</span>
                <i className={`fas fa-chevron-${isStockOpen ? 'up' : 'down'} stock-chevron`}></i>
              </>
            )}
          </button>

          {!isCollapsed && isStockOpen && (
            <div className="stock-submenu">
              {stockItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-nav-link stock-sub-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}

          {isCollapsed && (
            <div className="stock-collapsed-submenu">
              {stockItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  title={item.name}
                >
                  <i className={item.icon}></i>
                </NavLink>
              ))}
            </div>
          )}

          {/* ===== SECTION COMPTE ===== */}
          <div className="sidebar-divider sidebar-divider--section"></div>
          {!isCollapsed && <span className="nav-section-label">Compte</span>}
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title={isCollapsed ? item.name : ''}
            >
              <i className={item.icon}></i>
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-divider"></div>
          <button type="button" className="sidebar-nav-link sidebar-home-btn" onClick={handleNavigateHome} title={isCollapsed ? 'Accueil' : ''}>
            <i className="fas fa-home"></i>
            {!isCollapsed && <span>Accueil</span>}
          </button>
          <button type="button" className="sidebar-nav-link sidebar-logout-btn" onClick={handleLogout} title={isCollapsed ? 'Déconnexion' : ''}>
            <i className="fas fa-sign-out-alt"></i>
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
