import React, { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Stethoscope, UserRound, X } from 'lucide-react';
import './OrdonnanceFormModal.css';

const initialFormState = {
  patient: '',
  medecin: '',
  date: '',
  statut: 'En attente',
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
      });
    } else {
      setFormData({
        ...initialFormState,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && !isSaving && onClose()}>
      <div className="ordonnance-modal-card">
        <div className="ordonnance-modal-header">
          <div>
            <span className="ordonnance-kicker">Prescription patient</span>
            <h3>{initialData ? 'Modifier l’ordonnance' : 'Nouvelle ordonnance'}</h3>
            <p>Renseignez l’identité du patient, le prescripteur et le statut. Les produits seront gérés lors de la dispensation.</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isSaving} type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ordonnance-modal-form">
          <div className="ordonnance-form-grid">
            <div className="ordonnance-field-card">
              <label>Nom du patient</label>
              <div className="input-with-icon">
                <UserRound size={18} />
                <input
                  type="text"
                  name="patient"
                  required
                  value={formData.patient}
                  onChange={handleChange}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <small>Nom complet figurant sur l’ordonnance.</small>
            </div>

            <div className="ordonnance-field-card">
              <label>Nom du médecin</label>
              <div className="input-with-icon">
                <Stethoscope size={18} />
                <input
                  type="text"
                  name="medecin"
                  required
                  value={formData.medecin}
                  onChange={handleChange}
                  placeholder="Ex: Dr. Mohamed Taha"
                />
              </div>
              <small>Renseignez le prescripteur ou le cabinet médical.</small>
            </div>
          </div>

          <div className="ordonnance-form-grid secondary-grid">
            <div className="ordonnance-field-card">
              <label>Date de l’ordonnance</label>
              <div className="input-with-icon">
                <CalendarDays size={18} />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="ordonnance-field-card">
              <label>Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange}>
                <option value="En attente">En attente</option>
                <option value="Dispensée">Dispensée</option>
              </select>
              <small>Le statut passe automatiquement à « Dispensée » lors d’une vente liée.</small>
            </div>
          </div>

          <div className="ordonnance-info-banner">
            <strong>Astuce :</strong> plus besoin de saisir manuellement les produits ici. La sélection des médicaments se fait dans le module de vente.
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
                initialData ? 'Mettre à jour' : 'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdonnanceFormModal;
