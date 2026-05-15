import React, { useCallback, useEffect, useState } from 'react';
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

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression de l’utilisateur.');
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
                          onClick={() => handleDelete(user.id)} 
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
    </div>
  );
};

export default UtilisateursList;
