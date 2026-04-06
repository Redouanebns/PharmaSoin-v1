import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Dashboard Components
import Sidebar from './sidebar/Sidebar';
import Statistic from './statistic/Statistic';
import CategorieList from './categorie/CategorieList';

// Feature Components
import MedicineList from './medicaments/MedicineList';
import Ordonnances from './pharmacy/Ordonnances';
import FournisseurList from './suppliers/FournisseurList';
import CommandesList from './orders/CommandesList';

// Styles
import './Dashboard.css';

const Dashboard = ({ isDarkMode, toggleDarkMode, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className={`dashboard-full-layout ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar principal */}
      <Sidebar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onDeconnexion={handleDeconnexion}
      />

      {/* Contenu principal */}
      <div className="dashboard-main">
        {/* Header du dashboard */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h4 className="topbar-title">
              <i className="fas fa-chart-line me-2 text-success"></i>
              Tableau de Bord
            </h4>
          </div>
          <div className="topbar-right">
            {searchQuery !== undefined && (
              <div className="topbar-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <button className="topbar-theme-btn" onClick={toggleDarkMode} title="Thème">
              {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
            <div className="topbar-user">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Routes du dashboard */}
        <main className="dashboard-content-area">
          <Routes>
            <Route path="stats" element={<Statistic isDarkMode={isDarkMode} />} />
            <Route path="medicines" element={<MedicineList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="categories" element={<CategorieList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="ordonnances" element={<Ordonnances isDarkMode={isDarkMode} />} />
            <Route path="suppliers" element={<FournisseurList isDarkMode={isDarkMode} />} />
            <Route path="commandes" element={<CommandesList isDarkMode={isDarkMode} />} />
            <Route index element={<Navigate to="stats" replace />} />
            <Route path="*" element={<Navigate to="stats" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
