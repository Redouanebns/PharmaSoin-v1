import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Clock, Sun, Moon } from 'lucide-react';
import CategorieFormModal from './CategorieFormModal';
import './CategorieList.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const CategorieList = ({ isDarkMode, toggleDarkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (e) {
      console.error('Erreur chargement catégories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [clock, setClock] = useState('00:00:00');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('fr-FR', { hour12: false }));
    };
    const timer = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(timer);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const confirmDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/categories/${categoryToDelete.id}`);
      await fetchCategories();
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setDeleteError(e.response.data.message);
      } else {
        setDeleteError('Erreur lors de la suppression.');
      }
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await axios.put(`${API_BASE_URL}/categories/${editingCategory.id}`, categoryData);
      } else {
        await axios.post(`${API_BASE_URL}/categories`, categoryData);
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.data && e.response.data.errors) {
        const errors = Object.values(e.response.data.errors).flat().join('\n');
        alert(`Erreurs de validation :\n${errors}`);
      } else if (e.response && e.response.data && e.response.data.message) {
        alert(`Erreur lors de la sauvegarde : ${e.response.data.message}`);
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    }
  };

  return (
    <div className={`categorie-list-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Header Section */}
      <div className="header-card">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon shadow-sm">
            <i className="fas fa-tags"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0 text-dark">Organisation des Catégories</h1>
            <p className="text-muted small mb-0">Gérez vos catégories de médicaments et produits</p>
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

      {/* Main Content Card */}
      <div className="main-content-card">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-3">
             <i className="fas fa-tags fs-2 text-dark"></i>
             <h2 className="h4 fw-bold mb-0 text-dark">Organisation des Catégories</h2>
          </div>
          <button 
            onClick={handleAddCategory}
            className="btn-create d-flex align-items-center gap-2 shadow-sm"
          >
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid of Categories */}
        <div className="row g-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="col-12 col-md-6 col-lg-4">
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="category-card"
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
                  <p className="text-muted small mb-4">{category.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Critères:</span>
                    <p className="text-dark small mt-1 mb-0">{category.criteria}</p>
                  </div>

                  <div className="d-flex justify-content-center gap-3">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="action-btn edit-btn"
                      title="Modifier"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => confirmDeleteClick(category)}
                      className="action-btn delete-btn"
                      title="Supprimer"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <CategorieFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      {deleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal-content-custom"
            style={{ maxWidth: '400px', padding: '24px' }}
          >
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-exclamation-triangle text-danger fs-3 me-3"></i>
              <h4 className="mb-0 text-dark fw-bold">Confirmer la suppression</h4>
            </div>
            <p className="text-muted mb-4">Êtes-vous sûr de vouloir supprimer la catégorie <strong>{categoryToDelete?.name}</strong> ? Cette action est définitive.</p>
            
            {deleteError && (
              <div className="alert alert-danger py-2 mb-4" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-circle me-2"></i>
                {deleteError}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="btn btn-light border">Annuler</button>
              <button onClick={executeDelete} className="btn btn-danger">Supprimer</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CategorieList;
