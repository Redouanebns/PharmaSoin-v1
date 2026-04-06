import React, { useState, useEffect } from 'react';
import './CommandeFormModel.css';

const CommandeFormModel = ({ isOpen, onClose, onSave, commande, suppliers }) => {
  const [formData, setFormData] = useState({
    numero_commande: '',
    fournisseur_id: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    montant: 0,
    statut: 'En attente',
    produits: []
  });

  useEffect(() => {
    if (commande) {
      setFormData({
        ...commande,
        date_commande: commande.date_commande.split('T')[0],
        date_livraison_prevue: commande.date_livraison_prevue.split('T')[0],
      });
    } else {
      setFormData({
        numero_commande: `CMD${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        fournisseur_id: '',
        date_commande: new Date().toISOString().split('T')[0],
        date_livraison_prevue: '',
        montant: 0,
        statut: 'En attente',
        produits: []
      });
    }
  }, [commande, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      produits: [...prev.produits, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const removeProduct = (index) => {
    const newProducts = [...formData.produits];
    newProducts.splice(index, 1);
    setFormData(prev => ({ ...prev, produits: newProducts }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.produits];
    newProducts[index][field] = value;
    
    // Recalculate total amount
    const total = newProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    
    setFormData(prev => ({ 
      ...prev, 
      produits: newProducts,
      montant: total
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content commande-modal">
        <div className="modal-header">
          <h3>{commande ? 'Modifier la Commande' : 'Nouvelle Commande'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>N° Commande</label>
              <input 
                type="text" 
                name="numero_commande" 
                value={formData.numero_commande} 
                readOnly 
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label>Fournisseur</label>
              <select 
                name="fournisseur_id" 
                value={formData.fournisseur_id} 
                onChange={handleChange} 
                required
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date Commande</label>
              <input 
                type="date" 
                name="date_commande" 
                value={formData.date_commande} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Date Livraison Prévue</label>
              <input 
                type="date" 
                name="date_livraison_prevue" 
                value={formData.date_livraison_prevue} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <select name="statut" value={formData.statut} onChange={handleChange}>
              <option value="En attente">En attente</option>
              <option value="Livrée">Livrée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          <div className="products-section">
            <div className="section-header">
              <label>Produits à Commander</label>
              <button type="button" className="add-product-btn" onClick={addProduct}>
                + Ajouter un produit
              </button>
            </div>
            <div className="products-list">
              {formData.produits.map((product, index) => (
                <div key={index} className="product-item">
                  <input 
                    type="text" 
                    placeholder="Nom du produit" 
                    value={product.name} 
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Qté" 
                    value={product.quantity} 
                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Prix Unit." 
                    value={product.price} 
                    onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                  <button type="button" className="remove-btn" onClick={() => removeProduct(index)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-footer">
            <div className="total-amount">
              Total: <strong>{formData.montant.toFixed(2)} DH</strong>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-submit">
                {commande ? 'Modifier' : 'Créer la Commande'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommandeFormModel;
