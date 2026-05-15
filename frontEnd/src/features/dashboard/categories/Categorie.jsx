import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
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

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${id}`);
        await fetchCategories();
      } catch (e) {
        alert('Erreur lors de la suppression.');
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
      alert('Erreur lors de la sauvegarde.');
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
          <div className="text-muted font-monospace fs-5">{clock}</div>
          <div className="d-flex align-items-center gap-3 border-start ps-4">
            <button 
              className="btn btn-link text-muted p-0"
              onClick={toggleDarkMode}
            >
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
                      onClick={() => handleDeleteCategory(category.id)}
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
    </div>
  );
};

export default CategorieList;
