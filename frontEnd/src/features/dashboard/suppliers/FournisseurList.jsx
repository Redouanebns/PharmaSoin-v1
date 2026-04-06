import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api';
import FournisseurFormModel from './FournisseurFormModel';
import './FournisseurList.css';

const FournisseurList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;

    try {
      await api.delete(`/fournisseurs/${id}`);
      await fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression du fournisseur.');
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
    <div className="supplier-container">
      <div className="supplier-card">
        <div className="supplier-header">
          <div className="header-title">
            <i className="fas fa-truck"></i>
            <h2>Gestion des Fournisseurs</h2>
          </div>
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
                <th>Produits</th>
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
                    <td className="supplier-products">
                      {Array.isArray(supplier.produits) && supplier.produits.length > 0 ? (
                        supplier.produits.map((product, index) => (
                          <span key={`${supplier.id}-${index}`} className="product-tag">
                            {product}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
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
                      <button className="btn-delete" onClick={() => handleDelete(supplier.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
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
    </div>
  );
};

export default FournisseurList;
