import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ordonnanceToDelete, setOrdonnanceToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

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

  const confirmDeleteClick = (ordonnance) => {
    setOrdonnanceToDelete(ordonnance);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!ordonnanceToDelete) return;
    try {
      await api.delete(`/ordonnances/${ordonnanceToDelete.id}`);
      setOrdonnances((prev) => prev.filter((item) => item.id !== ordonnanceToDelete.id));
      setDeleteModalOpen(false);
      setOrdonnanceToDelete(null);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setDeleteError(e.response.data.message);
      } else {
        setDeleteError('Erreur lors de la suppression.');
      }
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
            <div className="page-header-icon me-3">
              <FileText size={24} />
            </div>
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
                        <button className="action-btn delete" onClick={() => confirmDeleteClick(ordonnance)}>
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

      {deleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal-content-custom"
            style={{ maxWidth: '400px', padding: '24px' }}
          >
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-exclamation-triangle text-danger fs-3 me-3"></i>
              <h4 className="mb-0 text-dark fw-bold">Confirmer la suppression</h4>
            </div>
            <p className="text-muted mb-4">Êtes-vous sûr de vouloir supprimer l'ordonnance <strong>{ordonnanceToDelete?.numero}</strong> ? Cette action est définitive.</p>
            
            {deleteError && (
              <div className="alert alert-danger py-2 mb-4" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-circle me-2"></i>
                {deleteError}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="btn btn-light border">Annuler</button>
              <button onClick={executeDelete} className="btn btn-danger">Supprimer</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Ordonnances;
