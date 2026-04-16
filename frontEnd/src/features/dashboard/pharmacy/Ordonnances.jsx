import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Clock, Moon, Sun, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import OrdonnanceFormModal from './OrdonnanceFormModal';
import './Ordonnances.css';

const Ordonnances = ({ isDarkMode, toggleDarkMode }) => {
  const [ordonnances, setOrdonnances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous les resultats');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrdonnance, setCurrentOrdonnance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrdonnances = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/ordonnances');
      setOrdonnances(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer les ordonnances depuis l’API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdonnances();
  }, [fetchOrdonnances]);

  const handleAdd = () => {
    setCurrentOrdonnance(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ordonnance) => {
    setCurrentOrdonnance(ordonnance);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette ordonnance ?')) return;

    try {
      setError('');
      await api.delete(`/ordonnances/${id}`);
      setOrdonnances((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError('Suppression impossible.');
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      setError('');

      if (currentOrdonnance) {
        const response = await api.put(`/ordonnances/${currentOrdonnance.id}`, formData);
        setOrdonnances((prev) => prev.map((item) => (item.id === response.data.id ? response.data : item)));
      } else {
        const response = await api.post('/ordonnances', formData);
        setOrdonnances((prev) => [response.data, ...prev]);
      }

      setIsModalOpen(false);
      setCurrentOrdonnance(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const filteredOrdonnances = useMemo(() => {
    return ordonnances.filter((ordonnance) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        ordonnance.patient?.toLowerCase().includes(term) ||
        ordonnance.numero?.toLowerCase().includes(term) ||
        ordonnance.medecin?.toLowerCase().includes(term);

      const matchesFilter = filterStatus === 'Tous les resultats' || ordonnance.statut === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [ordonnances, searchTerm, filterStatus]);

  return (
    <div className={`ordonnances-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="stats-top-bar">
        <div className="top-bar-left">
          <h2>Gestion des Ordonnances</h2>
          <p className="page-subtitle">Création rapide et suivi des prescriptions, sans champ produit manuel.</p>
        </div>
        <div className="top-bar-right">
          <div className="clock-display">
            <Clock size={18} className="me-2" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <button onClick={toggleDarkMode} className="theme-btn" type="button">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <div className="ordonnances-card">
        <div className="card-header-flex">
          <div className="header-title">
            <FileText size={24} className="me-2" />
            <div>
              <h3>Liste des ordonnances</h3>
              <p className="header-caption">La dispensation est ensuite gérée au moment de la vente.</p>
            </div>
          </div>
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={18} className="me-1" />
            Nouvelle ordonnance
          </button>
        </div>

        <div className="filters-row">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par numéro, patient, médecin..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option>Tous les resultats</option>
            <option>Dispensée</option>
            <option>En attente</option>
          </select>
        </div>

        {error && <div className="api-message error">{error}</div>}

        {loading ? (
          <div className="loading-box">
            <Loader2 className="spin" size={22} /> Chargement des ordonnances...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="ordonnances-table">
              <thead>
                <tr>
                  <th>N° Ordonnance</th>
                  <th>Patient</th>
                  <th>Médecin</th>
                  <th>Date Ordonnance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdonnances.length > 0 ? (
                  filteredOrdonnances.map((ordonnance) => (
                    <tr key={ordonnance.id}>
                      <td>
                        <strong>{ordonnance.numero}</strong>
                      </td>
                      <td>{ordonnance.patient}</td>
                      <td>{ordonnance.medecin}</td>
                      <td>{ordonnance.date}</td>
                      <td>
                        <span className={`status-badge ${ordonnance.statut === 'Dispensée' ? 'success' : 'warning'}`}>
                          {ordonnance.statut}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn edit" onClick={() => handleEdit(ordonnance)}>
                          <Edit size={18} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(ordonnance.id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Aucune ordonnance trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <OrdonnanceFormModal
          isOpen={isModalOpen}
          onClose={() => {
            if (!saving) {
              setIsModalOpen(false);
              setCurrentOrdonnance(null);
            }
          }}
          onSave={handleSave}
          initialData={currentOrdonnance}
          isSaving={saving}
        />
      )}
    </div>
  );
};

export default Ordonnances;
