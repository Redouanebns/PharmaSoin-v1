import React, { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const perks = [
    { icon: 'fas fa-gift', label: t('newsletter.perks.discount.label', '10% de réduction'), sub: t('newsletter.perks.discount.sub', 'Sur votre 1ère commande') },
    { icon: 'fas fa-bell', label: t('newsletter.perks.alerts.label', 'Alertes Santé'), sub: t('newsletter.perks.alerts.sub', 'Informations importantes') },
    { icon: 'fas fa-tag', label: t('newsletter.perks.offers.label', 'Offres Exclusives'), sub: t('newsletter.perks.offers.sub', 'Réservées aux abonnés') },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError(t('newsletter.invalid_email', 'Veuillez entrer une adresse email valide.'));
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-bg"></div>
      <div className="container">
        <div className="newsletter-wrapper">
          <div className="newsletter-content">
            <div className="newsletter-icon-wrapper">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <div className="newsletter-text">
              <h2 className="newsletter-title">{t('newsletter.title', 'Restez Informé sur Votre Santé')}</h2>
              <p className="newsletter-subtitle">{t('newsletter.subtitle')}</p>

              {!submitted ? (
                <form className="newsletter-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <i className="fas fa-envelope input-icon"></i>
                    <input
                      type="email"
                      placeholder={t('newsletter.placeholder', 'Entrez votre adresse email...')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`newsletter-input ${error ? 'input-error' : ''}`}
                      required
                    />
                    <button type="submit" className="newsletter-btn">
                      <span>{t('newsletter.button', "S'abonner")}</span>
                      <i className="fas fa-paper-plane ms-2"></i>
                    </button>
                  </div>
                  {error && <p className="newsletter-error">{error}</p>}
                  <p className="newsletter-disclaimer">
                    <i className="fas fa-lock me-1"></i>
                    {t('newsletter.disclaimer')}
                  </p>
                </form>
              ) : (
                <div className="newsletter-success">
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div>
                    <h4>{t('newsletter.success_title', 'Merci pour votre inscription !')}</h4>
                    <p>{t('newsletter.success_message')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="newsletter-perks">
            {perks.map((perk, index) => (
              <div className="perk-item" key={index}>
                <div className="perk-icon">
                  <i className={perk.icon}></i>
                </div>
                <div>
                  <span className="perk-label">{perk.label}</span>
                  <span className="perk-sub">{perk.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
