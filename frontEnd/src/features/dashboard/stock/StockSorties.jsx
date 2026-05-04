import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import StockMovementFormModal from './StockMovementFormModal';
import './Stock.css';

const motifColors = {
  'Vente comptoir': 'status-vente',
  'Vente sur ordonnance': 'status-ordonnance',
  'Retour / Périmé': 'status-retour',
  'Sortie manuelle': 'status-retour',
};

const StockSorties = ({ isDarkMode, toggleDarkMode }) => {
  const [sorties, setSorties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSorties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock/movements', { params: { type: 'sortie' } });
      setSorties(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement sorties', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSorties();
  }, [fetchSorties]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return sorties.filter((entry) =>
      `${entry.medicament || ''} ${entry.motif || ''} ${entry.code || ''}`.toLowerCase().includes(query),
    );
  }, [sorties, search]);

  const stats = useMemo(() => ({
    totalUnites: sorties.reduce((sum, entry) => sum + Number(entry.quantite || 0), 0),
    totalTransactions: sorties.length,
    retours: sorties.filter((entry) => (entry.motif || '').toLowerCase().includes('retour')).length,
  }), [sorties]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      await api.post('/stock/movements', payload);
      setIsModalOpen(false);
      await fetchSorties();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l’enregistrement de la sortie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`stock-page ${isDarkMode ? 'dark-theme' : ''}`}>

      <div className="stock-header">
        <div className="stock-header-icon sortie-icon">
          <i className="fas fa-arrow-circle-up"></i>
        </div>
        <div>
          <h1 className="stock-title">Sorties de Stock</h1>
          <p className="stock-subtitle">Historique des ventes et mouvements sortants interconnectés</p>
        </div>
        <button className="stock-action-btn sortie-btn ms-auto" onClick={() => setIsModalOpen(true)}>
          <i className="fas fa-plus me-2"></i>Nouvelle Sortie
        </button>
      </div>

      <div className="stock-stats-row">
        <div className="stock-stat-card">
          <i className="fas fa-cart-arrow-down"></i>
          <div>
            <span className="stat-value">{stats.totalUnites}</span>
            <span className="stat-label">Unités sorties</span>
          </div>
        </div>
        <div className="stock-stat-card">
          <i className="fas fa-receipt"></i>
          <div>
            <span className="stat-value">{stats.totalTransactions}</span>
            <span className="stat-label">Transactions</span>
          </div>
        </div>
        <div className="stock-stat-card">
          <i className="fas fa-undo"></i>
          <div>
            <span className="stat-value">{stats.retours}</span>
            <span className="stat-label">Retours</span>
          </div>
        </div>
      </div>

      <div className="stock-card">
        <div className="stock-card-header">
          <h2 className="stock-card-title"><i className="fas fa-list me-2"></i>Liste des Sorties</h2>
          <div className="stock-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Médicament</th>
                <th>Code barres</th>
                <th>Quantité</th>
                <th>Motif</th>
                <th>Opérateur</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">Aucune sortie trouvée.</td></tr>
              ) : filtered.map((entry) => (
                <tr key={entry.id}>
                  <td><span className="date-badge">{entry.date}</span></td>
                  <td><span className="fw-bold">{entry.medicament}</span></td>
                  <td><code className="code-text">{entry.code}</code></td>
                  <td><span className="qty-badge sortie-qty">-{entry.quantite}</span></td>
                  <td>{entry.motif}</td>
                  <td>{entry.operateur}</td>
                  <td>
                    <span className={`status-pill ${motifColors[entry.motif] || 'status-vente'}`}>
                      {entry.motif}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StockMovementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        type="sortie"
        isSaving={saving}
      />
    </div>
  );
};

export default StockSorties;
