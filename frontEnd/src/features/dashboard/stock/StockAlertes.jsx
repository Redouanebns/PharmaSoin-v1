import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import './Stock.css';

const typeConfig = {
  rupture: { label: 'Rupture', cls: 'alerte-rupture', icon: 'fas fa-times-circle' },
  critique: { label: 'Stock Critique', cls: 'alerte-critique', icon: 'fas fa-exclamation-circle' },
  faible: { label: 'Stock Faible', cls: 'alerte-faible', icon: 'fas fa-exclamation-triangle' },
  peremption: { label: 'Péremption proche', cls: 'alerte-peremption', icon: 'fas fa-hourglass-end' },
  expire: { label: 'Produit expiré', cls: 'alerte-rupture', icon: 'fas fa-calendar-times' },
};

const StockAlertes = ({ isDarkMode, toggleDarkMode }) => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stock/alerts');
        setAlertes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erreur chargement alertes stock', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const counters = useMemo(() => ({
    ruptures: alertes.filter((alert) => alert.type === 'rupture').length,
    critiques: alertes.filter((alert) => alert.type === 'critique').length,
    faibles: alertes.filter((alert) => alert.type === 'faible').length,
    peremptions: alertes.filter((alert) => alert.type === 'peremption').length,
    expires: alertes.filter((alert) => alert.type === 'expire').length,
  }), [alertes]);

  return (
    <div className={`stock-page ${isDarkMode ? 'dark-theme' : ''}`}>

      <div className="stock-header">
        <div className="stock-header-icon alerte-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <div>
          <h1 className="stock-title">Alertes de Stock</h1>
          <p className="stock-subtitle">Surveillance des niveaux critiques et péremptions en temps réel</p>
        </div>
        <div className="alerte-total-badge ms-auto">
          <i className="fas fa-bell me-2"></i>
          {alertes.length} alerte{alertes.length > 1 ? 's' : ''} active{alertes.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="stock-stats-row">
        <div className="stock-stat-card stat-rupture">
          <i className="fas fa-times-circle"></i>
          <div>
            <span className="stat-value">{counters.ruptures}</span>
            <span className="stat-label">Ruptures</span>
          </div>
        </div>
        <div className="stock-stat-card stat-critique">
          <i className="fas fa-exclamation-circle"></i>
          <div>
            <span className="stat-value">{counters.critiques}</span>
            <span className="stat-label">Stocks critiques</span>
          </div>
        </div>
        <div className="stock-stat-card stat-faible">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <span className="stat-value">{counters.faibles}</span>
            <span className="stat-label">Stocks faibles</span>
          </div>
        </div>
        <div className="stock-stat-card stat-peremption">
          <i className="fas fa-hourglass-end"></i>
          <div>
            <span className="stat-value">{counters.peremptions}</span>
            <span className="stat-label">Péremptions proches</span>
          </div>
        </div>
        <div className="stock-stat-card stat-rupture">
          <i className="fas fa-calendar-times"></i>
          <div>
            <span className="stat-value">{counters.expires}</span>
            <span className="stat-label">Produits expirés</span>
          </div>
        </div>
      </div>

      <div className="stock-card">
        <div className="stock-card-header">
          <h2 className="stock-card-title"><i className="fas fa-bell me-2"></i>Alertes Actives</h2>
        </div>
        <div className="alertes-list">
          {loading ? (
            <div className="p-4 text-center">Chargement...</div>
          ) : alertes.length === 0 ? (
            <div className="p-4 text-center">Aucune alerte active.</div>
          ) : alertes.map((alerte) => {
            const cfg = typeConfig[alerte.type] || typeConfig.faible;
            return (
              <div key={alerte.id} className={`alerte-item ${cfg.cls}`}>
                <div className="alerte-icon-wrap">
                  <i className={cfg.icon}></i>
                </div>
                <div className="alerte-info">
                  <div className="alerte-med-name">{alerte.medicament}</div>
                  <div className="alerte-message">{alerte.message}</div>
                  <div className="alerte-meta">
                    <span><i className="fas fa-barcode me-1"></i>{alerte.code}</span>
                    <span><i className="fas fa-cubes me-1"></i>Stock actuel: <strong>{alerte.stock}</strong></span>
                    <span><i className="fas fa-arrow-down me-1"></i>Seuil min: <strong>{alerte.seuil}</strong></span>
                    <span><i className="fas fa-calendar me-1"></i>Exp: {alerte.exp || '—'}</span>
                  </div>
                </div>
                <div className="alerte-badge-wrap">
                  <span className={`alerte-type-badge ${cfg.cls}-badge`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockAlertes;
