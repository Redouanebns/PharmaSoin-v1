import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCurrency } from '../../../hooks/useCurrency';
import './Medicament.css';

const fallbackImage = 'https://placehold.co/600x400/0f766e/ffffff?text=Produit+Pharmacie';

const Medicament = ({ medicines = [], error, addToCart }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  return (
    <section className="products-section" id="products-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <i className="fas fa-store-alt me-2 text-success"></i>
              {t('products.available', 'Produits Disponibles')}
            </h2>
            <p className="section-subtitle">{t('products.subtitle', 'Découvrez notre sélection de produits pharmaceutiques de qualité')}</p>
          </div>
          <span className="results-count">
            <i className="fas fa-box me-1"></i>
            {medicines.length} {t('products.results_found', 'produits trouvés')}
          </span>
        </div>

        {error && (
          <div className="alert alert-warning text-center mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {t('products.api_error', 'Impossible de charger les produits depuis le backend API.')}
          </div>
        )}

        {!error && medicines.length === 0 && (
          <div className="alert alert-light text-center mb-4">
            <i className="fas fa-info-circle me-2"></i>
            {t('products.empty', 'Aucun produit disponible depuis l’API pour le moment.')}
          </div>
        )}

        <div className="products-grid">
          {medicines.map((med) => (
            <div key={med.id} className="product-card">
              <div className="product-image">
                <img
                  src={med.image_url || fallbackImage}
                  alt={med.nom}
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.target.src = fallbackImage;
                  }}
                />
                <span className={`status-tag ${med.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {med.stock > 0 ? (
                    <>
                      <i className="fas fa-check-circle me-1"></i>
                      {t('products.in_stock', 'En stock')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times-circle me-1"></i>
                      {t('products.out_of_stock', 'Rupture')}
                    </>
                  )}
                </span>
                <div className="product-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
              <div className="product-info">
                <div className="product-meta">
                  <span className="product-category">
                    <i className="fas fa-tag me-1"></i>
                    {med.category?.name || t('products.general', 'Général')}
                  </span>
                  <span className="product-code">#{med.code}</span>
                </div>
                <h3 className="product-name">{med.nom}</h3>
                <p className="product-dci">
                  <i className="fas fa-flask me-1 opacity-50"></i>
                  {med.dci}
                </p>
                <p className="product-description">{med.description || t('products.no_description', 'Aucune description disponible.')}</p>
                <div className="product-footer">
                  <div className="price-block">
                    <span className="product-price">{formatPrice(med.prix)}</span>
                    {med.stock > 0 && (
                      <span className="stock-info">
                        {med.stock} {t('products.stock_suffix', 'en stock')}
                      </span>
                    )}
                  </div>
                  <button className="add-to-cart-btn" disabled={med.stock <= 0} onClick={() => addToCart && addToCart(med)}>
                    <i className="fas fa-cart-plus"></i>
                    {t('products.add', 'Ajouter')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Medicament;
