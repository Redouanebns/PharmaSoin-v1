import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import './Stock.css';

const getInitialState = (type) => ({
  medicine_id: '',
  fournisseur_id: '',
  date: new Date().toISOString().split('T')[0],
  quantite: 1,
  lot: '',
  exp: '',
  motif: type === 'entree' ? 'Réception fournisseur' : 'Sortie manuelle',
  operateur: 'Admin',
});

const isExpiredMedicine = (medicine) => {
  if (!medicine?.exp) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(medicine.exp);
  expirationDate.setHours(0, 0, 0, 0);

  return expirationDate < today;
};

const StockMovementFormModal = ({ isOpen, onClose, onSave, type = 'entree', isSaving = false }) => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState(getInitialState(type));

  useEffect(() => {
    setFormData(getInitialState(type));
  }, [type, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDependencies = async () => {
      try {
        const [medResponse, supplierResponse] = await Promise.all([
          api.get('/medicaments'),
          api.get('/fournisseurs'),
        ]);
        setMedicines(Array.isArray(medResponse.data) ? medResponse.data : []);
        setSuppliers(Array.isArray(supplierResponse.data) ? supplierResponse.data : []);
      } catch (error) {
        console.error('Erreur chargement formulaire stock', error);
      }
    };

    fetchDependencies();
  }, [isOpen]);

  const selectableMedicines = useMemo(() => {
    const filtered = medicines.filter((medicine) => {
      if (type === 'entree') {
        return true;
      }

      return Number(medicine.stock || 0) > 0 && !isExpiredMedicine(medicine);
    });

    return filtered.sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr'));
  }, [medicines, type]);

  const selectedMedicine = useMemo(
    () => selectableMedicines.find((medicine) => String(medicine.id) === String(formData.medicine_id)) || null,
    [formData.medicine_id, selectableMedicines],
  );

  const hasSelectableMedicines = selectableMedicines.length > 0;

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...formData,
      type,
      quantite: Number(formData.quantite || 0),
      fournisseur_id: formData.fournisseur_id || null,
    });
  };

  return (
    <div className="stock-modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="stock-modal-content">
        <div className="stock-modal-header">
          <div>
            <h3>{type === 'entree' ? 'Nouvelle entrée de stock' : 'Nouvelle sortie de stock'}</h3>
            <p>{type === 'entree' ? 'Ajoutez une réception fournisseur et mettez à jour le stock.' : 'Enregistrez une sortie manuelle en excluant automatiquement les produits périmés.'}</p>
          </div>
          <button type="button" className="stock-modal-close" onClick={onClose}>×</button>
        </div>

        <form className="stock-modal-body" onSubmit={handleSubmit}>
          <div className="stock-form-grid">
            <div className="stock-form-group">
              <label>Médicament</label>
              <select name="medicine_id" value={formData.medicine_id} onChange={handleChange} required disabled={!hasSelectableMedicines}>
                <option value="">Choisir un médicament</option>
                {selectableMedicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.nom} — {medicine.code}
                  </option>
                ))}
              </select>
              <small className="stock-field-helper">
                {type === 'entree'
                  ? "Ajoutez uniquement des lots avec une date d'expiration valide pour garder un stock propre."
                  : hasSelectableMedicines
                    ? "Seuls les médicaments en stock et non périmés apparaissent dans cette liste."
                    : 'Aucun produit vendable dans le stock pour le moment.'}
              </small>
            </div>

            <div className="stock-form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="stock-form-group">
              <label>Quantité</label>
              <input type="number" min="1" name="quantite" value={formData.quantite} onChange={handleChange} required />
            </div>

            <div className="stock-form-group">
              <label>Fournisseur</label>
              <select name="fournisseur_id" value={formData.fournisseur_id} onChange={handleChange}>
                <option value="">Aucun</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="stock-form-group">
              <label>N° Lot</label>
              <input type="text" name="lot" value={formData.lot} onChange={handleChange} placeholder="LOT-2026-001" />
            </div>

            <div className="stock-form-group">
              <label>Expiration</label>
              <input type="date" name="exp" value={formData.exp} onChange={handleChange} min={type === 'entree' ? new Date().toISOString().split('T')[0] : undefined} />
            </div>
          </div>

          {selectedMedicine && (
            <div className="stock-inline-summary">
              <div>
                <strong>{selectedMedicine.nom}</strong>
                <span>{selectedMedicine.code}</span>
              </div>
              <div>
                <strong>{Number(selectedMedicine.stock || 0)}</strong>
                <span>unités disponibles</span>
              </div>
              <div>
                <strong>{selectedMedicine.exp || '—'}</strong>
                <span>expiration</span>
              </div>
            </div>
          )}

          <div className="stock-form-group">
            <label>Motif</label>
            <input type="text" name="motif" value={formData.motif} onChange={handleChange} required />
          </div>

          <div className="stock-form-group">
            <label>Opérateur</label>
            <input type="text" name="operateur" value={formData.operateur} onChange={handleChange} required />
          </div>

          <div className="stock-modal-footer">
            <button type="button" className="stock-secondary-btn" onClick={onClose} disabled={isSaving}>Annuler</button>
            <button type="submit" className="stock-primary-btn" disabled={isSaving || (type === 'sortie' && !hasSelectableMedicines)}>
              {isSaving ? 'Enregistrement...' : type === 'entree' ? 'Valider l’entrée' : 'Valider la sortie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementFormModal;
