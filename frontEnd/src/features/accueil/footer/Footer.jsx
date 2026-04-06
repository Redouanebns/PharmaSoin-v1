import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const quickLinks = [
    { label: t('footer.links.home', 'Accueil'), icon: 'fas fa-home' },
    { label: t('footer.links.products', 'Nos Produits'), icon: 'fas fa-pills' },
    { label: t('footer.links.services', 'Nos Services'), icon: 'fas fa-concierge-bell' },
    { label: t('footer.links.about', 'À Propos'), icon: 'fas fa-info-circle' },
    { label: t('footer.links.prescriptions', 'Ordonnances'), icon: 'fas fa-file-prescription' },
    { label: t('footer.links.contact', 'Contact'), icon: 'fas fa-envelope' },
  ];

  const categoryLinks = [
    { label: t('footer.category.medicines', 'Médicaments'), icon: 'fas fa-pills' },
    { label: t('footer.category.vitamins', 'Vitamines & Compléments'), icon: 'fas fa-capsules' },
    { label: t('footer.category.bodycare', 'Soins du Corps'), icon: 'fas fa-spa' },
    { label: t('footer.category.baby', 'Bébé & Maman'), icon: 'fas fa-baby' },
    { label: t('footer.category.natural', 'Santé Naturelle'), icon: 'fas fa-leaf' },
    { label: t('footer.category.equipment', 'Matériel Médical'), icon: 'fas fa-stethoscope' },
  ];

  return (
    <footer className="footer-section" id="footer-section">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col footer-brand">
              <div className="footer-logo">
                <img src="/assets/images/logo.png" className="navbar-brand-logo" alt="PharmaSoin" />
              </div>
              <p className="footer-brand-desc">{t('footer.brand_desc')}</p>
              <div className="footer-social">
                {[
                  { icon: 'fab fa-facebook-f', href: '#', color: '#3b5998' },
                  { icon: 'fab fa-instagram', href: '#', color: '#e1306c' },
                  { icon: 'fab fa-twitter', href: '#', color: '#1da1f2' },
                  { icon: 'fab fa-whatsapp', href: '#', color: '#25d366' },
                  { icon: 'fab fa-youtube', href: '#', color: '#ff0000' },
                ].map((social, index) => (
                  <a key={index} href={social.href} className="social-link" style={{ '--social-color': social.color }}>
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.quick_links_title', 'Liens Rapides')}</h4>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href="#">
                      <i className={link.icon}></i>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.categories_title', 'Catégories')}</h4>
              <ul className="footer-links">
                {categoryLinks.map((link, index) => (
                  <li key={index}>
                    <a href="#">
                      <i className={link.icon}></i>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.contact_hours_title', 'Contact & Horaires')}</h4>
              <div className="footer-contact-list">
                {[
                  { icon: 'fas fa-map-marker-alt', text: '12 Avenue Hassan II, Casablanca, Maroc' },
                  { icon: 'fas fa-phone', text: '+212 5 22 00 00 00' },
                  { icon: 'fas fa-mobile-alt', text: '+212 6 00 00 00 00' },
                  { icon: 'fas fa-envelope', text: 'contact@pharmasoin.ma' },
                ].map((contact, index) => (
                  <div className="contact-item" key={index}>
                    <i className={contact.icon}></i>
                    <span>{contact.text}</span>
                  </div>
                ))}
              </div>

              <div className="footer-hours">
                <h5>{t('footer.hours_title', "Horaires d'ouverture")}</h5>
                <div className="hours-row">
                  <span>{t('footer.hours.weekdays', 'Lun - Ven')}</span>
                  <span className="hours-value">08h - 21h</span>
                </div>
                <div className="hours-row">
                  <span>{t('footer.hours.saturday', 'Samedi')}</span>
                  <span className="hours-value">09h - 18h</span>
                </div>
                <div className="hours-row">
                  <span>{t('footer.hours.sunday', 'Dimanche')}</span>
                  <span className="hours-value open-badge">{t('footer.hours.sunday_badge', 'Garde 24h/24')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>
              © {currentYear} <strong>PharmaSoin</strong> — {t('footer.rights', 'Tous droits réservés.')}
            </p>
            <div className="footer-bottom-links">
              <a href="#">{t('footer.privacy', 'Politique de confidentialité')}</a>
              <a href="#">{t('footer.terms', "Conditions d'utilisation")}</a>
              <a href="#">{t('footer.legal', 'Mentions légales')}</a>
              <a href="#">{t('footer.cookies', 'Cookies')}</a>
            </div>
            <div className="footer-payment-icons">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-paypal"></i>
              <i className="fas fa-money-bill-wave"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
