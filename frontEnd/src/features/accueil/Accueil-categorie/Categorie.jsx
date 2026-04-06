import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './Categorie.css';

const Categorier = ({ categories = [], selectedCategory, setSelectedCategory }) => {
  const { t } = useTranslation();

  return (
    <section className="categories-section">
      <div className="container">
        <div className="categories-header">
          <h2 className="section-title">
            <i className="fas fa-th-large me-2 text-success"></i>
            {t('categories.title', 'Nos Catégories')}
          </h2>
          <p className="categories-subtitle">{t('categories.subtitle', 'Parcourez notre gamme complète de produits de santé')}</p>
        </div>

        <div className="categories-grid">
          <button
            className={`category-card ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <div className="category-icon all-icon">
              <i className="fas fa-th-large"></i>
            </div>
            <span>{t('categories.all', 'Tous')}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-card ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ '--cat-color': cat.color || '#00b894' }}
            >
              <div className="category-icon">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.target.style.display = 'none';
                      if (event.target.nextSibling) event.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <i className={cat.icon || 'fas fa-capsules'} style={{ display: cat.image_url ? 'none' : 'block' }}></i>
              </div>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="alert alert-light text-center mt-4 mb-0">
            {t('categories.empty', 'Aucune catégorie disponible depuis l’API pour le moment.')}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categorier;
