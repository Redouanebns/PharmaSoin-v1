import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './HeroSection.css';

const HeroSection = ({ onConnexionClick }) => {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-badge">
            <i className="fas fa-shield-alt me-2"></i>
            {t('hero.badge', 'Santé & Confiance')}
          </span>
          <h1 className="hero-title">
            {t('hero.title', 'Votre Pharmacie')} <br />
            <span className="hero-highlight">{t('hero.pharmacy_name', 'PharmaSoin')}</span>
          </h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-actions">
            <button
              className="btn-hero-primary"
              onClick={() => {
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <i className="fas fa-pills me-2"></i>
              {t('hero.view_products', 'Voir les Produits')}
            </button>
            <button className="btn-hero-secondary" onClick={onConnexionClick}>
              <i className="fas fa-user me-2"></i>
              {t('hero.pro_space', 'Espace Professionnel')}
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">{t('hero.medicines', 'Médicaments')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">{t('hero.available', 'Disponible')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">{t('hero.certified', 'Certifié')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">{t('hero.years', 'Années')}</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80"
              alt="PharmaSoin - Pharmacien professionnel"
              className="hero-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&q=80';
              }}
            />
            <div className="hero-floating-card card-1">
              <i className="fas fa-check-circle text-success"></i>
              <span>{t('hero.certified_products', 'Produits Certifiés')}</span>
            </div>
            <div className="hero-floating-card card-2">
              <i className="fas fa-truck text-primary"></i>
              <span>{t('hero.fast_delivery', 'Livraison Rapide')}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64 C360,120 1080,0 1440,80 L1440,120 L0,120 Z" fill="#f8f9fa" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
