import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './Services.css';

const serviceItems = [
  { id: 1, icon: 'fas fa-truck', color: '#00b894', key: 'delivery' },
  { id: 2, icon: 'fas fa-user-md', color: '#0984e3', key: 'advice' },
  { id: 3, icon: 'fas fa-file-prescription', color: '#6c5ce7', key: 'prescription' },
  { id: 4, icon: 'fas fa-heartbeat', color: '#e17055', key: 'monitoring' },
  { id: 5, icon: 'fas fa-sync-alt', color: '#fdcb6e', key: 'renewal' },
  { id: 6, icon: 'fas fa-shield-virus', color: '#00cec9', key: 'vaccination' },
];

const Services = () => {
  const { t } = useTranslation();

  return (
    <section className="services-section">
      <div className="services-bg-pattern"></div>
      <div className="container">
        <div className="services-header">
          <span className="services-badge">
            <i className="fas fa-star me-2"></i>
            {t('services.badge', 'Nos Services')}
          </span>
          <h2 className="services-title">
            {t('services.title_line1', 'Des Services Adaptés à')}
            <br />
            <span className="services-highlight">{t('services.highlight', 'Vos Besoins')}</span>
          </h2>
          <p className="services-subtitle">{t('services.subtitle')}</p>
        </div>

        <div className="services-grid">
          {serviceItems.map((service) => (
            <div className="service-card" key={service.id} style={{ '--service-color': service.color }}>
              <div className="service-icon-wrapper">
                <div className="service-icon">
                  <i className={service.icon}></i>
                </div>
                <span className="service-badge-tag">
                  {t(`services.items.${service.key}.badge`, '')}
                </span>
              </div>
              <h3 className="service-title">{t(`services.items.${service.key}.title`, '')}</h3>
              <p className="service-description">{t(`services.items.${service.key}.description`, '')}</p>
              <div className="service-link">
                <span>{t('services.learn_more', 'En savoir plus')}</span>
                <i className="fas fa-arrow-right ms-2"></i>
              </div>
            </div>
          ))}
        </div>

        <div className="services-cta">
          <div className="cta-card">
            <div className="cta-info">
              <i className="fas fa-phone-alt cta-icon"></i>
              <div>
                <h4>{t('services.urgent_title', "Besoin d'aide urgente ?")}</h4>
                <p>{t('services.urgent_subtitle')}</p>
              </div>
            </div>
            <a href="tel:+212522000000" className="cta-btn">
              <i className="fas fa-phone me-2"></i>
              +212 5 22 00 00 00
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
