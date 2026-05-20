import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { Clock, Sun, Moon } from 'lucide-react';
import CategorieFormModal from './CategorieFormModal';
import './CategorieList.css';

const normalizeCategory = (category) => ({
  ...category,
  translations: Array.isArray(category.translations) ? category.translations : [],
  medicines_count: Number(category.medicines_count || 0),
});

const CategorieList = ({ isDarkMode, toggleDarkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [clock, setClock] = useState('00:00:00');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories((Array.isArray(response.data) ? response.data : []).map(normalizeCategory));
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, currentLanguage]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('fr-FR', { hour12: false }));
    };
    const timer = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(timer);
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const query = searchTerm.toLowerCase();
        return (
          category.name?.toLowerCase().includes(query) ||
          category.description?.toLowerCase().includes(query) ||
          category.criteria?.toLowerCase().includes(query)
        );
      }),
    [categories, searchTerm],
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (event, category) => {
    event.stopPropagation();
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (event, id) => {
    event.stopPropagation();
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (error) {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryData);
      } else {
        await api.post('/categories', categoryData);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (error) {
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const openCategoryMedicines = (category) => {
    navigate(`/dashboard/medicines?category=${category.id}`);
  };

  return (
    <div className={`categorie-list-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="header-card">
        <div className="d-flex align-items-center gap-3">
          <div className="page-header-icon">
            <i className="fas fa-tags"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0 text-dark">Organisation des Catégories</h1>
            <p className="text-muted small mb-0">Cliquez sur une catégorie pour voir immédiatement ses médicaments</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="clock-display" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', borderRadius: '999px', padding: '0.5rem 1rem', background: isDarkMode ? 'rgba(15, 23, 42, 0.82)' : '#f8fafc', border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDarkMode ? '#e2e8f0' : '#475569', fontWeight: '700' }}>
            <Clock size={18} />
            <span>{clock}</span>
          </div>
          <div className="d-flex align-items-center gap-3 border-start ps-4">
            <button className="theme-btn" onClick={toggleDarkMode} type="button" style={{ width: '40px', height: '40px', borderRadius: '999px', border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #dbe4ea', background: isDarkMode ? 'rgba(15, 23, 42, 0.82)' : '#f8fafc', color: isDarkMode ? '#e2e8f0' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="main-content-card">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-3">
            <i className="fas fa-tags fs-2 text-dark"></i>
            <h2 className="h4 fw-bold mb-0 text-dark">Organisation des Catégories</h2>
          </div>
          <button onClick={handleAddCategory} className="btn-create d-flex align-items-center gap-2 shadow-sm">
            <i className="fas fa-plus-circle"></i>
            <span>Créer une catégorie</span>
          </button>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center text-muted py-5">Chargement...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">Aucune catégorie trouvée.</div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="col-12 col-md-6 col-lg-4">
                <motion.button
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="category-card category-clickable"
                  onClick={() => openCategoryMedicines(category)}
                >
                  <div className="text-center">
                    <div className="category-img-container mb-3">
                      <img
                        src={category.image_url || `https://placehold.co/400x400/0f766e/ffffff?text=${encodeURIComponent(category.name || 'Categorie')}`}
                        alt={category.name}
                        className="category-img shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="h5 fw-bold text-dark mb-3">{category.name}</h3>
                    <p className="text-muted small mb-3">{category.description}</p>

                    <div className="category-meta mb-3">
                      <span className="category-pill">
                        <i className="fas fa-pills me-2"></i>
                        {category.medicines_count} médicament{category.medicines_count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                        Critères:
                      </span>
                      <p className="text-dark small mt-1 mb-0">{category.criteria}</p>
                    </div>

                    <div className="category-card-footer">
                      <span className="category-link-label">Voir les médicaments</span>
                      <div className="d-flex justify-content-center gap-3">
                        <button onClick={(event) => handleEditCategory(event, category)} className="action-btn edit-btn" title="Modifier">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={(event) => handleDeleteCategory(event, category.id)} className="action-btn delete-btn" title="Supprimer">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>
            ))
          )}
        </div>
      </div>

      <CategorieFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />
    </div>
  );
};

export default CategorieList;
