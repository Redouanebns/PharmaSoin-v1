import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '../../../services/api';
import PageHero from '../shared/PageHero';
import FournisseurFormModel from './FournisseurFormModel';
import './FournisseurList.css';

const FournisseurList = ({ isDarkMode, toggleDarkMode }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/fournisseurs');
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des fournisseurs depuis l’API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const confirmDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await api.delete(`/fournisseurs/${supplierToDelete.id}`);
      await fetchSuppliers();
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
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
      if (editingSupplier) {
        await api.put(`/fournisseurs/${editingSupplier.id}`, data);
      } else {
        await api.post('/fournisseurs', data);
      }

      setIsModalOpen(false);
      await fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’enregistrement du fournisseur.');
    }
  };

  if (loading) return <div className="p-5 text-center">Chargement...</div>;
  if (error) return <div className="p-5 text-center text-danger">{error}</div>;

  return (
    <div className={`supplier-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <PageHero 
        title="Gestion des Fournisseurs" 
        description="Gérez votre liste de fournisseurs et leurs informations de contact." 
        icon="fas fa-truck" 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      <div className="supplier-card">
        <div className="supplier-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button className="btn-add" onClick={handleAdd}>
            <i className="fas fa-plus"></i>
            Nouvel Fournisseur
          </button>
        </div>

        <div className="supplier-table-wrapper">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Fournisseur</th>
                <th>Contact</th>
                <th>Conditions</th>
                <th>Livraisons</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="supplier-name">{supplier.nom}</td>
                    <td className="supplier-contact">
                      <div>{supplier.email}</div>
                      <small>{supplier.telephone}</small>
                    </td>

                    <td className="supplier-conditions">{supplier.conditions || '—'}</td>
                    <td className="supplier-livraisons">{supplier.livraisons ?? 0}</td>
                    <td>
                      <span className={`status-badge ${supplier.statut ? supplier.statut.toLowerCase() : ''}`}>
                        {supplier.statut || '—'}
                      </span>
                    </td>
                    <td className="supplier-actions">
                      <button className="btn-edit" onClick={() => handleEdit(supplier)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-delete" onClick={() => confirmDeleteClick(supplier)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Aucun fournisseur disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FournisseurFormModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        supplier={editingSupplier}
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
            <p className="text-muted mb-4">Êtes-vous sûr de vouloir supprimer le fournisseur <strong>{supplierToDelete?.nom}</strong> ? Cette action est définitive.</p>
            
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

export default FournisseurList;
