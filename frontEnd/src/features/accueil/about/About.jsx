import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '15+', label: t('about.stats.experience', "Années d'expérience"), icon: 'fas fa-calendar-check' },
    { value: '10K+', label: t('about.stats.clients', 'Clients satisfaits'), icon: 'fas fa-users' },
    { value: '500+', label: t('about.stats.medicines', 'Médicaments disponibles'), icon: 'fas fa-pills' },
    { value: '24/7', label: t('about.stats.availability', 'Service disponible'), icon: 'fas fa-clock' },
  ];

  const features = [
    {
      icon: 'fas fa-certificate',
      title: t('about.features.certified.title', 'Produits Certifiés'),
      desc: t('about.features.certified.desc'),
    },
    {
      icon: 'fas fa-user-shield',
      title: t('about.features.experts.title', 'Pharmaciens Experts'),
      desc: t('about.features.experts.desc'),
    },
    {
      icon: 'fas fa-temperature-low',
      title: t('about.features.storage.title', 'Stockage Optimal'),
      desc: t('about.features.storage.desc'),
    },
    {
      icon: 'fas fa-leaf',
      title: t('about.features.natural.title', 'Produits Naturels'),
      desc: t('about.features.natural.desc'),
    },
  ];

  return (
    <section className="about-section" id="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-images">
            <div className="about-img-main">
              <img
                src="https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&q=80"
                alt={t('about.main_image_alt', 'Notre pharmacie')}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="about-img-secondary">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&q=80"
                alt={t('about.secondary_image_alt', 'Pharmacien conseil')}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="about-img-badge">
              <i className="fas fa-award"></i>
              <span>{t('about.certified_pharmacy', 'Pharmacie certifiée')}</span>
            </div>
            <div className="about-experience-tag">
              <span className="exp-number">15+</span>
              <span className="exp-text">{t('about.experience_tag', "ans d'expertise")}</span>
            </div>
          </div>

          <div className="about-content">
            <span className="about-badge">
              <i className="fas fa-info-circle me-2"></i>
              {t('about.badge', 'À Propos de Nous')}
            </span>
            <h2 className="about-title">
              {t('about.title_line1', 'Votre Partenaire Santé')}
              <br />
              <span className="about-highlight">{t('about.highlight', 'de Confiance')}</span>
            </h2>
            <p className="about-text">{t('about.paragraph1')}</p>
            <p className="about-text">{t('about.paragraph2')}</p>

            <div className="about-features">
              {features.map((feature, index) => (
                <div className="about-feature-item" key={index}>
                  <div className="feature-icon-box">
                    <i className={feature.icon}></i>
                  </div>
                  <div className="feature-text">
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="about-stats-bar">
          {stats.map((stat, index) => (
            <div className="about-stat" key={index}>
              <i className={stat.icon}></i>
              <span className="stat-val">{stat.value}</span>
              <span className="stat-lbl">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
