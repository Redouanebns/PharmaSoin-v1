import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import './OrdonnanceFormModal.css';

const initialFormState = {
  patient: '',
  medecin: '',
  date: '',
  statut: 'En attente',
  produits: ''
};

const OrdonnanceFormModal = ({ isOpen, onClose, onSave, initialData, isSaving = false }) => {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        patient: initialData.patient || '',
        medecin: initialData.medecin || '',
        date: initialData.date || '',
        statut: initialData.statut || 'En attente',
        produits: initialData.produits || ''
      });
    } else {
      setFormData({
        ...initialFormState,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialData ? 'Modifier Ordonnance' : 'Nouvelle Ordonnance'}</h3>
          <button className="close-btn" onClick={onClose} disabled={isSaving}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom du Patient</label>
              <input
                type="text"
                name="patient"
                required
                value={formData.patient}
                onChange={handleChange}
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div className="form-group">
              <label>Nom du Médecin</label>
              <input
                type="text"
                name="medecin"
                required
                value={formData.medecin}
                onChange={handleChange}
                placeholder="Ex: Dr. Mohamed Taha"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de l'Ordonnance</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange}>
                <option value="En attente">En attente</option>
                <option value="Dispensée">Dispensée</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Produits (séparés par virgule)</label>
            <textarea
              required
              rows="4"
              name="produits"
              value={formData.produits}
              onChange={handleChange}
              placeholder="Ex: Doliprane 1000mg, Amoxicilline 500mg"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSaving}>
              Annuler
            </button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 size={18} className="spin me-1" /> Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdonnanceFormModal;
