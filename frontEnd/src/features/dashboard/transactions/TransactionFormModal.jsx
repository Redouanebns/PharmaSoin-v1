import React, { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, FileText, Wallet, X } from 'lucide-react';
import './TransactionsList.css';

const getInitialState = (transaction) => ({
  type: transaction?.type || 'credit',
  source: transaction?.source || 'manual',
  montant: transaction?.montant ?? 0,
  description: transaction?.description || '',
  paiement: transaction?.paiement || 'Espèces',
  date: transaction?.date || new Date().toISOString().split('T')[0],
  statut: transaction?.statut || 'Confirmée',
});

const TransactionFormModal = ({ isOpen, onClose, onSave, transaction, isSaving = false }) => {
  const [formData, setFormData] = useState(getInitialState(transaction));

  useEffect(() => {
    setFormData(getInitialState(transaction));
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'montant' ? value : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...formData,
      montant: Number(formData.montant || 0),
      source: 'manual',
    });
  };

  return (
    <div className="trx-modal-overlay" onClick={(event) => event.target === event.currentTarget && !isSaving && onClose()}>
      <div className="trx-modal-card">
        <div className="trx-modal-header">
          <div>
            <span className="trx-modal-kicker">Flux financier</span>
            <h3>{transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}</h3>
            <p>Les transactions liées aux ventes et commandes sont générées automatiquement. Ce formulaire sert aux écritures manuelles.</p>
          </div>
          <button type="button" className="trx-icon-btn" onClick={onClose} disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="trx-form-grid">
          <div className="trx-field-card">
            <label>Type</label>
            <div className="trx-input-wrap">
              <Wallet size={18} />
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="credit">Entrée</option>
                <option value="debit">Sortie</option>
              </select>
            </div>
          </div>

          <div className="trx-field-card">
            <label>Montant</label>
            <div className="trx-input-wrap">
              <CreditCard size={18} />
              <input type="number" min="0" step="0.01" name="montant" value={formData.montant} onChange={handleChange} required />
            </div>
          </div>

          <div className="trx-field-card full-span">
            <label>Description</label>
            <div className="trx-input-wrap textarea-wrap">
              <FileText size={18} />
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required placeholder="Ex: Dépôt bancaire, frais de maintenance, remboursement..." />
            </div>
          </div>

          <div className="trx-field-card">
            <label>Mode de paiement</label>
            <select className="trx-plain-select" name="paiement" value={formData.paiement} onChange={handleChange}>
              <option value="Espèces">Espèces</option>
              <option value="Carte">Carte</option>
              <option value="Virement">Virement</option>
              <option value="Chèque">Chèque</option>
            </select>
          </div>

          <div className="trx-field-card">
            <label>Date</label>
            <div className="trx-input-wrap">
              <CalendarDays size={18} />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
          </div>

          <div className="trx-field-card full-span">
            <label>Statut</label>
            <select className="trx-plain-select" name="statut" value={formData.statut} onChange={handleChange}>
              <option value="Confirmée">Confirmée</option>
              <option value="En attente">En attente</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          <div className="trx-modal-footer full-span">
            <button type="button" className="trx-btn-secondary" onClick={onClose} disabled={isSaving}>Annuler</button>
            <button type="submit" className="trx-btn-primary" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : transaction ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
