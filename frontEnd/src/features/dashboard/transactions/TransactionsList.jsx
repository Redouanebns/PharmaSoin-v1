import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDownCircle, ArrowUpCircle, Edit, Filter, Plus, ReceiptText, Search, Trash2, Wallet } from 'lucide-react';
import api from '../../../services/api';
import TransactionFormModal from './TransactionFormModal';
import './TransactionsList.css';

const badgeClass = (statut) => {
  switch (statut) {
    case 'Confirmée':
      return 'confirmed';
    case 'En attente':
      return 'pending';
    case 'Annulée':
      return 'cancelled';
    default:
      return '';
  }
};

const TransactionsList = ({ isDarkMode, toggleDarkMode }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/transactions');
      setTransactions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer les transactions depuis l’API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const haystack = `${transaction.reference || ''} ${transaction.description || ''} ${transaction.fournisseur || ''} ${transaction.vente_numero || ''} ${transaction.commande_numero || ''}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesType = !typeFilter || transaction.type === typeFilter;
      const matchesSource = !sourceFilter || transaction.source === sourceFilter;
      const matchesStatus = !statusFilter || transaction.statut === statusFilter;
      return matchesSearch && matchesType && matchesSource && matchesStatus;
    });
  }, [transactions, searchTerm, typeFilter, sourceFilter, statusFilter]);

  const stats = useMemo(() => {
    const confirmed = transactions.filter((item) => item.statut === 'Confirmée');
    const creditTotal = confirmed.filter((item) => item.type === 'credit').reduce((sum, item) => sum + Number(item.montant || 0), 0);
    const debitTotal = confirmed.filter((item) => item.type === 'debit').reduce((sum, item) => sum + Number(item.montant || 0), 0);
    return {
      count: transactions.length,
      creditTotal,
      debitTotal,
      balance: creditTotal - debitTotal,
    };
  }, [transactions]);

  const openCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEdit = (transaction) => {
    if (transaction.source !== 'manual') {
      window.alert('Les transactions générées depuis une vente ou une commande doivent être modifiées depuis leur module d’origine.');
      return;
    }
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const confirmDeleteClick = (transaction) => {
    if (transaction.source !== 'manual') {
      window.alert('Les transactions automatiques ne peuvent pas être supprimées ici.');
      return;
    }
    setTransactionToDelete(transaction);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await api.delete(`/transactions/${transactionToDelete.id}`);
      await fetchTransactions();
      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setDeleteError(e.response.data.message);
      } else {
        setDeleteError('Erreur lors de la suppression.');
      }
    }
  };

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.message || 'Erreur lors de l’enregistrement de la transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`transactions-page ${isDarkMode ? 'dark-mode' : ''}`}>

      <div className="transactions-header">
        <div>
          <div className="transactions-title-row">
            <div className="page-header-icon me-3">
              <Wallet size={26} />
            </div>
            <h2>Transactions</h2>
          </div>
          <p className="transactions-subtitle">Suivi des flux financiers manuels, ventes et commandes fournisseurs.</p>
        </div>
        <button className="transactions-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Nouvelle transaction
        </button>
      </div>

      <div className="transactions-stats-grid">
        <div className="transactions-stat-card">
          <span className="icon-box success"><ArrowUpCircle size={18} /></span>
          <div>
            <small>Entrées confirmées</small>
            <strong>{stats.creditTotal.toFixed(2)} DH</strong>
          </div>
        </div>
        <div className="transactions-stat-card">
          <span className="icon-box danger"><ArrowDownCircle size={18} /></span>
          <div>
            <small>Sorties confirmées</small>
            <strong>{stats.debitTotal.toFixed(2)} DH</strong>
          </div>
        </div>
        <div className="transactions-stat-card">
          <span className="icon-box info"><ReceiptText size={18} /></span>
          <div>
            <small>Total transactions</small>
            <strong>{stats.count}</strong>
          </div>
        </div>
        <div className="transactions-stat-card">
          <span className={`icon-box ${stats.balance >= 0 ? 'success' : 'danger'}`}><Wallet size={18} /></span>
          <div>
            <small>Solde net confirmé</small>
            <strong>{stats.balance.toFixed(2)} DH</strong>
          </div>
        </div>
      </div>

      <div className="transactions-panel">
        <div className="transactions-toolbar">
          <div className="transactions-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher par référence, description, commande ou vente..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="transactions-filters">
            <div className="transactions-filter-chip">
              <Filter size={16} />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">Tous types</option>
                <option value="credit">Entrées</option>
                <option value="debit">Sorties</option>
              </select>
            </div>

            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
              <option value="">Toutes sources</option>
              <option value="manual">Manuelle</option>
              <option value="vente">Vente</option>
              <option value="commande">Commande</option>
            </select>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Tous statuts</option>
              <option value="Confirmée">Confirmée</option>
              <option value="En attente">En attente</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="transactions-loading">Chargement des transactions...</div>
        ) : error ? (
          <div className="transactions-error">{error}</div>
        ) : (
          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Montant</th>
                  <th>Paiement</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="transactions-empty">Aucune transaction trouvée.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <strong>{transaction.reference}</strong>
                      </td>
                      <td>
                        <span className={`type-badge ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                          {transaction.type_label}
                        </span>
                      </td>
                      <td>
                        <div className="source-stack">
                          <span>{transaction.source_label}</span>
                          {transaction.vente_numero && <small>Vente: {transaction.vente_numero}</small>}
                          {transaction.commande_numero && <small>Commande: {transaction.commande_numero}</small>}
                          {transaction.fournisseur && <small>Fournisseur: {transaction.fournisseur}</small>}
                        </div>
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        <span className={`signed-amount ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{Number(transaction.montant || 0).toFixed(2)} DH
                        </span>
                      </td>
                      <td>{transaction.paiement}</td>
                      <td>{transaction.date}</td>
                      <td>
                        <span className={`status-badge ${badgeClass(transaction.statut)}`}>{transaction.statut}</span>
                      </td>
                      <td>
                        <div className="transactions-actions">
                          <button className="table-icon-btn edit" onClick={() => openEdit(transaction)} title="Modifier">
                            <Edit size={16} />
                          </button>
                          <button className="table-icon-btn delete" onClick={() => confirmDeleteClick(transaction)} title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!saving) {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }
        }}
        onSave={handleSave}
        transaction={editingTransaction}
        isSaving={saving}
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
            <p className="text-muted mb-4">Êtes-vous sûr de vouloir supprimer la transaction <strong>{transactionToDelete?.reference}</strong> ? Cette action est définitive.</p>
            
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

export default TransactionsList;
