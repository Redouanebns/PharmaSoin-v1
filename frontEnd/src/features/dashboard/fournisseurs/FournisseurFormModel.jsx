import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, Mail, Phone, Truck, X } from 'lucide-react';
import './FournisseurFormModel.css';

const getInitialState = (supplier) => ({
  nom: supplier?.nom || '',
  email: supplier?.email || '',
  telephone: supplier?.telephone || '',
  produits: Array.isArray(supplier?.produits) ? supplier.produits.join(', ') : supplier?.produits || '',
  conditions: supplier?.conditions || 'Comptant',
  statut: supplier?.statut || 'Actif',
});

const FournisseurFormModel = ({ isOpen, onClose, onSave, supplier }) => {
  const [formData, setFormData] = useState(getInitialState(supplier));

  useEffect(() => {
    setFormData(getInitialState(supplier));
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const processedData = {
      ...formData,
      produits: formData.produits
        .split(',')
        .map((product) => product.trim())
        .filter((product) => product !== ''),
    };
    onSave(processedData);
  };

  return (
    <div className="supplier-modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="supplier-modal-card">
        <div className="supplier-modal-header">
          <div>
            <span className="supplier-kicker">Gestion fournisseur</span>
            <h3>{supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h3>
            <p>Centralisez le contact, les produits fournis et les conditions de règlement dans une fiche claire.</p>
          </div>
          <button className="supplier-close-btn" onClick={onClose} type="button">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="supplier-modal-form">
          <div className="supplier-form-grid">
            <div className="supplier-field-card full-span">
              <label>Nom du fournisseur</label>
              <div className="supplier-input-wrap">
                <Building2 size={18} />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Pharma Distribution Atlas"
                />
              </div>
            </div>

            <div className="supplier-field-card">
              <label>Email</label>
              <div className="supplier-input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="contact@fournisseur.ma"
                />
              </div>
            </div>

            <div className="supplier-field-card">
              <label>Téléphone</label>
              <div className="supplier-input-wrap">
                <Phone size={18} />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  placeholder="06 XX XX XX XX"
                />
              </div>
            </div>
          </div>

          <div className="supplier-field-card full-span">
            <label>Produits fournis</label>
            <div className="supplier-textarea-wrap">
              <Truck size={18} />
              <textarea
                name="produits"
                value={formData.produits}
                onChange={handleChange}
                rows="2"
                placeholder="Ex: Doliprane 1000mg, Amoxicilline 500mg, Seringues stériles"
              />
            </div>
            <small>Saisissez les produits séparés par des virgules pour générer automatiquement la liste.</small>
          </div>

          <div className="supplier-form-grid compact-grid">
            <div className="supplier-field-card">
              <label>Conditions de paiement</label>
              <div className="supplier-input-wrap">
                <CreditCard size={18} />
                <select name="conditions" value={formData.conditions} onChange={handleChange}>
                  <option value="Comptant">Comptant</option>
                  <option value="30 jours">30 jours</option>
                  <option value="60 jours">60 jours</option>
                </select>
              </div>
            </div>

            <div className="supplier-field-card">
              <label>Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange} className="supplier-plain-select">
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="supplier-tip-box">
            <strong>Conseil :</strong> ajoutez les produits majeurs du fournisseur pour faciliter la préparation des commandes.
          </div>

          <div className="supplier-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save">{supplier ? 'Mettre à jour' : 'Enregistrer le fournisseur'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FournisseurFormModel;
