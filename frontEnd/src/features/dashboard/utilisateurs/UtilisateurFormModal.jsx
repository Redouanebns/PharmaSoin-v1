import React, { useEffect, useState } from 'react';
import './UtilisateurFormModal.css';

const UtilisateurFormModal = ({ isOpen, onClose, onSave, user, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    address: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password on edit
        role: user.role || 'client',
        phone: user.phone || '',
        address: user.address || '',
        is_active: user.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'client',
        phone: '',
        address: '',
        is_active: true
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!user && !formData.password) newErrors.password = 'Le mot de passe est requis pour un nouvel utilisateur';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Le mot de passe doit faire au moins 6 caractères';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  const isSelf = user?.id === currentUser?.id;
  const isMainAdmin = user?.id === 1;

  return (
    <div className="user-modal-overlay">
      <div className="user-modal-content">
        <div className="user-modal-header">
          <div className="user-modal-header-left">
            <div className="user-modal-icon">
              <i className={`fas fa-user-${user ? 'edit' : 'plus'}`}></i>
            </div>
            <div>
              <h3>{user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
              <p className="user-modal-subtitle">
                {user ? 'Mettez à jour les informations et accès' : 'Créez un nouveau compte avec son rôle'}
              </p>
            </div>
          </div>
          <button className="user-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="user-modal-body">
          <form id="userForm" onSubmit={handleSubmit}>
            <div className="user-form-row">
              <div className="user-form-group">
                <label>Nom complet <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`user-form-input ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Jean Dupont"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="user-form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className={`user-form-input ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@email.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="user-form-row">
              <div className="user-form-group">
                <label>Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  className="user-form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: 06 12 34 56 78"
                />
              </div>

              <div className="user-form-group">
                <label>
                  Mot de passe {user && <span className="text-muted">(Laissez vide pour conserver l'actuel)</span>}
                  {!user && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  className={`user-form-input ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={user ? "Nouveau mot de passe" : "Mot de passe sécurisé"}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
            </div>

            <div className="user-form-group full-width">
              <label>Adresse complète</label>
              <textarea
                name="address"
                className="user-form-input textarea"
                value={formData.address}
                onChange={handleChange}
                placeholder="Adresse de livraison ou de contact..."
                rows="2"
              ></textarea>
            </div>

            <div className="user-form-row">
              <div className="user-form-group">
                <label>Rôle du compte <span className="required">*</span></label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'client' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === 'client'}
                      onChange={handleChange}
                      disabled={isMainAdmin || isSelf}
                    />
                    <i className="fas fa-user role-icon client"></i>
                    <div>
                      <strong>Client</strong>
                      <span>Achats et prescriptions</span>
                    </div>
                  </label>

                  <label className={`role-option ${formData.role === 'pharmacien' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="pharmacien"
                      checked={formData.role === 'pharmacien'}
                      onChange={handleChange}
                      disabled={isMainAdmin || isSelf}
                    />
                    <i className="fas fa-pills role-icon pharmacien"></i>
                    <div>
                      <strong>Pharmacien</strong>
                      <span>Gestion des stocks et ventes</span>
                    </div>
                  </label>

                  <label className={`role-option ${formData.role === 'admin' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleChange}
                      disabled={isMainAdmin || isSelf}
                    />
                    <i className="fas fa-shield-alt role-icon admin"></i>
                    <div>
                      <strong>Admin</strong>
                      <span>Contrôle total du système</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="user-form-group full-width">
              <div className="status-toggle-box">
                <div className="status-info">
                  <strong>Statut du compte</strong>
                  <span>{formData.is_active ? 'Ce compte peut se connecter et utiliser le système.' : 'Ce compte est suspendu et ne peut pas se connecter.'}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={isSelf || isMainAdmin}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
            
            {(isSelf || isMainAdmin) && (
              <div className="alert-info">
                <i className="fas fa-info-circle"></i> Certaines options sont verrouillées pour votre propre compte ou l'administrateur principal.
              </div>
            )}
          </form>
        </div>

        <div className="user-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" form="userForm" className="btn-save">
            <i className="fas fa-save"></i>
            {user ? 'Mettre à jour' : 'Créer l\'utilisateur'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UtilisateurFormModal;
