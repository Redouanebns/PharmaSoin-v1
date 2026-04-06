import React, { useState, useEffect } from 'react';
import './FournisseurFormModel.css';

const FournisseurFormModel = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    produits: '',
    conditions: 'Comptant',
    statut: 'Actif'
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        ...supplier,
        produits: Array.isArray(supplier.produits) ? supplier.produits.join(', ') : supplier.produits || ''
      });
    } else {
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        produits: '',
        conditions: 'Comptant',
        statut: 'Actif'
      });
    }
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      produits: formData.produits.split(',').map(p => p.trim()).filter(p => p !== '')
    };
    onSave(processedData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Fiche Fournisseur</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du fournisseur</label>
            <input 
              type="text" 
              name="nom" 
              value={formData.nom} 
              onChange={handleChange} 
              required 
              placeholder="Entrez le nom"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="exemple@mail.com"
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                name="telephone" 
                value={formData.telephone} 
                onChange={handleChange} 
                required 
                placeholder="06XXXXXXXX"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Produits fournis (séparés par virgule)</label>
            <input 
              type="text" 
              name="produits" 
              value={formData.produits} 
              onChange={handleChange} 
              placeholder="Produit 1, Produit 2..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Conditions de paiement</label>
              <select name="conditions" value={formData.conditions} onChange={handleChange}>
                <option value="Comptant">Comptant</option>
                <option value="30 jours">30 jours</option>
                <option value="60 jours">60 jours</option>
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FournisseurFormModel;
