import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import MedicineFormModal from './MedicineFormModal';
import './MedicineList.css';

const EXPIRY_WARNING_DAYS = 45;

const splitMolecules = (value = '') =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getExpirationInfo = (exp) => {
  if (!exp) {
    return { label: 'Non définie', tone: 'neutral', helper: 'Aucune date', isExpired: false, isWarning: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expirationDate = new Date(exp);
  expirationDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Expiré', tone: 'danger', helper: `Depuis ${Math.abs(diffDays)} jour(s)`, isExpired: true, isWarning: false };
  }

  if (diffDays <= EXPIRY_WARNING_DAYS) {
    return { label: 'Expire bientôt', tone: 'warning', helper: `Dans ${diffDays} jour(s)`, isExpired: false, isWarning: true };
  }

  return { label: 'Valide', tone: 'success', helper: `Jusqu'au ${exp}`, isExpired: false, isWarning: false };
};

const getMedicineStatus = (medicine) => {
  const stock = Number(medicine.stock || 0);
  const threshold = Number(medicine.seuil_alerte || 10);
  const expiry = getExpirationInfo(medicine.exp);

  if (expiry.isExpired) {
    return { label: 'Expiré', className: 'status-danger' };
  }
  if (stock <= 0) {
    return { label: 'Rupture', className: 'status-danger' };
  }
  if (stock <= threshold) {
    return { label: 'Stock faible', className: 'status-warning' };
  }
  if (expiry.isWarning) {
    return { label: 'À écouler', className: 'status-warning' };
  }

  return { label: 'Disponible', className: 'status-success' };
};

const mapApiMedicineToUi = (medicine) => {
  const expiryInfo = getExpirationInfo(medicine.exp);
  const status = getMedicineStatus(medicine);

  return {
    id: medicine.id,
    image_url: medicine.image_url || null,
    code: medicine.code,
    nom: medicine.nom,
    dci: medicine.dci,
    molecule: medicine.molecule || '',
    dose: medicine.dose || '',
    cat: medicine.category?.name || 'Inconnue',
    stock: Number(medicine.stock || 0),
    prix: Number(medicine.prix || 0),
    exp: medicine.exp || '',
    description: medicine.description || '',
    ordonnance: medicine.ordonnance ?? false,
    seuil_alerte: Number(medicine.seuil_alerte || 10),
    status,
    expiryInfo,
    category_id: medicine.category_id,
    translations: Array.isArray(medicine.translations) ? medicine.translations : [],
    category: medicine.category || null,
  };
};

const MedicineList = ({ medicines: initialMedicines = [], isDarkMode, toggleDarkMode }) => {
  const [medicines, setMedicines] = useState(Array.isArray(initialMedicines) ? initialMedicines.map(mapApiMedicineToUi) : []);
  const [clock, setClock] = useState('00:00:00');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const categoryId = searchParams.get('category');
      const response = await api.get('/medicaments', {
        params: categoryId ? { category_id: categoryId } : {},
      });
      const apiMedicines = Array.isArray(response.data) ? response.data : [];
      setMedicines(apiMedicines.map(mapApiMedicineToUi));
      setCategoryFilter(categoryId || '');
    } catch (fetchError) {
      setError('Impossible de charger la liste des médicaments depuis le serveur Laravel.');
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMedicines();

    const updateClock = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('fr-FR', { hour12: false }));
    };

    const timer = setInterval(updateClock, 1000);
    updateClock();

    return () => clearInterval(timer);
  }, [fetchMedicines, currentLanguage]);

  const categoryOptions = useMemo(() => {
    const map = new Map();
    medicines.forEach((medicine) => {
      if (!map.has(String(medicine.category_id))) {
        map.set(String(medicine.category_id), { id: String(medicine.category_id), name: medicine.cat });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const haystack = `${medicine.nom ?? ''} ${medicine.dci ?? ''} ${medicine.code ?? ''} ${medicine.molecule ?? ''}`.toLowerCase();
      const matchesSearch = query === '' || haystack.includes(query);
      const matchesCategory = categoryFilter === '' || String(medicine.category_id) === String(categoryFilter);
      const matchesStatus = statusFilter === '' || medicine.status.label === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [medicines, searchTerm, categoryFilter, statusFilter]);

  const activeCategoryName = useMemo(
    () => categoryOptions.find((category) => category.id === String(categoryFilter))?.name || '',
    [categoryFilter, categoryOptions],
  );

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce médicament ?')) return;

    try {
      await api.delete(`/medicaments/${id}`);
      await fetchMedicines();
    } catch (deleteError) {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSaveMedicine = async (medicineData) => {
    try {
      if (editingMedicine) {
        await api.put(`/medicaments/${editingMedicine.id}`, medicineData);
      } else {
        await api.post('/medicaments', medicineData);
      }
      setIsModalOpen(false);
      await fetchMedicines();
    } catch (saveError) {
      console.error(saveError);
      alert(`Erreur lors de la sauvegarde : ${saveError.response?.data?.message || saveError.message}`);
    }
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    if (value) {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsImporting(true);
      await api.post('/medicaments/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Médicaments importés avec succès !');
      await fetchMedicines();
    } catch (importError) {
      console.error(importError);
      alert(`Erreur lors de l'importation : ${importError.response?.data?.message || importError.message}`);
    } finally {
      setIsImporting(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`medicine-list-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="header-card">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon shadow-sm">
            <i className="fas fa-pills"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0 text-dark">Inventaire des Médicaments</h1>
            <p className="text-muted small mb-0">
              Le stock est géré par les mouvements et les commandes, tandis que la date d'expiration influence la vente et les alertes.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="text-muted font-monospace fs-5">{clock}</div>
          <div className="d-flex align-items-center gap-3 border-start ps-4">
            <button className="btn btn-link text-muted p-0" onClick={toggleDarkMode}>
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} fs-5`}></i>
            </button>
            <div className="d-flex align-items-center gap-2 text-dark fw-medium">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <i className="fas fa-user small"></i>
              </div>
              <span>Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content-card">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <i className="fas fa-list fs-2 text-dark"></i>
            <div>
              <h2 className="h4 fw-bold mb-0 text-dark">Liste des Médicaments</h2>
              {activeCategoryName ? (
                <p className="text-success small mb-0">Filtre actif : catégorie « {activeCategoryName} »</p>
              ) : (
                <p className="text-muted small mb-0">Toutes les catégories</p>
              )}
            </div>
          </div>
          <div className="d-flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline-success d-flex align-items-center gap-2 shadow-sm"
              disabled={isImporting}
            >
              {isImporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-excel"></i>}
              <span>Importer</span>
            </button>
            <button onClick={handleAddMedicine} className="btn-create d-flex align-items-center gap-2 shadow-sm">
              <i className="fas fa-plus-circle"></i>
              <span>Nouveau Médicament</span>
            </button>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par nom, DCI, molécule ou code-barres..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select className="form-select filter-select" value={categoryFilter} onChange={(event) => handleCategoryFilterChange(event.target.value)}>
            <option value="">Toutes les catégories</option>
            {categoryOptions.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className="form-select filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="Disponible">Disponible</option>
            <option value="Stock faible">Stock faible</option>
            <option value="Rupture">Rupture</option>
            <option value="À écouler">À écouler</option>
            <option value="Expiré">Expiré</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th className="text-center">Image</th>
                <th>Code barres</th>
                <th>Produit & DCI</th>
                <th>Molécule</th>
                <th>Dosage/Forme</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Expiration</th>
                <th className="text-center">Ordonnance</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Chargement...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="11" className="text-center text-danger py-5">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center text-muted py-5">
                    Aucun résultat trouvé.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="text-center">
                      <img
                        src={medicine.image_url || 'https://placehold.co/200x200/0f766e/ffffff?text=Produit+Pharmacie'}
                        alt={medicine.nom}
                        className="medicine-img shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{medicine.code}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{medicine.nom}</div>
                      <small className="text-muted">{medicine.dci}</small>
                    </td>
                    <td>
                      {splitMolecules(medicine.molecule).length ? (
                        <div className="molecule-block">
                          {splitMolecules(medicine.molecule).map((item) => (
                            <span key={`${medicine.id}-${item}`} className="molecule-pill">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted small fw-semibold">Aucune molécule renseignée</span>
                      )}
                    </td>
                    <td>
                      <span className="cat-badge">{medicine.dose || '—'}</span>
                    </td>
                    <td>
                      <span className="fw-medium">{medicine.cat}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{medicine.prix.toFixed(2)} DH</span>
                    </td>
                    <td>
                      <div className={`expiry-chip expiry-${medicine.expiryInfo.tone}`}>
                        <span>{medicine.expiryInfo.label}</span>
                        <small>{medicine.exp || '—'} • {medicine.expiryInfo.helper}</small>
                      </div>
                    </td>
                    <td className="text-center">
                      {medicine.ordonnance ? (
                        <span className="badge-ordonnance badge-ordonnance-oui">
                          <i className="fas fa-file-medical me-1"></i>Oui
                        </span>
                      ) : (
                        <span className="badge-ordonnance badge-ordonnance-non">
                          <i className="fas fa-times-circle me-1"></i>Non
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status ${medicine.status.className}`}>{medicine.status.label}</span>
                      <small className="text-muted d-block mt-1">Stock: {medicine.stock} • Seuil: {medicine.seuil_alerte}</small>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit-btn" onClick={() => handleEdit(medicine)} title="Modifier">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(medicine.id)} title="Supprimer">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
      />
    </div>
  );
};

export default MedicineList;
