import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '../../../services/api';
import PageHero from '../shared/PageHero';
import CommandeFormModel from './CommandeFormModel';
import './CommandesList.css';

const CommandesList = ({ isDarkMode, toggleDarkMode }) => {
  const [commandes, setCommandes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commandeToDelete, setCommandeToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [cmdRes, supRes] = await Promise.all([api.get('/commandes'), api.get('/fournisseurs')]);
      setCommandes(Array.isArray(cmdRes.data) ? cmdRes.data : []);
      setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des commandes depuis l’API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingCommande(null);
    setIsModalOpen(true);
  };

  const handleEdit = (commande) => {
    setEditingCommande(commande);
    setIsModalOpen(true);
  };

  const confirmDeleteClick = (commande) => {
    setCommandeToDelete(commande);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!commandeToDelete) return;
    try {
      await api.delete(`/commandes/${commandeToDelete.id}`);
      await fetchData();
      setDeleteModalOpen(false);
      setCommandeToDelete(null);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setDeleteError(e.response.data.message);
      } else {
        setDeleteError('Erreur lors de la suppression.');
      }
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingCommande) {
        await api.put(`/commandes/${editingCommande.id}`, data);
      } else {
        await api.post('/commandes', data);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’enregistrement. Vérifiez les données de la commande.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Livrée':
        return 'status-delivered';
      case 'En attente':
        return 'status-pending';
      case 'Annulée':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (error) return <div className="p-4 text-center text-danger">{error}</div>;

  return (
    <div className={`commandes-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <PageHero 
        title="Gestion des Commandes" 
        description="Gérez vos commandes fournisseurs et suivez leurs statuts." 
        icon="fas fa-clipboard-list" 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      <div className="d-flex justify-content-end mb-4">
        <button className="btn-new-commande" onClick={handleAdd}>
          <i className="fas fa-plus"></i> Nouvelle commande
        </button>
      </div>

      <div className="commandes-stats">
        <div className="stat-card">
          <label>Commandes en attente</label>
          <div className="stat-value">{commandes.filter((commande) => commande.statut === 'En attente').length}</div>
        </div>
        <div className="stat-card">
          <label>Commandes livrées</label>
          <div className="stat-value">{commandes.filter((commande) => commande.statut === 'Livrée').length}</div>
        </div>
        <div className="stat-card">
          <label>Montant total</label>
          <div className="stat-value">
            {commandes.reduce((sum, commande) => sum + Number(commande.montant || 0), 0).toLocaleString('fr-FR')} DH
          </div>
        </div>
        <div className="stat-card">
          <label>Taux de livraison</label>
          <div className="stat-value">
            {commandes.length > 0
              ? Math.round((commandes.filter((commande) => commande.statut === 'Livrée').length / commandes.length) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="commandes-table">
          <thead>
            <tr>
              <th>N° Commande Fournisseur</th>
              <th>Date commande</th>
              <th>Date Livraison Prévue</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j}><span className="skeleton-cell"></span></td>
                  ))}
                </tr>
              ))
            ) : commandes.length > 0 ? (
              commandes.map((commande) => (
                <tr key={commande.id}>
                  <td>
                    <strong>{commande.numero_commande}</strong>
                    <br />
                    <small>{commande.fournisseur?.nom || 'Sans fournisseur'}</small>
                  </td>
                  <td>{commande.date_commande ? new Date(commande.date_commande).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    {commande.date_livraison_prevue ? new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td>{Number(commande.montant || 0).toLocaleString('fr-FR')} DH</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(commande.statut)}`}>{commande.statut}</span>
                  </td>
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEdit(commande)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => confirmDeleteClick(commande)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  Aucune commande disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CommandeFormModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        commande={editingCommande}
        suppliers={suppliers}
      />

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
            <p className="text-muted mb-4">Êtes-vous sûr de vouloir supprimer la commande <strong>{commandeToDelete?.numero_commande}</strong> ? Cette action est définitive.</p>
            
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

export default CommandesList;
