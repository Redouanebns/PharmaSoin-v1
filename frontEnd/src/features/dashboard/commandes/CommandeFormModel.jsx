import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, X, Search, Package } from 'lucide-react';
import api from '../../../services/api';
import './CommandeFormModel.css';

const emptyProduct = () => ({
  medicine_id: '',
  name: '',
  code: '',
  quantity: 1,
  price: 0,
  lot: '',
  expiration_date: '',
  is_manual: false,
});

const CommandeFormModel = ({ isOpen, onClose, onSave, commande, suppliers }) => {
  const [medicines, setMedicines] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [formData, setFormData] = useState({
    numero_commande: '',
    fournisseur_id: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    montant: 0,
    statut: 'En attente',
    produits: [],
  });

  const fetchMedicines = useCallback(async () => {
    try {
      const response = await api.get('/medicaments');
      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement médicaments:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchMedicines();
  }, [isOpen, fetchMedicines]);

  useEffect(() => {
    if (commande) {
      const existingProduits = (Array.isArray(commande.produits) ? commande.produits : []).map((product) => ({
        medicine_id: product.medicine_id || '',
        name: product.name || '',
        code: product.code || '',
        quantity: product.quantity || 1,
        price: product.price || 0,
        lot: product.lot || '',
        expiration_date: product.expiration_date || '',
        is_manual: !product.medicine_id,
      }));

      setFormData({
        numero_commande: commande.numero_commande || '',
        fournisseur_id: commande.fournisseur_id || '',
        date_commande: (commande.date_commande || '').split('T')[0],
        date_livraison_prevue: (commande.date_livraison_prevue || '').split('T')[0],
        montant: commande.montant || 0,
        statut: commande.statut || 'En attente',
        produits: existingProduits,
      });
    } else {
      setFormData({
        numero_commande: `CMD${Math.floor(Math.random() * 9000 + 1000)}`,
        fournisseur_id: '',
        date_commande: new Date().toISOString().split('T')[0],
        date_livraison_prevue: '',
        montant: 0,
        statut: 'En attente',
        produits: [emptyProduct()],
      });
    }
    setMedicineSearch('');
  }, [commande, isOpen]);

  const recalculateTotal = useCallback((products) => {
    return products.reduce((sum, product) => {
      const qty = Number(product.quantity) || 0;
      const unitPrice = Number(product.price) || 0;
      return sum + qty * unitPrice;
    }, 0);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.produits];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'medicine_id') {
        const medicine = medicines.find((m) => String(m.id) === String(value));
        if (medicine) {
          updated[index] = {
            ...updated[index],
            medicine_id: medicine.id,
            name: medicine.nom,
            code: medicine.code,
            price: Number(medicine.prix || 0),
          };
        }
      }

      const newTotal = recalculateTotal(updated);
      return { ...prev, produits: updated, montant: newTotal };
    });
  };

  const addProduct = () => {
    setFormData((prev) => {
      const updated = [...prev.produits, emptyProduct()];
      return { ...prev, produits: updated };
    });
  };

  const removeProduct = (index) => {
    setFormData((prev) => {
      const updated = prev.produits.filter((_, i) => i !== index);
      const newTotal = recalculateTotal(updated);
      return { ...prev, produits: updated, montant: newTotal };
    });
  };

  const addMedicineFromCatalog = (medicine) => {
    setFormData((prev) => {
      const existing = prev.produits.findIndex((p) => String(p.medicine_id) === String(medicine.id));
      let updated;

      if (existing >= 0) {
        updated = [...prev.produits];
        updated[existing] = {
          ...updated[existing],
          quantity: Number(updated[existing].quantity || 0) + 1,
        };
      } else {
        updated = [
          ...prev.produits.filter((p) => p.medicine_id !== '' || p.is_manual),
          {
            medicine_id: medicine.id,
            name: medicine.nom,
            code: medicine.code,
            quantity: 1,
            price: Number(medicine.prix || 0),
            lot: '',
            expiration_date: '',
            is_manual: false,
          },
        ];
      }

      const newTotal = recalculateTotal(updated);
      return { ...prev, produits: updated, montant: newTotal };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validProduits = formData.produits.filter((p) => p.medicine_id !== '' || (p.is_manual && p.name.trim() !== ''));
    onSave({ ...formData, produits: validProduits });
  };

  const filteredMedicines = useMemo(() => {
    const query = medicineSearch.trim().toLowerCase();
    return medicines.filter((m) => {
      if (!query) return true;
      return `${m.nom} ${m.code} ${m.dci || ''}`.toLowerCase().includes(query);
    });
  }, [medicines, medicineSearch]);

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="cmd-modal">
        <div className="cmd-header">
          <div className="cmd-header-left">
            <div className="cmd-header-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div>
              <h3>{commande ? 'Modifier la commande' : 'Nouvelle commande fournisseur'}</h3>
              <p>Sélectionnez les médicaments dans le catalogue, ajoutez lot et date d'expiration.</p>
            </div>
          </div>
          <button className="cmd-close" onClick={onClose} type="button">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cmd-body">
          {/* Top info row */}
          <div className="cmd-grid-2">
            <div className="cmd-field">
              <label>N° Commande</label>
              <input
                type="text"
                name="numero_commande"
                value={formData.numero_commande}
                readOnly
                className="cmd-input cmd-readonly"
              />
            </div>
            <div className="cmd-field">
              <label>Fournisseur <span className="required">*</span></label>
              <select
                name="fournisseur_id"
                value={formData.fournisseur_id}
                onChange={handleChange}
                required
                className="cmd-input"
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cmd-grid-3">
            <div className="cmd-field">
              <label>Date commande <span className="required">*</span></label>
              <input
                type="date"
                name="date_commande"
                value={formData.date_commande}
                onChange={handleChange}
                required
                className="cmd-input"
              />
            </div>
            <div className="cmd-field">
              <label>Livraison prévue <span className="required">*</span></label>
              <input
                type="date"
                name="date_livraison_prevue"
                value={formData.date_livraison_prevue}
                onChange={handleChange}
                required
                className="cmd-input"
              />
            </div>
            <div className="cmd-field">
              <label>Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange} className="cmd-input">
                <option value="En attente">En attente</option>
                <option value="Livrée">Livrée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </div>
          </div>

          {/* Two-column layout: catalog + products */}
          <div className="cmd-products-layout">
            {/* Left: Catalog */}
            <aside className="cmd-catalog">
              <div className="cmd-catalog-header">
                <Package size={18} />
                <h4>Catalogue médicaments</h4>
              </div>
              <div className="cmd-catalog-search">
                <Search size={16} />
                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(event) => setMedicineSearch(event.target.value)}
                  placeholder="Nom, DCI ou code..."
                />
              </div>
              <div className="cmd-catalog-list">
                {filteredMedicines.length === 0 ? (
                  <p className="cmd-empty-catalog">Aucun médicament trouvé</p>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <div key={medicine.id} className="cmd-catalog-item">
                      <div className="cmd-catalog-info">
                        <span className="cmd-catalog-name">{medicine.nom}</span>
                        <span className="cmd-catalog-meta">{medicine.code} • {medicine.dose || '—'} • {Number(medicine.prix || 0).toFixed(2)} DH</span>
                      </div>
                      <button
                        type="button"
                        className="cmd-catalog-add"
                        onClick={() => addMedicineFromCatalog(medicine)}
                        title="Ajouter"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* Right: Product lines */}
            <div className="cmd-products-panel">
              <div className="cmd-products-header">
                <h4>Produits à commander ({formData.produits.filter((p) => p.medicine_id || (p.is_manual && p.name.trim() !== '')).length})</h4>
                <button type="button" className="cmd-add-product" onClick={addProduct}>
                  <Plus size={16} /> Ligne vide
                </button>
              </div>

              {formData.produits.length === 0 ? (
                <div className="cmd-products-empty">
                  Utilisez le catalogue à gauche pour ajouter des médicaments.
                </div>
              ) : (
                <div className="cmd-products-list">
                  {formData.produits.map((product, index) => (
                    <div key={index} className="cmd-product-card">
                      <div className="cmd-product-row-top">
                        <div className="cmd-field flex-1">
                          <label>Médicament</label>
                          {product.is_manual ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                className="cmd-input"
                                placeholder="Nom du nouveau médicament *"
                                value={product.name}
                                onChange={(event) => handleProductChange(index, 'name', event.target.value)}
                                required
                                style={{ flex: 2 }}
                              />
                              <input
                                type="text"
                                className="cmd-input"
                                placeholder="Code-barres (facultatif)"
                                value={product.code}
                                onChange={(event) => handleProductChange(index, 'code', event.target.value)}
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleProductChange(index, 'is_manual', false);
                                  handleProductChange(index, 'medicine_id', '');
                                  handleProductChange(index, 'name', '');
                                  handleProductChange(index, 'code', '');
                                }}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.55rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', color: '#475569', fontWeight: '700', transition: 'all 0.2s' }}
                              >
                                <i className="fas fa-list"></i> Catalogue
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <select
                                className="cmd-input"
                                value={product.medicine_id}
                                onChange={(event) => handleProductChange(index, 'medicine_id', event.target.value)}
                                required
                              >
                                <option value="">Choisir un médicament</option>
                                {medicines.map((m) => (
                                  <option key={m.id} value={m.id}>{m.nom} — {m.code}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  handleProductChange(index, 'is_manual', true);
                                  handleProductChange(index, 'medicine_id', '');
                                  handleProductChange(index, 'name', '');
                                  handleProductChange(index, 'code', '');
                                }}
                                style={{ background: '#0f766e', color: 'white', border: 'none', padding: '0.55rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', fontWeight: '700', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(15,118,110,0.15)' }}
                                title="Saisir un nouveau médicament qui n'existe pas dans le catalogue"
                              >
                                <Plus size={14} /> Nouveau
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="cmd-remove-product"
                          onClick={() => removeProduct(index)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="cmd-product-row-bottom">
                        <div className="cmd-field">
                          <label>Qté</label>
                          <input
                            type="number"
                            className="cmd-input"
                            value={product.quantity}
                            min="1"
                            onChange={(event) => handleProductChange(index, 'quantity', parseInt(event.target.value) || 1)}
                            required
                          />
                        </div>
                        <div className="cmd-field">
                          <label>Prix unit. (DH)</label>
                          <input
                            type="number"
                            className="cmd-input"
                            value={product.price}
                            min="0"
                            step="0.01"
                            onChange={(event) => handleProductChange(index, 'price', parseFloat(event.target.value) || 0)}
                            required
                          />
                        </div>
                        <div className="cmd-field">
                          <label>Lot</label>
                          <input
                            type="text"
                            className="cmd-input"
                            value={product.lot}
                            onChange={(event) => handleProductChange(index, 'lot', event.target.value)}
                            placeholder="Ex: LOT-2025"
                          />
                        </div>
                        <div className="cmd-field">
                          <label>Date d'expiration</label>
                          <input
                            type="date"
                            className="cmd-input"
                            value={product.expiration_date}
                            onChange={(event) => handleProductChange(index, 'expiration_date', event.target.value)}
                          />
                        </div>
                      </div>

                      {product.code && (
                        <div className="cmd-product-code-bar">
                          <span>Code : {product.code}</span>
                          <span className="cmd-product-subtotal">
                            Sous-total : <strong>{(Number(product.quantity) * Number(product.price)).toFixed(2)} DH</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="cmd-footer">
            <div className="cmd-total">
              Total commande : <strong>{Number(formData.montant).toFixed(2)} DH</strong>
            </div>
            <div className="cmd-footer-actions">
              <button type="button" className="cmd-btn-cancel" onClick={onClose}>Annuler</button>
              <button type="submit" className="cmd-btn-submit">
                {commande ? '💾 Modifier' : '✅ Créer la commande'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommandeFormModel;
