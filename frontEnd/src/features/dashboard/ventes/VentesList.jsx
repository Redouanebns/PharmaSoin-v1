import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import VenteFormModal from './VenteFormModal';
import BarcodeScanner from './BarcodeScanner';
import './VentesList.css';

const STATUS_CLASS = {
  Complétée: 'status-complete',
  Payée: 'status-complete',
  'En attente': 'status-pending',
  Annulée: 'status-cancelled',
  Refusée: 'status-cancelled',
  Remboursée: 'status-refunded',
};

const PAYMENT_ICON = {
  Espèces: 'fa-money-bill-wave',
  Carte: 'fa-credit-card',
  Virement: 'fa-university',
  Assurance: 'fa-shield-alt',
};

const isExpiredMedicine = (medicine) => {
  if (!medicine?.exp) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(medicine.exp);
  expirationDate.setHours(0, 0, 0, 0);
  return expirationDate < today;
};

// =====================================================================
// PDF INVOICE GENERATOR (pure browser, no external dependency)
// =====================================================================
const printInvoicePDF = (vente) => {
  const siteName = 'PharmaSoin';
  const produits = vente.produits || [];
  const rows = produits.map((p) => `
    <tr>
      <td>${p.medicament || '—'}</td>
      <td class="center">${p.code || '—'}</td>
      <td class="center">${p.qte}</td>
      <td class="right">${Number(p.prix_unitaire || 0).toFixed(2)} DH</td>
      <td class="right fw">${Number(p.subtotal || p.qte * p.prix_unitaire || 0).toFixed(2)} DH</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Facture ${vente.facture_numero}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;font-size:13px;color:#1e293b;background:#fff;padding:2.5rem 3rem}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:3px solid #0f766e}
  .brand{color:#0f766e;font-size:1.7rem;font-weight:900;letter-spacing:-0.02em}
  .brand small{display:block;font-size:0.78rem;font-weight:600;color:#64748b;letter-spacing:0}
  .invoice-meta{text-align:right}
  .invoice-meta h2{font-size:1.1rem;font-weight:900;color:#0f172a;margin-bottom:0.3rem}
  .invoice-meta p{color:#64748b;font-size:0.82rem;line-height:1.6}
  .badge{display:inline-block;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.75rem;font-weight:700;background:#dcfce7;color:#15803d;margin-top:0.4rem}
  .badge.pending{background:#fef3c7;color:#92400e}
  .badge.cancelled{background:#fee2e2;color:#991b1b}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem}
  .info-box{background:#f8fafc;border-radius:12px;padding:1rem 1.2rem;border:1px solid #e2e8f0}
  .info-box h4{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:700;margin-bottom:0.6rem}
  .info-box p{color:#334155;font-size:0.87rem;line-height:1.7}
  table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
  thead th{background:#0f766e;color:#fff;padding:0.8rem 1rem;font-size:0.76rem;text-transform:uppercase;letter-spacing:0.06em;text-align:left}
  thead th:first-child{border-radius:8px 0 0 8px}
  thead th:last-child{border-radius:0 8px 8px 0}
  tbody tr{border-bottom:1px solid #f1f5f9}
  tbody tr:last-child{border-bottom:none}
  tbody td{padding:0.85rem 1rem;font-size:0.88rem;color:#334155}
  tfoot td{padding:0.7rem 1rem;font-size:0.9rem;font-weight:700;color:#0f172a;border-top:2px solid #e2e8f0}
  .total-row td{background:#f0fdf4;border-radius:8px;font-size:1rem;color:#0f766e}
  .center{text-align:center}
  .right{text-align:right}
  .fw{font-weight:700;color:#0f172a}
  .footer{text-align:center;color:#94a3b8;font-size:0.78rem;margin-top:2rem;padding-top:1rem;border-top:1px solid #e2e8f0}
  .footer strong{color:#0f766e}
</style>
</head>
<body>
  <div class="header">
    <div class="brand" style="display: flex; align-items: center; gap: 12px;">
      <img src="${window.location.origin}/assets/images/logo.png" alt="Logo PharmaSoin" style="width: 54px; height: 54px; object-fit: contain; border-radius: 8px;" />
      <div>
        ${siteName}
        <small>Système de Gestion Pharmaceutique</small>
      </div>
    </div>
    <div class="invoice-meta">
      <h2>FACTURE</h2>
      <p><strong>${vente.facture_numero}</strong></p>
      <p>Vente : ${vente.numero}</p>
      <p>Date : ${vente.date}</p>
      <p>Canal : <strong>${vente.source_channel === 'online' ? 'Commande en ligne' : 'Vente comptoir'}</strong></p>
      <span class="badge ${STATUS_CLASS[vente.statut] || ''}">${vente.statut}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h4>Client</h4>
      <p>
        <strong>${vente.client || 'Client comptoir'}</strong><br/>
        ${vente.contact_phone ? `Tél : ${vente.contact_phone}<br/>` : ''}
        ${vente.delivery_address ? `Adresse : ${vente.delivery_address}` : ''}
      </p>
    </div>
    <div class="info-box">
      <h4>Paiement</h4>
      <p>
        Mode : <strong>${vente.paiement || '—'}</strong><br/>
        Référence : ${vente.payment_reference || '—'}<br/>
        ${vente.ordonnance ? `Ordonnance : ${vente.ordonnance_numero || 'Oui'}` : 'Sans ordonnance'}
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Médicament</th>
        <th class="center">Code</th>
        <th class="center">Qté</th>
        <th class="right">Prix unitaire</th>
        <th class="right">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4" class="right">Total général :</td>
        <td class="right fw">${Number(vente.total || 0).toFixed(2)} DH</td>
      </tr>
    </tfoot>
  </table>

  ${vente.status_reason ? `<p style="color:#ef4444;font-size:0.86rem;margin-bottom:1rem"><strong>Motif :</strong> ${vente.status_reason}</p>` : ''}

  <div class="footer">
    Généré par <strong>${siteName}</strong> — ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>

  <script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.focus();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// =====================================================================
// EXPORT STATISTIQUES (CSV + JSON)
// =====================================================================
const exportStats = (ventes, saleType) => {
  const label = saleType === 'online' ? 'ventes-en-ligne' : 'ventes-comptoir';
  const now = new Date().toISOString().slice(0, 10);

  const rows = [
    ['N° Vente', 'N° Facture', 'Canal', 'Date', 'Client', 'Paiement', 'Ordonnance', 'Total (DH)', 'Statut'],
    ...ventes.map((v) => [
      v.numero,
      v.facture_numero,
      v.source_channel === 'online' ? 'En ligne' : 'Comptoir',
      v.date,
      v.client || 'Client comptoir',
      v.paiement,
      v.ordonnance ? `Oui — ${v.ordonnance_numero || ''}` : 'Non',
      Number(v.total || 0).toFixed(2),
      v.statut,
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${label}-${now}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// =====================================================================
// MAIN COMPONENT
// =====================================================================
const VentesList = ({ saleType = 'counter', isDarkMode, toggleDarkMode }) => {
  const isOnlineView = saleType === 'online';

  const [ventes, setVentes] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPaiement, setFilterPaiement] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
  const [invoiceBanner, setInvoiceBanner] = useState(null);
  const [medicineCatalogSearch, setMedicineCatalogSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ventesResponse, medicinesResponse, ordonnancesResponse] = await Promise.all([
        api.get('/ventes'),
        api.get('/medicaments'),
        api.get('/ordonnances'),
      ]);
      setVentes(Array.isArray(ventesResponse.data) ? ventesResponse.data : []);
      setMedicines(Array.isArray(medicinesResponse.data) ? medicinesResponse.data : []);
      setOrdonnances(Array.isArray(ordonnancesResponse.data) ? ordonnancesResponse.data : []);
    } catch (fetchError) {
      setError('Impossible de charger les ventes depuis le serveur Laravel.');
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter by channel (counter / online)
  const ventesFiltered = useMemo(() => {
    const channel = isOnlineView ? 'online' : 'counter';
    return ventes.filter((v) => (v.source_channel || 'counter') === channel);
  }, [ventes, isOnlineView]);

  const stats = useMemo(() => ({
    total: ventesFiltered.length,
    chiffre: ventesFiltered.filter((v) => ['Complétée', 'Payée'].includes(v.statut)).reduce((sum, v) => sum + Number(v.total || 0), 0),
    completes: ventesFiltered.filter((v) => ['Complétée', 'Payée'].includes(v.statut)).length,
    enAttente: ventesFiltered.filter((v) => v.statut === 'En attente').length,
  }), [ventesFiltered]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return ventesFiltered.filter((vente) =>
      (query === '' || `${vente.client || ''} ${vente.numero || ''} ${vente.facture_numero || ''} ${vente.source_channel || ''}`.toLowerCase().includes(query)) &&
      (filterStatut === '' || vente.statut === filterStatut) &&
      (filterPaiement === '' || vente.paiement === filterPaiement),
    );
  }, [ventesFiltered, search, filterStatut, filterPaiement]);

  const vendableMedicines = useMemo(
    () => medicines.filter((medicine) => !isExpiredMedicine(medicine) && Number(medicine.stock || 0) > 0),
    [medicines],
  );

  const filteredCatalog = useMemo(() => {
    const query = medicineCatalogSearch.toLowerCase();
    return vendableMedicines.filter((medicine) =>
      `${medicine.nom || ''} ${medicine.code || ''} ${medicine.molecule || ''} ${medicine.dci || ''}`.toLowerCase().includes(query),
    );
  }, [vendableMedicines, medicineCatalogSearch]);

  const handleAdd = (medicine = null) => {
    setPrefill(medicine ? { prefillMedicine: medicine } : null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette vente ? Si le stock a déjà été déduit, il sera recrédité.')) return;
    try {
      await api.delete(`/ventes/${id}`);
      await fetchData();
    } catch (requestError) {
      console.error(requestError);
      alert('Erreur lors de la suppression de la vente.');
    }
  };

  const handleSave = async (payload) => {
    try {
      setIsSaving(true);
      const response = await api.post('/ventes', payload);
      const created = response.data;
      setInvoiceBanner(created);
      setIsModalOpen(false);
      setExpandedRow(created.id);
      await fetchData();
    } catch (saveError) {
      console.error(saveError);
      alert(saveError.response?.data?.message || 'Erreur lors de la création de la facture.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSaleStatus = async (vente, statut, statusReason = '') => {
    try {
      setIsUpdatingStatus(vente.id);
      await api.put(`/ventes/${vente.id}/status`, { statut, status_reason: statusReason });
      await fetchData();
    } catch (requestError) {
      console.error(requestError);
      const validationErrors = requestError.response?.data?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      window.alert(firstError || requestError.response?.data?.message || 'Impossible de mettre à jour ce statut.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleAccept = (vente) => updateSaleStatus(vente, 'Complétée');

  const handleReject = (vente) => {
    const reason = window.prompt('Motif du refus (optionnel) :', vente.status_reason || '');
    updateSaleStatus(vente, 'Refusée', reason || '');
  };

  const toggleRow = (id) => setExpandedRow((previous) => (previous === id ? null : id));

  const pageTitle = isOnlineView ? 'Ventes en ligne' : 'Ventes comptoir';
  const pageDesc = isOnlineView
    ? 'Commandes passées en ligne par les clients. Validez ou refusez les commandes en attente.'
    : 'Préparez les factures de ventes au comptoir et consultez le catalogue médicament disponible.';
  const pageIcon = isOnlineView ? 'fas fa-globe' : 'fas fa-cash-register';

  return (
    <div className={`ventes-container ${isDarkMode ? 'dark-mode' : ''}`}>

      <div className="ventes-header">
        <div className="ventes-header-left">
          <div className="page-header-icon" style={isOnlineView ? { background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 10px 24px rgba(29, 78, 216, 0.3)' } : {}}>
            <i className={pageIcon}></i>
          </div>
          <div>
            <h1 className="ventes-title">{pageTitle}</h1>
            <p className="ventes-subtitle">
              {isOnlineView
                ? 'Commandes web des clients · validation admin/pharmacien requise'
                : 'Ventes au comptoir · facturation immédiate'}
            </p>
          </div>
        </div>
        <div className="ventes-header-actions">
          {!isOnlineView && (
            <button className="btn-new-vente" onClick={() => handleAdd()}>
              <i className="fas fa-plus-circle"></i>
              Nouvelle Vente
            </button>
          )}

        </div>
      </div>

      {invoiceBanner && !isOnlineView && (
        <div className="vente-invoice-banner">
          <div>
            <strong>Facture créée :</strong> {invoiceBanner.facture_numero} — Vente {invoiceBanner.numero}
          </div>
          <div>
            Client: {invoiceBanner.client || 'Client comptoir'} • Total: {Number(invoiceBanner.total || 0).toFixed(2)} DH
          </div>
        </div>
      )}

      {!isOnlineView && (
        <div className="ventes-catalog-card">
          <div className="ventes-catalog-header">
            <div>
              <h2>Médicaments disponibles sur le site</h2>
              <p>Seuls les produits vendables apparaissent ici : stock positif et date de péremption valide.</p>
            </div>
            <div className="ventes-search-box ventes-search-inline">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher un médicament ou un code..." value={medicineCatalogSearch} onChange={(event) => setMedicineCatalogSearch(event.target.value)} />
            </div>
          </div>
          <div className="ventes-catalog-grid">
            {filteredCatalog.map((medicine) => (
              <div className="ventes-catalog-item" key={medicine.id}>
                <div>
                  <div className="ventes-catalog-name">{medicine.nom}</div>
                  <div className="ventes-catalog-meta">{medicine.code} • {medicine.prix} DH • Stock {medicine.stock}</div>
                  <div className="ventes-catalog-meta">{medicine.molecule || medicine.dci} {medicine.ordonnance ? '• Ordonnance' : '• Sans ordonnance'}</div>
                </div>
                <button className="ventes-catalog-add" onClick={() => handleAdd(medicine)}>Ajouter</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOnlineView && (
        <div className="ventes-online-banner">
          <i className="fas fa-info-circle me-2"></i>
          <span>
            Les ventes en ligne proviennent des commandes passées par les clients via le portail web.
            Vous pouvez les <strong>accepter</strong> (déduction stock) ou les <strong>refuser</strong> avec motif.
          </span>
        </div>
      )}

      <div className="ventes-stats">
        <div className="vente-stat-card stat-blue">
          <div className="vente-stat-icon"><i className="fas fa-receipt"></i></div>
          <div>
            <span className="vente-stat-value">{stats.total}</span>
            <span className="vente-stat-label">Ventes totales</span>
          </div>
        </div>
        <div className="vente-stat-card stat-green">
          <div className="vente-stat-icon"><i className="fas fa-coins"></i></div>
          <div>
            <span className="vente-stat-value">{stats.chiffre.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</span>
            <span className="vente-stat-label">Chiffre d'affaires confirmé</span>
          </div>
        </div>
        <div className="vente-stat-card stat-teal">
          <div className="vente-stat-icon"><i className="fas fa-check-circle"></i></div>
          <div>
            <span className="vente-stat-value">{stats.completes}</span>
            <span className="vente-stat-label">Ventes complétées</span>
          </div>
        </div>
        <div className="vente-stat-card stat-red">
          <div className="vente-stat-icon"><i className="fas fa-hourglass-half"></i></div>
          <div>
            <span className="vente-stat-value">{stats.enAttente}</span>
            <span className="vente-stat-label">En attente</span>
          </div>
        </div>
      </div>

      <div className="ventes-card">
        <div className="ventes-filters">
          <div className="ventes-search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Rechercher par client, n° vente ou n° facture..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="ventes-filter-select" value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="Complétée">Complétée</option>
            <option value="Payée">Payée</option>
            <option value="En attente">En attente</option>
            <option value="Annulée">Annulée</option>
            <option value="Refusée">Refusée</option>
          </select>
          <select className="ventes-filter-select" value={filterPaiement} onChange={(e) => setFilterPaiement(e.target.value)}>
            <option value="">Tous les paiements</option>
            <option value="Espèces">Espèces</option>
            <option value="Carte">Carte</option>
            <option value="Virement">Virement</option>
            <option value="Assurance">Assurance</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="ventes-table">
            <thead>
              <tr>
                <th></th>
                <th>N° Vente</th>
                <th>N° Facture</th>
                <th>Date</th>
                <th>Client</th>
                <th>Paiement</th>
                {!isOnlineView && <th>Ordonnance</th>}
                <th>Total</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isOnlineView ? 9 : 10} className="ventes-empty">Chargement...</td></tr>
              ) : error ? (
                <tr><td colSpan={isOnlineView ? 9 : 10} className="ventes-empty text-danger">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={isOnlineView ? 9 : 10} className="ventes-empty">Aucune vente trouvée.</td></tr>
              ) : (
                filtered.map((vente) => {
                  const isOnlinePending = vente.source_channel === 'online' && vente.statut === 'En attente';

                  return (
                    <React.Fragment key={vente.id}>
                      <tr className={expandedRow === vente.id ? 'row-expanded' : ''}>
                        <td className="expand-cell">
                          <button className="expand-btn" onClick={() => toggleRow(vente.id)} title="Voir les produits">
                            <i className={`fas fa-chevron-${expandedRow === vente.id ? 'up' : 'down'}`}></i>
                          </button>
                        </td>
                        <td><span className="vente-numero">{vente.numero}</span></td>
                        <td><span className="vente-numero">{vente.facture_numero}</span></td>
                        <td><span className="vente-date">{vente.date}</span></td>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar">{(vente.client || 'C')[0].toUpperCase()}</div>
                            <div>
                              <span className="client-name">{vente.client || 'Client comptoir'}</span>
                              {vente.contact_phone && <small className="client-subline">{vente.contact_phone}</small>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="paiement-badge">
                            <i className={`fas ${PAYMENT_ICON[vente.paiement] || 'fa-wallet'} me-1`}></i>
                            {vente.paiement}
                          </span>
                        </td>
                        {!isOnlineView && (
                          <td className="text-center">
                            {vente.ordonnance ? (
                              <span className="ordo-badge ordo-oui"><i className="fas fa-file-medical me-1"></i>{vente.ordonnance_numero || 'Oui'}</span>
                            ) : (
                              <span className="ordo-badge ordo-non"><i className="fas fa-times me-1"></i>Non</span>
                            )}
                          </td>
                        )}
                        <td><span className="vente-total">{Number(vente.total || 0).toFixed(2)} DH</span></td>
                        <td><span className={`vente-status ${STATUS_CLASS[vente.statut] || ''}`}>{vente.statut}</span></td>
                        <td>
                          <div className="vente-actions vente-actions--wrap">
                            {isOnlinePending && (
                              <>
                                <button
                                  className="vaction-btn vaccept-btn"
                                  onClick={() => handleAccept(vente)}
                                  disabled={isUpdatingStatus === vente.id}
                                  title="Accepter"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="vaction-btn vreject-btn"
                                  onClick={() => handleReject(vente)}
                                  disabled={isUpdatingStatus === vente.id}
                                  title="Refuser"
                                >
                                  <i className="fas fa-ban"></i>
                                </button>
                              </>
                            )}
                            <button
                              className="vaction-btn vprint-btn"
                              title="Imprimer la facture PDF"
                              onClick={() => printInvoicePDF(vente)}
                            >
                              <i className="fas fa-print"></i>
                            </button>
                            <button className="vaction-btn vdelete-btn" onClick={() => handleDelete(vente.id)} title="Supprimer">
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === vente.id && (
                        <tr className="produits-row">
                          <td colSpan={isOnlineView ? 9 : 10}>
                            <div className="produits-detail">
                              <div className="produits-detail-header">
                                <i className="fas fa-pills me-2"></i>
                                Produits vendus ({vente.produits?.length || 0})
                              </div>
                              <div className="produits-detail-meta">
                                <span><strong>Canal :</strong> {vente.source_channel === 'online' ? 'Commande web' : 'Vente comptoir'}</span>
                                <span><strong>Stock déduit :</strong> {vente.stock_deducted ? 'Oui' : 'Non'}</span>
                                {vente.delivery_address && <span><strong>Adresse :</strong> {vente.delivery_address}</span>}
                                {vente.status_reason && <span><strong>Motif :</strong> {vente.status_reason}</span>}
                              </div>
                              <table className="produits-inner-table">
                                <thead>
                                  <tr>
                                    <th>Médicament</th>
                                    <th>Code</th>
                                    <th>Qté</th>
                                    <th>Prix unitaire</th>
                                    <th>Sous-total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(vente.produits || []).map((product, index) => (
                                    <tr key={index}>
                                      <td>{product.medicament}</td>
                                      <td>{product.code}</td>
                                      <td>{product.qte}</td>
                                      <td>{Number(product.prix_unitaire).toFixed(2)} DH</td>
                                      <td className="fw-bold">{Number(product.subtotal || product.qte * product.prix_unitaire).toFixed(2)} DH</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td colSpan="4" className="text-end fw-bold">Total :</td>
                                    <td className="fw-bold text-success">{Number(vente.total || 0).toFixed(2)} DH</td>
                                  </tr>
                                </tfoot>
                              </table>

                              <div className="produits-detail-actions">
                                <button className="btn-print-invoice" onClick={() => printInvoicePDF(vente)}>
                                  <i className="fas fa-print me-1"></i>
                                  Imprimer / Télécharger PDF
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="ventes-footer">
          <span className="ventes-count">{filtered.length} vente{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <VenteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={prefill}
        medicines={vendableMedicines}
        ordonnances={ordonnances}
        isSaving={isSaving}
      />
    </div>
  );
};

export default VentesList;
