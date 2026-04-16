import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Menu,
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Globe,
  Banknote,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useCart } from '../../../context/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useCurrency } from '../../../context/CurrencyContext';
import './Navbar.css';

const supportedLanguages = [
  { code: 'fr', shortLabel: 'FR', flag: '🇫🇷' },
  { code: 'en', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'ar', shortLabel: 'AR', flag: '🇲🇦' },
];

const currencyFlags = {
  MAD: '🇲🇦',
  EUR: '🇪🇺',
  USD: '🇺🇸',
};

const supportedCurrencies = ['MAD', 'EUR', 'USD'];

export default function Navbar({
  isDarkMode = false,
  toggleDarkMode,
  showDarkModeToggle = false,
  searchQuery = '',
  setSearchQuery,
  onConnexionClick,
  onInscriptionClick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { currentLanguage, setLanguage, t } = useLanguage();
  const { currentCurrency, setCurrency, getCurrencyMeta, formatPrice } = useCurrency();
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart();

  const activeLanguage = useMemo(
    () => supportedLanguages.find((language) => language.code === currentLanguage) || supportedLanguages[0],
    [currentLanguage],
  );

  const activeCurrency = useMemo(
    () => ({ code: currentCurrency, meta: getCurrencyMeta(currentCurrency), flag: currencyFlags[currentCurrency] || '💱' }),
    [currentCurrency, getCurrencyMeta],
  );

  const languageOptions = useMemo(
    () =>
      supportedLanguages.map((language) => ({
        ...language,
        label: t(`nav.language.${language.code}`, language.shortLabel),
      })),
    [t],
  );

  const currencyOptions = useMemo(
    () =>
      supportedCurrencies.map((currencyCode) => ({
        code: currencyCode,
        flag: currencyFlags[currencyCode] || '💱',
        meta: getCurrencyMeta(currencyCode),
        label: t(`nav.currency.${currencyCode}`, currencyCode),
      })),
    [getCurrencyMeta, t],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
        setIsCurrencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllMenus = () => {
    setIsLanguageOpen(false);
    setIsCurrencyOpen(false);
    setIsMenuOpen(false);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/payment');
  };

  const handleConnexion = () => {
    if (onConnexionClick) {
      onConnexionClick();
      return;
    }

    navigate('/authentification');
  };

  const handleInscription = () => {
    if (onInscriptionClick) {
      onInscriptionClick();
      return;
    }

    navigate('/authentification?mode=register');
  };

  const renderSelectorButtons = () => (
    <div className="d-flex align-items-center gap-2 flex-wrap" ref={dropdownRef}>
      <div className="action-dropdown-wrapper">
        <button
          type="button"
          className="nav-control-btn selector-btn"
          onClick={() => {
            setIsLanguageOpen((prev) => !prev);
            setIsCurrencyOpen(false);
          }}
          aria-label={t('nav.language', 'Langue')}
        >
          <Globe size={18} />
          <span className="selector-flag">{activeLanguage.flag}</span>
          <span className="selector-value">{activeLanguage.shortLabel}</span>
          <ChevronDown size={16} />
        </button>

        {isLanguageOpen && (
          <div className="selector-dropdown-menu">
            {languageOptions.map((language) => (
              <button
                type="button"
                key={language.code}
                className={`selector-dropdown-item ${currentLanguage === language.code ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(language.code);
                  closeAllMenus();
                }}
              >
                <span className="selector-item-code">{language.flag}</span>
                <span className="selector-item-meta">{language.shortLabel}</span>
                <span>{language.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="action-dropdown-wrapper">
        <button
          type="button"
          className="nav-control-btn selector-btn"
          onClick={() => {
            setIsCurrencyOpen((prev) => !prev);
            setIsLanguageOpen(false);
          }}
          aria-label={t('nav.currency', 'Devise')}
        >
          <Banknote size={18} />
          <span className="selector-flag">{activeCurrency.flag}</span>
          <span className="selector-value">{activeCurrency.meta.symbol}</span>
          <ChevronDown size={16} />
        </button>

        {isCurrencyOpen && (
          <div className="selector-dropdown-menu selector-dropdown-menu-right">
            {currencyOptions.map((currency) => (
              <button
                type="button"
                key={currency.code}
                className={`selector-dropdown-item ${currentCurrency === currency.code ? 'active' : ''}`}
                onClick={() => {
                  setCurrency(currency.code);
                  closeAllMenus();
                }}
              >
                <span className="selector-item-code">{currency.flag}</span>
                <span className="selector-item-meta">{currency.code}</span>
                <span>{currency.meta.symbol}</span>
                <span className="ms-auto text-muted small">{currency.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <nav className={`navbar navbar-expand-lg fixed-top custom-navbar ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
        <div className="container-fluid px-lg-4">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img src="/assets/images/logo.png" className="navbar-brand-logo" alt="PharmaSoin" />
          </a>

          <div className="d-flex align-items-center gap-2 d-lg-none">
            {showDarkModeToggle && (
              <button className="theme-toggle-btn" type="button" onClick={toggleDarkMode}>
                {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
              </button>
            )}

            <button className="cart-icon-btn" type="button" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <button
              className="navbar-toggler border-0 shadow-none"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className={`collapse navbar-collapse justify-content-center ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" href="/">
                  {t('nav.home', 'Accueil')}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about-section">
                  {t('nav.about', 'À propos')}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#products-section">
                  {t('nav.products', 'Produits')}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#footer-section">
                  {t('nav.contact', 'Contact')}
                </a>
              </li>
            </ul>

            <div className="d-lg-none mt-3 pb-3 border-top pt-3">
              <div className="search-container mb-3 w-100" style={{ maxWidth: 'none' }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder={t('nav.search_placeholder', 'Rechercher...')}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery?.(event.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
                {renderSelectorButtons()}
                <div className="nav-auth-actions nav-auth-actions--mobile">
                  <button className="btn btn-nav-auth btn-connexion" type="button" onClick={handleConnexion}>
                    {t('nav.login', 'Connexion')}
                  </button>
                  <button className="btn btn-nav-auth btn-inscription" type="button" onClick={handleInscription}>
                    {t('nav.register', 'Inscription')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="d-none d-lg-flex align-items-center gap-3">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-control search-input"
                placeholder={t('nav.search_placeholder', 'Rechercher...')}
                value={searchQuery}
                onChange={(event) => setSearchQuery?.(event.target.value)}
              />
            </div>

            {showDarkModeToggle && (
              <button className="theme-toggle-btn" type="button" onClick={toggleDarkMode}>
                {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
              </button>
            )}

            <button className="cart-icon-btn" type="button" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {renderSelectorButtons()}

            <div className="nav-auth-actions">
              <button className="btn btn-nav-auth btn-connexion" type="button" onClick={handleConnexion}>
                {t('nav.login', 'Connexion')}
              </button>
              <button className="btn btn-nav-auth btn-inscription" type="button" onClick={handleInscription}>
                {t('nav.register', 'Inscription')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cart-overlay"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="cart-drawer"
            >
              <div className="cart-header">
                <h3>
                  {t('nav.cart', 'Mon panier')} ({cartCount})
                </h3>
                <button className="close-cart" type="button" onClick={() => setIsCartOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="cart-items">
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <ShoppingCart size={64} className="mb-3 opacity-20" />
                    <p>{t('nav.empty_cart', 'Votre panier est vide')}</p>
                    <button className="btn btn-primary mt-3" type="button" onClick={() => setIsCartOpen(false)}>
                      {t('nav.continue_shopping', 'Continuer mes achats')}
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img src={item.image_url || 'https://placehold.co/160x160/0f766e/ffffff?text=Pharma'} alt={item.nom} />
                      </div>
                      <div className="item-details">
                        <h4>{item.nom}</h4>
                        <p className="item-price">{formatPrice(item.prix)}</p>
                        <div className="item-actions">
                          <div className="quantity-controls">
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button className="remove-item" type="button" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>{t('nav.subtotal', 'Sous-total')}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>{t('nav.total', 'Total')}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                  <button className="btn btn-success w-100 py-3 fw-bold" type="button" onClick={handleCheckout}>
                    {t('nav.checkout', 'PASSER LA COMMANDE')}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
