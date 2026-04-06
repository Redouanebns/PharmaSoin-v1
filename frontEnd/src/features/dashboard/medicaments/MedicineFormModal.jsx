import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import api from '../../../services/api';
import './MedicineFormModal.css';

const localeTabs = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
];

const emptyTranslation = () => ({ nom: '', dci: '', dose: '', description: '' });


const mapTranslations = (translations, baseData = {}) => {

  const data = baseData || {}; 

  const mapped = {
    fr: {
      ...emptyTranslation(),
      nom: data.nom || '',
      dci: data.dci || '',
      dose: data.dose || '',
      description: data.description || '',
    },
    en: emptyTranslation(),
    ar: emptyTranslation(),
  };

  // ... rest of your code

  if (Array.isArray(translations)) {
    translations.forEach((translation) => {
      if (translation?.locale && mapped[translation.locale]) {
        mapped[translation.locale] = {
          nom: translation.nom || '',
          dci: translation.dci || '',
          dose: translation.dose || '',
          description: translation.description || '',
        };
      }
    });
  } else if (translations && typeof translations === 'object') {
    localeTabs.forEach(({ code }) => {
      if (translations[code]) {
        mapped[code] = {
          nom: translations[code].nom || '',
          dci: translations[code].dci || '',
          dose: translations[code].dose || '',
          description: translations[code].description || '',
        };
      }
    });
  }

  return mapped;
};

const getInitialState = (initialData) => ({
  nom: initialData?.nom || '',
  dci: initialData?.dci || '',
  code: initialData?.code || '',
  category_id: initialData?.category_id || '',
  dose: initialData?.dose || '',
  stock: initialData?.stock || '',
  prix: initialData?.prix || '',
  exp: initialData?.exp || '',
  description: initialData?.description || '',
  image_url: initialData?.image_url || '',
  translations: mapTranslations(initialData?.translations, initialData),
});

const MedicineFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [categories, setCategories] = useState([]);
  const [activeLocale, setActiveLocale] = useState('fr');
  const [formData, setFormData] = useState(getInitialState(initialData));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
        name === 'nom' || name === 'dci' || name === 'dose' || name === 'description'
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
    await onSave({ ...formData, translations: formData.translations });
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
              <h3>{initialData ? 'Modifier le Médicament' : 'Nouveau Médicament'}</h3>
              <button onClick={onClose} className="btn-close" aria-label="Close"></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body-custom">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Nom du produit</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleBaseChange}
                      placeholder="Ex: Doliprane"
                      className="form-input-custom"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>DCI</label>
                    <input
                      type="text"
                      name="dci"
                      value={formData.dci}
                      onChange={handleBaseChange}
                      placeholder="Ex: Paracétamol"
                      className="form-input-custom"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Code barres</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleBaseChange}
                      placeholder="Code barres..."
                      className="form-input-custom"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Catégorie</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleBaseChange}
                      className="form-input-custom"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>Dosage/Forme</label>
                    <input
                      type="text"
                      name="dose"
                      value={formData.dose}
                      onChange={handleBaseChange}
                      placeholder="Ex: 500mg Gélule"
                      className="form-input-custom"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>Stock initial</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleBaseChange}
                      placeholder="0"
                      className="form-input-custom"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>Prix (MAD)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="prix"
                      value={formData.prix}
                      onChange={handleBaseChange}
                      placeholder="0.00"
                      className="form-input-custom"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-custom">
                <label>Date d'expiration</label>
                <input
                  type="date"
                  name="exp"
                  value={formData.exp}
                  onChange={handleBaseChange}
                  className="form-input-custom"
                  required
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

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label>Nom ({activeLocale.toUpperCase()})</label>
                      <input
                        type="text"
                        name="nom"
                        value={activeTranslation.nom}
                        onChange={handleTranslationChange}
                        placeholder={`Nom ${activeLocale.toUpperCase()}`}
                        className="form-input-custom"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label>DCI ({activeLocale.toUpperCase()})</label>
                      <input
                        type="text"
                        name="dci"
                        value={activeTranslation.dci}
                        onChange={handleTranslationChange}
                        placeholder={`DCI ${activeLocale.toUpperCase()}`}
                        className="form-input-custom"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label>Dosage/Forme ({activeLocale.toUpperCase()})</label>
                  <input
                    type="text"
                    name="dose"
                    value={activeTranslation.dose}
                    onChange={handleTranslationChange}
                    placeholder={`Dosage ${activeLocale.toUpperCase()}`}
                    className="form-input-custom"
                  />
                </div>

                <div className="form-group-custom mb-0">
                  <label>Description ({activeLocale.toUpperCase()})</label>
                  <textarea
                    name="description"
                    value={activeTranslation.description}
                    onChange={handleTranslationChange}
                    placeholder={`Description ${activeLocale.toUpperCase()}`}
                    rows="3"
                    className="form-input-custom"
                    style={{ resize: 'none' }}
                  ></textarea>
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

export default MedicineFormModal;
