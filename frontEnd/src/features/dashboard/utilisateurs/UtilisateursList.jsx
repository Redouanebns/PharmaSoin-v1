import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '../../../services/api';
import UtilisateurFormModal from './UtilisateurFormModal';
import './UtilisateursList.css';

const UtilisateursList = ({ currentUser, isDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/users', {
        params: { search: searchQuery }
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des utilisateurs depuis l’API.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const confirmDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      await fetchUsers();
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setDeleteError(e.response.data.message);
      } else {
        setDeleteError('Erreur lors de la suppression.');
      }
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data);
      } else {
        await api.post('/users', data);
      }

      setIsModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur lors de l’enregistrement de l’utilisateur.');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'pharmacien': return 'role-pharmacien';
      default: return 'role-client';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'pharmacien': return 'Pharmacien';
      default: return 'Client';
    }
  };

  return (
    <div className={`users-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="users-card">
        <div className="users-header">
          <div className="header-title">
            <div className="page-header-icon">
              <i className="fas fa-users-cog"></i>
            </div>
            <h2>Gestion des Utilisateurs</h2>
          </div>
          
          <div className="header-actions">
            <form className="users-search-form" onSubmit={handleSearch}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher (nom, email, téléphone)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button className="btn-add-user" onClick={handleAdd}>
              <i className="fas fa-plus"></i>
              Nouvel Utilisateur
            </button>
          </div>
        </div>

        {loading ? (
          <div className="users-loading">
            <i className="fas fa-spinner fa-spin"></i> Chargement...
          </div>
        ) : error ? (
          <div className="users-error">{error}</div>
        ) : (
          <div className="users-table-wrapper table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Contact</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="user-name-col">
                        <div className="user-avatar-mini">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.name}</strong>
                      </td>
                      <td className="user-contact">
                        <div><i className="fas fa-envelope"></i> {user.email}</div>
                        {user.phone && <div><i className="fas fa-phone"></i> {user.phone}</div>}
                      </td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="user-date">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="user-actions">
                        <button className="btn-edit" onClick={() => handleEdit(user)} title="Modifier">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => confirmDeleteClick(user)} 
                          title="Supprimer"
                          disabled={user.id === 1 || user.id === currentUser?.id}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UtilisateurFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        user={editingUser}
        currentUser={currentUser}
      />

      {deleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal-content-custom"
            style={{ maxWidth: '400px', padding: '24px' }}
          >
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-exclamation-triangle text-danger fs-3 me-3"></i>
              <h4 className="mb-0 text-dark fw-bold">Confirmer la suppression</h4>
            </div>
            <p className="text-muted mb-4">Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ? Cette action est définitive.</p>
            
            {deleteError && (
              <div className="alert alert-danger py-2 mb-4" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-circle me-2"></i>
                {deleteError}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="btn btn-light border">Annuler</button>
              <button onClick={executeDelete} className="btn btn-danger">Supprimer</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UtilisateursList;
