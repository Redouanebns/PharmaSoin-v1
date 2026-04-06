import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './CategorieFormModal.css';

const localeTabs = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
];

const emptyTranslation = () => ({ name: '', description: '', criteria: '' });

const mapTranslations = (translations, baseData = {}) => {

  const data = baseData || {}; 

  const mapped = {
    fr: { 
      ...emptyTranslation(), 
      name: data.name || '', 
      description: data.description || '', 
      criteria: data.criteria || '' 
    },
    en: emptyTranslation(),
    ar: emptyTranslation(),
  };
  // ... rest of the function

  if (Array.isArray(translations)) {
    translations.forEach((translation) => {
      if (translation?.locale && mapped[translation.locale]) {
        mapped[translation.locale] = {
          name: translation.name || '',
          description: translation.description || '',
          criteria: translation.criteria || '',
        };
      }
    });
  } else if (translations && typeof translations === 'object') {
    localeTabs.forEach(({ code }) => {
      if (translations[code]) {
        mapped[code] = {
          name: translations[code].name || '',
          description: translations[code].description || '',
          criteria: translations[code].criteria || '',
        };
      }
    });
  }

  return mapped;
};

const getInitialState = (initialData) => ({
  name: initialData?.name || '',
  description: initialData?.description || '',
  criteria: initialData?.criteria || '',
  image_url: initialData?.image_url || '',
  translations: mapTranslations(initialData?.translations, initialData),
});

const CategorieFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeLocale, setActiveLocale] = useState('fr');
  const [formData, setFormData] = useState(getInitialState(initialData));

  useEffect(() => {
    setFormData(getInitialState(initialData));
    setActiveLocale('fr');
  }, [initialData, isOpen]);

  const activeTranslation = useMemo(() => formData.translations[activeLocale] || emptyTranslation(), [activeLocale, formData.translations]);

  const handleBaseChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      translations:
        name === 'name' || name === 'description' || name === 'criteria'
          ? {
              ...prev.translations,
              fr: {
                ...prev.translations.fr,
                [name]: value,
              },
            }
          : prev.translations,
    }));
  };

  const handleTranslationChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      ...(activeLocale === 'fr' ? { [name]: value } : {}),
      translations: {
        ...prev.translations,
        [activeLocale]: {
          ...prev.translations[activeLocale],
          [name]: value,
        },
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...formData,
      translations: formData.translations,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="modal-content-custom modal-content-translation"
          >
            <div className="modal-header-custom">
              <h3>{initialData ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</h3>
              <button onClick={onClose} className="btn-close" aria-label="Close"></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body-custom">
              <div className="form-group-custom">
                <label>Nom de la catégorie</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleBaseChange}
                  placeholder="Ex: Antalgiques"
                  className="form-input-custom"
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleBaseChange}
                  placeholder="Description de la catégorie..."
                  rows="3"
                  className="form-input-custom"
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <div className="form-group-custom">
                <label>Critères</label>
                <input
                  type="text"
                  name="criteria"
                  value={formData.criteria}
                  onChange={handleBaseChange}
                  placeholder="Ex: Paracétamol, Ibuprofène"
                  className="form-input-custom"
                />
              </div>

              <div className="form-group-custom">
                <label>URL de l'image</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleBaseChange}
                  placeholder="https://..."
                  className="form-input-custom"
                />
              </div>

              <div className="translation-panel">
                <div className="translation-tabs">
                  {localeTabs.map((locale) => (
                    <button
                      key={locale.code}
                      type="button"
                      className={`translation-tab ${activeLocale === locale.code ? 'active' : ''}`}
                      onClick={() => setActiveLocale(locale.code)}
                    >
                      {locale.label}
                    </button>
                  ))}
                </div>

                <div className="translation-grid">
                  <div className="form-group-custom">
                    <label>Nom ({activeLocale.toUpperCase()})</label>
                    <input
                      type="text"
                      name="name"
                      value={activeTranslation.name}
                      onChange={handleTranslationChange}
                      className="form-input-custom"
                      placeholder={`Nom ${activeLocale.toUpperCase()}`}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Description ({activeLocale.toUpperCase()})</label>
                    <textarea
                      name="description"
                      value={activeTranslation.description}
                      onChange={handleTranslationChange}
                      rows="3"
                      className="form-input-custom"
                      style={{ resize: 'none' }}
                      placeholder={`Description ${activeLocale.toUpperCase()}`}
                    ></textarea>
                  </div>

                  <div className="form-group-custom mb-0">
                    <label>Critères ({activeLocale.toUpperCase()})</label>
                    <input
                      type="text"
                      name="criteria"
                      value={activeTranslation.criteria}
                      onChange={handleTranslationChange}
                      className="form-input-custom"
                      placeholder={`Critères ${activeLocale.toUpperCase()}`}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" onClick={onClose} className="btn-cancel">
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategorieFormModal;
