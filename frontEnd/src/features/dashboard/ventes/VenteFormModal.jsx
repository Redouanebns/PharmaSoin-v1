import React, { useEffect, useMemo, useState } from 'react';
import BarcodeScanner from './BarcodeScanner';
import './VenteFormModal.css';

const emptyProduit = () => ({ medicine_id: '', medicament: '', code: '', qte: 1, prix_unitaire: 0, ordonnance_requise: false });

const mapProduitFromMedicine = (medicine) => ({
  medicine_id: medicine.id,
  medicament: medicine.nom,
  code: medicine.code,
  qte: 1,
  prix_unitaire: Number(medicine.prix || 0),
  ordonnance_requise: Boolean(medicine.ordonnance),
});

const isExpiredMedicine = (medicine) => {
  if (!medicine?.exp) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(medicine.exp);
  expirationDate.setHours(0, 0, 0, 0);
  return expirationDate < today;
};

const isVendableMedicine = (medicine) => !isExpiredMedicine(medicine) && Number(medicine?.stock || 0) > 0;

const getInitial = (data) => {
  if (data?.prefillMedicine) {
    return {
      client: '',
      date: new Date().toISOString().split('T')[0],
      paiement: 'Espèces',
      statut: 'Complétée',
      ordonnance: Boolean(data.prefillMedicine.ordonnance),
      ordonnance_id: '',
      scanCode: '',
      medicineSearch: '',
      produits: [mapProduitFromMedicine(data.prefillMedicine)],
    };
  }

  return {
    client: data?.client || '',
    date: data?.date || new Date().toISOString().split('T')[0],
    paiement: data?.paiement || 'Espèces',
    statut: data?.statut || 'Complétée',
    ordonnance: data?.ordonnance ?? false,
    ordonnance_id: data?.ordonnance_id || '',
    scanCode: '',
    medicineSearch: '',
    produits: data?.produits?.length
      ? data.produits.map((item) => ({
          medicine_id: item.medicine_id,
          medicament: item.medicament,
          code: item.code,
          qte: item.qte,
          prix_unitaire: Number(item.prix_unitaire || 0),
          ordonnance_requise: Boolean(item.ordonnance_requise),
        }))
      : [emptyProduit()],
  };
};

const VenteFormModal = ({ isOpen, onClose, onSave, initialData, medicines = [], ordonnances = [], isSaving = false }) => {
  const [form, setForm] = useState(getInitial(initialData));

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanSuccess, setScanSuccess] = useState('');
  const [scanError, setScanError] = useState('');

  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => setIsScannerOpen(false);

  const availableMedicines = useMemo(
    () => medicines.filter(isVendableMedicine),
    [medicines],
  );

  const handleCameraScan = (code) => {
    setScanError('');
    setScanSuccess('');
    const scanned = availableMedicines.find((medicine) => medicine.code === code.trim());
    if (!scanned) {
      setScanError(`Aucun médicament vendable trouvé pour : ${code}`);
      setTimeout(() => setScanError(''), 4000);
      return;
    }
    addMedicineToForm(scanned);
    setScanSuccess(`"${scanned.nom}" ajouté au panier.`);
    setTimeout(() => setScanSuccess(''), 3000);
  };

  useEffect(() => {
    setForm(getInitial(initialData));
  }, [initialData, isOpen, medicines]);

  const total = form.produits.reduce((sum, product) => sum + Number(product.qte || 0) * Number(product.prix_unitaire || 0), 0);

  const matchingMedicines = useMemo(() => {
    const query = form.medicineSearch.trim().toLowerCase();
    return availableMedicines.filter((medicine) => {
      if (!query) return true;
      return `${medicine.nom} ${medicine.code} ${medicine.dci || ''} ${medicine.molecule || ''}`.toLowerCase().includes(query);
    });
  }, [form.medicineSearch, availableMedicines]);

  if (!isOpen) return null;

  const updateOrdonnanceRequirement = (products) => {
    const requires = products.some((product) => product.ordonnance_requise);
    setForm((prev) => ({
      ...prev,
      produits: products,
      ordonnance: prev.ordonnance || requires,
    }));
  };

  const handleBase = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProduit = (index, field, value) => {
    const products = [...form.produits];
    const current = { ...products[index] };

    if (field === 'medicine_id') {
      const medicine = availableMedicines.find((item) => String(item.id) === String(value));
      products[index] = medicine
        ? {
            ...current,
            ...mapProduitFromMedicine(medicine),
            qte: current.qte || 1,
          }
        : { ...current, medicine_id: value };
      updateOrdonnanceRequirement(products);
      return;
    }

    products[index] = { ...current, [field]: value };
    updateOrdonnanceRequirement(products);
  };

  const addProduit = (medicine = null) => {
    const products = [
      ...form.produits,
      medicine ? mapProduitFromMedicine(medicine) : emptyProduit(),
    ];
    updateOrdonnanceRequirement(products);
  };

  const removeProduit = (index) => {
    const products = form.produits.filter((_, currentIndex) => currentIndex !== index);
    updateOrdonnanceRequirement(products.length ? products : [emptyProduit()]);
  };

  const addMedicineToForm = (medicine) => {
    const existingIndex = form.produits.findIndex((product) => String(product.medicine_id) === String(medicine.id));
    if (existingIndex >= 0) {
      const products = [...form.produits];
      products[existingIndex] = {
        ...products[existingIndex],
        qte: Number(products[existingIndex].qte || 0) + 1,
      };
      updateOrdonnanceRequirement(products);
      return;
    }
    addProduit(medicine);
  };

  const handleScan = () => {
    const scanned = availableMedicines.find((medicine) => medicine.code === form.scanCode.trim());
    if (!scanned) {
      alert('Aucun médicament vendable trouvé pour ce code-barres. Vérifiez le stock et la date de péremption.');
      return;
    }
    addMedicineToForm(scanned);
    setForm((prev) => ({ ...prev, scanCode: '' }));
  };

  const handleOrdonnanceSelect = (event) => {
    const value = event.target.value;
    const ordonnance = ordonnances.find((item) => String(item.id) === String(value));
    setForm((prev) => ({
      ...prev,
      ordonnance_id: value,
      ordonnance: value ? true : prev.ordonnance,
      client: value ? ordonnance?.patient || prev.client : prev.client,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      client: form.client,
      date: form.date,
      paiement: form.paiement,
      statut: form.statut,
      ordonnance: Boolean(form.ordonnance),
      ordonnance_id: form.ordonnance_id || null,
      produits: form.produits
        .filter((product) => product.medicine_id)
        .map((product) => ({
          medicine_id: Number(product.medicine_id),
          qte: Number(product.qte || 1),
          prix_unitaire: Number(product.prix_unitaire || 0),
        })),
      total,
    });
  };

  return (
    <div className="vmodal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="vmodal-content vmodal-wide">
        <div className="vmodal-header">
          <div className="vmodal-header-left">
            <div className="vmodal-icon">
              <i className="fas fa-cash-register"></i>
            </div>
            <div>
              <h3>Nouvelle Vente</h3>
              <p className="vmodal-subtitle">Ajout rapide, scan code-barres et génération de facture</p>
            </div>
          </div>
          <button className="vmodal-close" onClick={onClose} type="button">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vmodal-body">
          <div className="vgrid-layout">
            <div className="vform-main">
              <div className="vform-row">
                <div className="vform-group">
                  <label><i className="fas fa-user me-1"></i>Client</label>
                  <input type="text" name="client" value={form.client} onChange={handleBase} placeholder="Nom du client (optionnel)" className="vform-input" />
                </div>
                <div className="vform-group">
                  <label><i className="fas fa-calendar me-1"></i>Date de vente</label>
                  <input type="date" name="date" value={form.date} onChange={handleBase} className="vform-input" required />
                </div>
              </div>

              <div className="vform-row">
                <div className="vform-group">
                  <label><i className="fas fa-wallet me-1"></i>Mode de paiement</label>
                  <select name="paiement" value={form.paiement} onChange={handleBase} className="vform-input" required>
                    <option value="Espèces">Espèces</option>
                    <option value="Carte">Carte bancaire</option>
                    <option value="Virement">Virement</option>
                    <option value="Assurance">Assurance</option>
                  </select>
                </div>
                <div className="vform-group">
                  <label><i className="fas fa-tag me-1"></i>Statut</label>
                  <select name="statut" value={form.statut} onChange={handleBase} className="vform-input" required>
                    <option value="Complétée">Complétée</option>
                    <option value="En attente">En attente</option>
                  </select>
                </div>
              </div>

              <div className="vform-row">
                <div className="vform-group">
                  <label><i className="fas fa-file-medical me-1"></i>Lier une ordonnance</label>
                  <select name="ordonnance_id" value={form.ordonnance_id} onChange={handleOrdonnanceSelect} className="vform-input">
                    <option value="">Aucune</option>
                    {ordonnances.map((ordonnance) => (
                      <option key={ordonnance.id} value={ordonnance.id}>
                        {ordonnance.numero} — {ordonnance.patient}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="vform-group">
                  <label><i className="fas fa-barcode me-1"></i>Scan médicament</label>
                  <div className="vscan-row">
                    <input type="text" name="scanCode" value={form.scanCode} onChange={handleBase} placeholder="Saisir le code-barres manuellement" className="vform-input" />
                    <button type="button" className="vscan-btn" onClick={handleScan}>Valider</button>
                    <button type="button" className="vscan-btn vscan-btn--camera" onClick={openScanner} title="Scanner via caméra">
                      <i className="fas fa-camera" />
                    </button>
                  </div>
                  {scanSuccess && (
                    <div className="vscan-toast vscan-toast--success">
                      <i className="fas fa-check-circle" /> {scanSuccess}
                    </div>
                  )}
                  {scanError && (
                    <div className="vscan-toast vscan-toast--error">
                      <i className="fas fa-exclamation-circle" /> {scanError}
                    </div>
                  )}
                </div>
              </div>

              <div className="vform-group">
                <label><i className="fas fa-file-medical me-1"></i>Ordonnance</label>
                <div className="vordonnance-row">
                  <label className="vtoggle">
                    <input type="checkbox" name="ordonnance" checked={form.ordonnance} onChange={handleBase} />
                    <span className="vtoggle-slider"></span>
                  </label>
                  <span className="vtoggle-label">
                    {form.ordonnance ? '✅ Vente sur ordonnance' : '❌ Vente sans ordonnance'}
                  </span>
                </div>
              </div>

              <div className="vproduits-section">
                <div className="vproduits-header">
                  <span className="vproduits-title">
                    <i className="fas fa-pills me-2"></i>
                    Produits vendus
                  </span>
                  <button type="button" className="vadd-produit-btn" onClick={() => addProduit()}>
                    <i className="fas fa-plus me-1"></i>Ajouter ligne
                  </button>
                </div>

                {form.produits.map((product, index) => (
                  <div className="vproduit-row vproduit-row-large" key={`${product.medicine_id}-${index}`}>
                    <div className="vform-group vproduit-med">
                      <label>Médicament</label>
                      <select value={product.medicine_id} onChange={(event) => handleProduit(index, 'medicine_id', event.target.value)} className="vform-input" required>
                        <option value="">Choisir un médicament</option>
                        {availableMedicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.nom} — {medicine.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="vform-group vproduit-code">
                      <label>Code</label>
                      <input type="text" value={product.code || ''} readOnly className="vform-input" />
                    </div>
                    <div className="vform-group vproduit-qty">
                      <label>Qté</label>
                      <input type="number" min="1" value={product.qte} onChange={(event) => handleProduit(index, 'qte', event.target.value)} className="vform-input" required />
                    </div>
                    <div className="vform-group vproduit-prix">
                      <label>Prix unit. (DH)</label>
                      <input type="number" min="0" step="0.01" value={product.prix_unitaire} onChange={(event) => handleProduit(index, 'prix_unitaire', event.target.value)} className="vform-input" required />
                    </div>
                    <div className="vform-group vproduit-sous">
                      <label>Sous-total</label>
                      <div className="vsoustotal">{(Number(product.qte) * Number(product.prix_unitaire)).toFixed(2)} DH</div>
                    </div>
                    <button type="button" className="vremove-btn" onClick={() => removeProduit(index)} disabled={form.produits.length === 1} title="Supprimer">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}

                <div className="vtotal-bar">
                  <span>Total de la vente</span>
                  <span className="vtotal-amount">{total.toFixed(2)} DH</span>
                </div>
              </div>
            </div>

            <aside className="vcatalog-panel">
              <div className="vcatalog-header">
                <h4>Médicaments disponibles</h4>
                <p>Cliquer sur ajouter charge les informations dans le formulaire. Les produits périmés ou sans stock sont masqués.</p>
              </div>
              <div className="vcatalog-search">
                <i className="fas fa-search"></i>
                <input type="text" name="medicineSearch" value={form.medicineSearch} onChange={handleBase} placeholder="Rechercher par nom, molécule ou code..." />
              </div>
              <div className="vcatalog-list">
                {matchingMedicines.length > 0 ? (
                  matchingMedicines.map((medicine) => (
                    <div className="vcatalog-card" key={medicine.id}>
                      <div>
                        <div className="vcatalog-name">{medicine.nom}</div>
                        <div className="vcatalog-meta">{medicine.code} • {medicine.prix} DH</div>
                        <div className="vcatalog-meta">Stock: {medicine.stock} • {medicine.molecule || medicine.dci}</div>
                      </div>
                      <button type="button" className="vcatalog-add" onClick={() => addMedicineToForm(medicine)}>
                        Ajouter
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="vcatalog-card">
                    <div>
                      <div className="vcatalog-name">Aucun produit vendable</div>
                      <div className="vcatalog-meta">Ajustez votre recherche ou réapprovisionnez le stock avec une date valide.</div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="vmodal-footer">
            <button type="button" className="vbtn-cancel" onClick={onClose}>
              <i className="fas fa-times me-1"></i>Annuler
            </button>
            <button type="submit" className="vbtn-save" disabled={isSaving || availableMedicines.length === 0}>
              <i className="fas fa-file-invoice me-1"></i>
              {isSaving ? 'Création...' : 'Terminer et créer la facture'}
            </button>
          </div>
        </form>
      </div>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onDetected={handleCameraScan}
        onClose={closeScanner}
      />
    </div>
  );
};

export default VenteFormModal;
