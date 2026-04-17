import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import api from "../../../services/api";
import "./MedicineFormModal.css";

const localeTabs = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

const moleculeSuggestions = [
  "Paracétamol",
  "Ibuprofène",
  "Amoxicilline",
  "Azithromycine",
  "Acide ascorbique",
  "Trolamine",
  "Sucralfate",
];

const parseMolecules = (value = "") =>
  String(value)
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => {
      const lowered = item.toLocaleLowerCase();
      return array.findIndex((entry) => entry.toLocaleLowerCase() === lowered) === index;
    });

const normalizeMoleculeInput = (value = "") => parseMolecules(value).join(", ");

const emptyTranslation = () => ({
  nom: "",
  dci: "",
  dose: "",
  description: "",
});

const mapTranslations = (translations, baseData = {}) => {
  const mapped = {
    fr: {
      ...emptyTranslation(),
      nom: baseData?.nom || "",
      dci: baseData?.dci || "",
      dose: baseData?.dose || "",
      description: baseData?.description || "",
    },
    en: emptyTranslation(),
    ar: emptyTranslation(),
  };

  if (Array.isArray(translations)) {
    translations.forEach((translation) => {
      if (translation && translation.locale && mapped[translation.locale]) {
        mapped[translation.locale] = {
          nom: translation.nom || "",
          dci: translation.dci || "",
          dose: translation.dose || "",
          description: translation.description || "",
        };
      }
    });
  }

  return mapped;
};

const getInitialState = (initialData) => {
  const data = initialData || {};

  return {
    nom: data.nom || "",
    dci: data.dci || "",
    molecule: normalizeMoleculeInput(data.molecule || ""),
    code: data.code || "",
    category_id: data.category_id || "",
    dose: data.dose || "",
    prix: data.prix ?? 0,
    exp: data.exp || "",
    description: data.description || "",
    image_url: data.image_url || "",
    ordonnance: data.ordonnance ?? false,
    seuil_alerte: data.seuil_alerte ?? 10,
    translations: mapTranslations(data.translations, data),
  };
};

const MedicineFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [categories, setCategories] = useState([]);
  const [activeLocale, setActiveLocale] = useState("fr");
  const [formData, setFormData] = useState(getInitialState(initialData));
  const [moleculeDraft, setMoleculeDraft] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erreur chargement catégories:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    setFormData(getInitialState(initialData));
    setActiveLocale("fr");
    setMoleculeDraft("");
  }, [initialData, isOpen]);

  const activeTranslation = useMemo(
    () => formData.translations[activeLocale] || emptyTranslation(),
    [activeLocale, formData.translations],
  );

  const selectedMolecules = useMemo(
    () => parseMolecules(formData.molecule),
    [formData.molecule],
  );

  const handleBaseChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((previous) => ({
      ...previous,
      [name]: newValue,
      translations:
        name === "nom" ||
        name === "dci" ||
        name === "dose" ||
        name === "description"
          ? {
              ...previous.translations,
              fr: {
                ...previous.translations.fr,
                [name]: newValue,
              },
            }
          : previous.translations,
    }));
  };

  const handleTranslationChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      ...(activeLocale === "fr" ? { [name]: value } : {}),
      translations: {
        ...previous.translations,
        [activeLocale]: {
          ...previous.translations[activeLocale],
          [name]: value,
        },
      },
    }));
  };

  const mergeMolecules = (incomingValue) => {
    const merged = normalizeMoleculeInput(
      [formData.molecule, incomingValue].filter(Boolean).join(", "),
    );

    setFormData((previous) => ({
      ...previous,
      molecule: merged,
    }));
  };

  const commitMoleculeDraft = (rawValue = moleculeDraft) => {
    const normalizedDraft = normalizeMoleculeInput(rawValue);

    if (!normalizedDraft) {
      setMoleculeDraft("");
      return;
    }

    mergeMolecules(normalizedDraft);
    setMoleculeDraft("");
  };

  const handleMoleculeKeyDown = (event) => {
    if (["Enter", ",", ";", "Tab"].includes(event.key) && moleculeDraft.trim()) {
      event.preventDefault();
      commitMoleculeDraft();
      return;
    }

    if (event.key === "Backspace" && !moleculeDraft.trim() && selectedMolecules.length) {
      event.preventDefault();
      const nextItems = selectedMolecules.slice(0, -1);
      setFormData((previous) => ({
        ...previous,
        molecule: nextItems.join(", "),
      }));
    }
  };

  const handleRemoveMolecule = (moleculeToRemove) => {
    const nextItems = selectedMolecules.filter(
      (item) => item.toLocaleLowerCase() !== moleculeToRemove.toLocaleLowerCase(),
    );

    setFormData((previous) => ({
      ...previous,
      molecule: nextItems.join(", "),
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    commitMoleculeDraft(suggestion);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedMolecules = normalizeMoleculeInput(
      [formData.molecule, moleculeDraft].filter(Boolean).join(", "),
    );

    await onSave({
      ...formData,
      molecule: normalizedMolecules,
      prix: Number(formData.prix || 0),
      seuil_alerte: Number(formData.seuil_alerte || 0),
      ordonnance: Boolean(formData.ordonnance),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="modal-content-custom modal-content-translation"
          >
            <div className="modal-header-custom">
              <div>
                <h3>
                  {initialData
                    ? "Modifier le Médicament"
                    : "Nouveau Médicament"}
                </h3>
                <p>
                  Complétez la catégorie, les molécules et la date
                  d&apos;expiration. Le stock sera ensuite suivi par les
                  commandes et mouvements.
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn-close"
                aria-label="Fermer"
                type="button"
              ></button>
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
                    <label>Molécule(s) liée(s)</label>
                    <div className="molecule-input-shell">
                      {selectedMolecules.length > 0 ? (
                        <div className="selected-molecules">
                          {selectedMolecules.map((item) => (
                            <button
                              type="button"
                              key={item}
                              className="selected-molecule-chip"
                              onClick={() => handleRemoveMolecule(item)}
                              title={`Retirer ${item}`}
                            >
                              <span>{item}</span>
                              <i className="fas fa-times"></i>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="molecule-empty-state">
                          Aucune molécule ajoutée pour le moment.
                        </div>
                      )}

                      <div className="molecule-entry-row">
                        <input
                          type="text"
                          value={moleculeDraft}
                          onChange={(event) => setMoleculeDraft(event.target.value)}
                          onKeyDown={handleMoleculeKeyDown}
                          onBlur={() => commitMoleculeDraft()}
                          placeholder={
                            selectedMolecules.length
                              ? "Ajouter une autre molécule puis appuyer sur Entrée"
                              : "Saisir une molécule, puis Entrée"
                          }
                          className="form-input-custom molecule-inline-input"
                        />
                        <button
                          type="button"
                          className="molecule-add-btn"
                          onClick={() => commitMoleculeDraft()}
                        >
                          Ajouter
                        </button>
                      </div>

                      <input type="hidden" name="molecule" value={formData.molecule} />
                    </div>

                    <div className="molecule-suggestions-list">
                      {moleculeSuggestions.map((item) => {
                        const isActive = selectedMolecules.includes(item);
                        return (
                          <button
                            type="button"
                            key={item}
                            className={`molecule-suggestion-chip ${isActive ? "active" : ""}`}
                            onClick={() => handleSuggestionClick(item)}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                    <small className="field-helper-text">
                      Un produit peut contenir plusieurs molécules. Utilisez
                      Entrée, virgule ou le bouton « Ajouter » pour les empiler,
                      puis cliquez sur une pastille pour la retirer.
                    </small>
                  </div>
                </div>
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
              </div>

              <div className="row">
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
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Dosage / Forme</label>
                    <input
                      type="text"
                      name="dose"
                      value={formData.dose}
                      onChange={handleBaseChange}
                      placeholder="Ex: 500mg comprimé"
                      className="form-input-custom"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Prix (MAD)</label>
                    <input
                      type="number"
                      name="prix"
                      min="0"
                      step="0.01"
                      value={formData.prix}
                      onChange={handleBaseChange}
                      className="form-input-custom"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Seuil d'alerte</label>
                    <input
                      type="number"
                      name="seuil_alerte"
                      min="0"
                      value={formData.seuil_alerte}
                      onChange={handleBaseChange}
                      className="form-input-custom"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
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
                </div>
                <div className="col-md-6">
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
                </div>
              </div>

              <div className="form-group-custom">
                <label>Ordonnance requise</label>
                <div className="ordonnance-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="ordonnance"
                      checked={formData.ordonnance}
                      onChange={handleBaseChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {formData.ordonnance
                      ? "✅ Ce médicament nécessite une ordonnance"
                      : "❌ Médicament sans ordonnance"}
                  </span>
                </div>
              </div>

              <div className="form-group-custom">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleBaseChange}
                  rows="4"
                  className="form-input-custom"
                  placeholder="Description, indication ou notes du médicament"
                />
              </div>

              <div className="translation-panel">
                <div className="translation-tabs">
                  {localeTabs.map((locale) => (
                    <button
                      key={locale.code}
                      type="button"
                      className={`translation-tab ${activeLocale === locale.code ? "active" : ""}`}
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
                        className="form-input-custom"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label>Dosage ({activeLocale.toUpperCase()})</label>
                  <input
                    type="text"
                    name="dose"
                    value={activeTranslation.dose}
                    onChange={handleTranslationChange}
                    className="form-input-custom"
                  />
                </div>

                <div className="form-group-custom mb-0">
                  <label>Description ({activeLocale.toUpperCase()})</label>
                  <textarea
                    name="description"
                    value={activeTranslation.description}
                    onChange={handleTranslationChange}
                    rows="3"
                    className="form-input-custom"
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  {initialData ? "Mettre à jour" : "Enregistrer"}
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
