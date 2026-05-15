import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import './Stock.css';

const EXPIRY_WARNING_DAYS = 45;

const getExpiryStatus = (exp) => {
  if (!exp) {
    return { label: 'Sans date', tone: 'neutral', helper: 'Date non renseignée', diffDays: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(exp);
  expirationDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Expiré',
      tone: 'danger',
      helper: `Depuis ${Math.abs(diffDays)} jour(s)`,
      diffDays,
    };
  }

  if (diffDays <= EXPIRY_WARNING_DAYS) {
    return {
      label: 'Bientôt expiré',
      tone: 'warning',
      helper: `Dans ${diffDays} jour(s)`,
      diffDays,
    };
  }

  return {
    label: 'Valide',
    tone: 'success',
    helper: `Encore ${diffDays} jour(s)`,
    diffDays,
  };
};

const mapMedicine = (medicine) => ({
  id: medicine.id,
  code: medicine.code,
  nom: medicine.nom,
  dci: medicine.dci,
  cat: medicine.category?.name || 'Inconnue',
  stock: Number(medicine.stock || 0),
  exp: medicine.exp || '',
  molecule: medicine.molecule || '',
  expiry: getExpiryStatus(medicine.exp),
});

const StockExpiredProducts = ({ isDarkMode, toggleDarkMode }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('expired');

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/medicaments');
      const data = Array.isArray(response.data) ? response.data : [];
      setMedicines(data.map(mapMedicine));
    } catch (error) {
      console.error('Erreur chargement produits périmés', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const trackedMedicines = useMemo(
    () => medicines.filter((medicine) => medicine.expiry.tone === 'danger' || medicine.expiry.tone === 'warning'),
    [medicines],
  );

  const filteredMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();
    return trackedMedicines.filter((medicine) => {
      const matchesFilter = filter === 'all' || (filter === 'expired' ? medicine.expiry.tone === 'danger' : medicine.expiry.tone === 'warning');
      const haystack = `${medicine.nom} ${medicine.dci} ${medicine.code} ${medicine.molecule} ${medicine.cat}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [trackedMedicines, search, filter]);

  const stats = useMemo(() => ({
    expired: trackedMedicines.filter((medicine) => medicine.expiry.tone === 'danger').length,
    warning: trackedMedicines.filter((medicine) => medicine.expiry.tone === 'warning').length,
    stockBlocked: trackedMedicines
      .filter((medicine) => medicine.expiry.tone === 'danger')
      .reduce((sum, medicine) => sum + Number(medicine.stock || 0), 0),
  }), [trackedMedicines]);

  return (
    <div className={`stock-page ${isDarkMode ? 'dark-theme' : ''}`}>

      <div className="stock-header">
        <div className="page-header-icon">
          <i className="fas fa-hourglass-end"></i>
        </div>
        <div>
          <h1 className="stock-title">Suivi des péremptions</h1>
          <p className="stock-subtitle">Les produits expirés doivent être retirés, et ceux proches de la date doivent être écoulés en priorité.</p>
        </div>
        <div className="alerte-total-badge ms-auto">
          <i className="fas fa-biohazard me-2"></i>
          {trackedMedicines.length} produit{trackedMedicines.length > 1 ? 's' : ''} à traiter
        </div>
      </div>

      <div className="stock-stats-row">
        <div className="stock-stat-card stat-rupture">
          <i className="fas fa-calendar-times"></i>
          <div>
            <span className="stat-value">{stats.expired}</span>
            <span className="stat-label">Déjà expirés</span>
          </div>
        </div>
        <div className="stock-stat-card stat-peremption">
          <i className="fas fa-hourglass-half"></i>
          <div>
            <span className="stat-value">{stats.warning}</span>
            <span className="stat-label">À écouler bientôt</span>
          </div>
        </div>
        <div className="stock-stat-card stat-critique">
          <i className="fas fa-box-open"></i>
          <div>
            <span className="stat-value">{stats.stockBlocked}</span>
            <span className="stat-label">Unités bloquées</span>
          </div>
        </div>
      </div>

      <div className="stock-card">
        <div className="stock-card-header flex-wrap gap-3">
          <h2 className="stock-card-title"><i className="fas fa-notes-medical me-2"></i>Lots à surveiller</h2>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="stock-search">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher un médicament, DCI ou code..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="form-select filter-select" style={{ minWidth: '220px' }} value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="expired">Produits expirés</option>
              <option value="warning">Bientôt expirés</option>
              <option value="all">Tous les produits à suivre</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Code barres</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Expiration</th>
                <th>Priorité</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Chargement...</td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Aucun produit correspondant.</td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td><code className="code-text">{medicine.code}</code></td>
                    <td>
                      <strong>{medicine.nom}</strong>
                      <div className="text-muted small">{medicine.dci}</div>
                    </td>
                    <td>{medicine.cat}</td>
                    <td>{medicine.stock}</td>
                    <td>
                      <div className={`expiry-chip expiry-${medicine.expiry.tone}`}>
                        <span>{medicine.expiry.label}</span>
                        <small>{medicine.exp || '—'} • {medicine.expiry.helper}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`alerte-type-badge ${medicine.expiry.tone === 'danger' ? 'alerte-rupture-badge' : 'alerte-peremption-badge'}`}>
                        {medicine.expiry.tone === 'danger' ? 'Retrait immédiat' : 'Vente prioritaire'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockExpiredProducts;
