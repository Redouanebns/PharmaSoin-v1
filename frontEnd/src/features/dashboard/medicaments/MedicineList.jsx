import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import MedicineFormModal from './MedicineFormModal';
import './MedicineList.css';

const mapApiMedicineToUi = (medicine) => ({
  id: medicine.id,
  image_url: medicine.image_url || null,
  code: medicine.code,
  nom: medicine.nom,
  dci: medicine.dci,
  dose: medicine.dose || '',
  cat: medicine.category?.name || 'Inconnue',
  stock: medicine.stock || 0,
  prix: medicine.prix || '0.00',
  exp: medicine.exp || '',
  description: medicine.description || '',
  status: (medicine.stock || 0) > 0 ? 'En stock' : 'Rupture',
  category_id: medicine.category_id,
  translations: Array.isArray(medicine.translations) ? medicine.translations : [],
  category: medicine.category || null,
});

const MedicineList = ({ medicines: initialMedicines = [], isDarkMode, toggleDarkMode }) => {
  const [medicines, setMedicines] = useState(
    Array.isArray(initialMedicines) ? initialMedicines.map(mapApiMedicineToUi) : [],
  );
  const [clock, setClock] = useState('00:00:00');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { currentLanguage } = useLanguage();

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/medicaments');
      const apiMedicines = Array.isArray(response.data) ? response.data : [];
      setMedicines(apiMedicines.map(mapApiMedicineToUi));
    } catch (fetchError) {
      setError('Impossible de charger la liste des médicaments depuis le serveur Laravel.');
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const categories = useMemo(() => {
    const categorySet = new Set(medicines.map((medicine) => medicine.cat).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const haystack = `${medicine.nom ?? ''} ${medicine.dci ?? ''} ${medicine.code ?? ''}`.toLowerCase();
      const matchesSearch = query === '' || haystack.includes(query);
      const matchesCategory = categoryFilter === '' || medicine.cat === categoryFilter;
      const matchesStatus = statusFilter === '' || medicine.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [medicines, searchTerm, categoryFilter, statusFilter]);

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

  return (
    <div className={`medicine-list-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="header-card">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon shadow-sm">
            <i className="fas fa-pills"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0 text-dark">Inventaire des Médicaments</h1>
            <p className="text-muted small mb-0">Gérez votre stock de médicaments et produits</p>
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
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-3">
            <i className="fas fa-list fs-2 text-dark"></i>
            <h2 className="h4 fw-bold mb-0 text-dark">Liste des Médicaments</h2>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success btn-export shadow-sm d-flex align-items-center gap-2" style={{ borderRadius: '0.75rem', fontWeight: '600' }}>
              <i className="fas fa-file-excel"></i>
              <span>Exporter</span>
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
              placeholder="Rechercher par nom, DCI ou code-barres..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select className="form-select filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
          <select className="form-select filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="En stock">En stock</option>
            <option value="Rupture">Rupture</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th className="text-center">Image</th>
                <th>Code barres</th>
                <th>Produit & DCI</th>
                <th>Dosage/Forme</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Prix</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Chargement...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="text-center text-danger py-5">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-5">
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
                      <span className="cat-badge">{medicine.dose}</span>
                    </td>
                    <td>
                      <span className="fw-medium">{medicine.cat}</span>
                    </td>
                    <td>
                      <span className="fw-bold fs-6">{medicine.stock}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{medicine.prix}</span>
                    </td>
                    <td>
                      <span className="text-muted small">{medicine.exp}</span>
                    </td>
                    <td>
                      <span className={`badge-status ${medicine.status === 'En stock' ? 'status-available' : 'status-alert'}`}>
                        {medicine.status}
                      </span>
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
