import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isDarkMode, toggleDarkMode, onDeconnexion }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Statistiques',  icon: 'fas fa-chart-pie',          path: '/dashboard/stats' },
    { name: 'Médicaments',   icon: 'fas fa-pills',              path: '/dashboard/medicines' },
    { name: 'Catégories',    icon: 'fas fa-tags',               path: '/dashboard/categories' },
    { name: 'Ordonnances',   icon: 'fas fa-file-medical',       path: '/dashboard/ordonnances' },
    { name: 'Fournisseurs',  icon: 'fas fa-truck',              path: '/dashboard/suppliers' },
    { name: 'Commandes',     icon: 'fas fa-shopping-bag',       path: '/dashboard/commandes' },
  ];

  return (
    <aside className={`dashboard-sidebar-nav ${isCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        {!isCollapsed && (
          <div className="brand-info">
            <img
              src="/assets/images/logo.png"
              alt="PharmaSoin"
              className="brand-logo"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <span className="brand-name">
              Pharma<span className="brand-accent">Soin</span>
            </span>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Agrandir' : 'Réduire'}
        >
          <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Navigation */}
      <nav className="sidebar-nav-list">
        {!isCollapsed && (
          <span className="nav-section-label">Navigation</span>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? item.name : ''}
          >
            <i className={item.icon}></i>
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider"></div>
        <button
          className="sidebar-nav-link sidebar-home-btn"
          onClick={() => navigate('/')}
          title={isCollapsed ? 'Accueil' : ''}
        >
          <i className="fas fa-home"></i>
          {!isCollapsed && <span>Accueil</span>}
        </button>
        <button
          className="sidebar-nav-link sidebar-logout-btn"
          onClick={onDeconnexion}
          title={isCollapsed ? 'Déconnexion' : ''}
        >
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
