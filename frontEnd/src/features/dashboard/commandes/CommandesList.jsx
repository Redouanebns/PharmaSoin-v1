import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api';
import CommandeFormModel from './CommandeFormModel';
import './CommandesList.css';

const CommandesList = ({ isDarkMode, toggleDarkMode }) => {
  const [commandes, setCommandes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

    try {
      await api.delete(`/commandes/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression de la commande.');
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

      <div className="commandes-header">
        <div className="header-left">
          <div className="page-header-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h2>Gestion des Commandes</h2>
        </div>
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
                    <button className="delete-btn" onClick={() => handleDelete(commande.id)}>
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
    </div>
  );
};

export default CommandesList;
