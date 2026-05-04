import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import StockMovementFormModal from './StockMovementFormModal';
import './Stock.css';

const StockEntrees = ({ isDarkMode, toggleDarkMode }) => {
  const [entrees, setEntrees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchEntrees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock/movements', { params: { type: 'entree' } });
      setEntrees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement entrées', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntrees();
  }, [fetchEntrees]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return entrees.filter((entry) =>
      `${entry.medicament || ''} ${entry.fournisseur || ''} ${entry.code || ''}`.toLowerCase().includes(query),
    );
  }, [entrees, search]);

  const stats = useMemo(() => ({
    totalUnites: entrees.reduce((sum, entry) => sum + Number(entry.quantite || 0), 0),
    totalLivraisons: entrees.length,
    fournisseursActifs: new Set(entrees.map((entry) => entry.fournisseur).filter(Boolean)).size,
  }), [entrees]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      await api.post('/stock/movements', payload);
      setIsModalOpen(false);
      await fetchEntrees();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l’enregistrement de l’entrée.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`stock-page ${isDarkMode ? 'dark-theme' : ''}`}>

      <div className="stock-header">
        <div className="stock-header-icon entree-icon">
          <i className="fas fa-arrow-circle-down"></i>
        </div>
        <div>
          <h1 className="stock-title">Entrées de Stock</h1>
          <p className="stock-subtitle">Historique réel des approvisionnements et réceptions</p>
        </div>
        <button className="stock-action-btn entree-btn ms-auto" onClick={() => setIsModalOpen(true)}>
          <i className="fas fa-plus me-2"></i>Nouvelle Entrée
        </button>
      </div>

      <div className="stock-stats-row">
        <div className="stock-stat-card">
          <i className="fas fa-boxes"></i>
          <div>
            <span className="stat-value">{stats.totalUnites}</span>
            <span className="stat-label">Unités reçues</span>
          </div>
        </div>
        <div className="stock-stat-card">
          <i className="fas fa-truck"></i>
          <div>
            <span className="stat-value">{stats.totalLivraisons}</span>
            <span className="stat-label">Livraisons enregistrées</span>
          </div>
        </div>
        <div className="stock-stat-card">
          <i className="fas fa-building"></i>
          <div>
            <span className="stat-value">{stats.fournisseursActifs}</span>
            <span className="stat-label">Fournisseurs actifs</span>
          </div>
        </div>
      </div>

      <div className="stock-card">
        <div className="stock-card-header">
          <h2 className="stock-card-title"><i className="fas fa-list me-2"></i>Liste des Entrées</h2>
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
                <th>Fournisseur</th>
                <th>N° Lot</th>
                <th>Expiration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4">Aucune entrée trouvée.</td></tr>
              ) : filtered.map((entry) => (
                <tr key={entry.id}>
                  <td><span className="date-badge">{entry.date}</span></td>
                  <td><span className="fw-bold">{entry.medicament}</span></td>
                  <td><code className="code-text">{entry.code}</code></td>
                  <td><span className="qty-badge entree-qty">+{entry.quantite}</span></td>
                  <td>{entry.fournisseur || '—'}</td>
                  <td><span className="lot-badge">{entry.lot || '—'}</span></td>
                  <td>{entry.exp || '—'}</td>
                  <td><span className="status-pill status-recu">Reçu</span></td>
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
        type="entree"
        isSaving={saving}
      />
    </div>
  );
};

export default StockEntrees;
