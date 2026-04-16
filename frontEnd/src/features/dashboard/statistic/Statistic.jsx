import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle, ShoppingBag, FileText, FileSpreadsheet, Moon, Sun, Clock, Brain, Zap, Calendar, Package, Truck, Pill } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';
import api from '../../../services/api';
import './Statistic.css';

const COLORS = ['#009688', '#2c3e50', '#f39c12', '#8e44ad', '#3498db'];

const defaultSummary = {
  cards: {
    monthlyRevenue: { label: "Chiffre d'affaire (mois)", value: 0, suffix: 'DH', helper: '' },
    stockAlerts: { label: 'Alertes Stock & Expédition', value: 0, helper: '' },
    todayOrdonnances: { label: 'Ordonnances dispensées (jour)', value: 0, helper: '' },
    availabilityRate: { label: 'Disponibilité du stock', value: 0, suffix: '%', helper: '' },
  },
  meta: {
    categories: 0,
    medicines: 0,
    suppliers: 0,
    commandes: 0,
    ordonnances: 0,
    deliveryRate: 0,
    pendingCommandes: 0,
    expiredMedicines: 0,
    lowStockMedicines: 0,
    onlineOrders: 0,
    pendingOnlineOrders: 0,
  },
  charts: {
    salesTrend: [],
    topProducts: [],
    seasonality: [],
  },
  alerts: [],
  insights: [],
};

const formatCardValue = (card) => {
  const value = Number(card?.value || 0);

  if (card?.suffix === 'DH') {
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })} DH`;
  }

  if (card?.suffix === '%') {
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: value % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 })} %`;
  }

  return value.toLocaleString('fr-FR');
};

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const buildStatisticsCsv = (summary, currentUser) => {
  const lines = [];
  const now = new Date().toLocaleString('fr-FR');

  lines.push([escapeCsv('Section'), escapeCsv('Clé'), escapeCsv('Valeur'), escapeCsv('Détail')].join(';'));
  lines.push([escapeCsv('Meta'), escapeCsv('Utilisateur'), escapeCsv(currentUser?.name || '—'), escapeCsv(currentUser?.role || '—')].join(';'));
  lines.push([escapeCsv('Meta'), escapeCsv('Date export'), escapeCsv(now), escapeCsv('Export généré depuis le dashboard')].join(';'));

  Object.entries(summary.cards || {}).forEach(([key, card]) => {
    lines.push([
      escapeCsv('Cartes'),
      escapeCsv(key),
      escapeCsv(`${card?.value ?? ''}${card?.suffix ? ` ${card.suffix}` : ''}`),
      escapeCsv(card?.helper || ''),
    ].join(';'));
  });

  Object.entries(summary.meta || {}).forEach(([key, value]) => {
    lines.push([escapeCsv('Métriques'), escapeCsv(key), escapeCsv(value), escapeCsv('')].join(';'));
  });

  (summary.charts?.salesTrend || []).forEach((item) => {
    lines.push([escapeCsv('Graphiques'), escapeCsv('salesTrend'), escapeCsv(item.sales), escapeCsv(`${item.date} · ${item.orders} commande(s)`) ].join(';'));
  });

  (summary.charts?.topProducts || []).forEach((item) => {
    lines.push([escapeCsv('Graphiques'), escapeCsv('topProducts'), escapeCsv(item.value), escapeCsv(`${item.name} · ${item.sold} unité(s) · Stock ${item.stock}`)].join(';'));
  });

  (summary.charts?.seasonality || []).forEach((item) => {
    lines.push([escapeCsv('Graphiques'), escapeCsv('seasonality'), escapeCsv(item.sales), escapeCsv(`${item.month} · ${item.orders} commande(s)`) ].join(';'));
  });

  (summary.alerts || []).forEach((alert, index) => {
    lines.push([escapeCsv('Alertes'), escapeCsv(`alerte_${index + 1}`), escapeCsv(alert?.type || 'info'), escapeCsv(alert?.label || '')].join(';'));
  });

  (summary.insights || []).forEach((insight, index) => {
    lines.push([escapeCsv('Insights'), escapeCsv(`insight_${index + 1}`), escapeCsv(insight?.icon || ''), escapeCsv(insight?.text || '')].join(';'));
  });

  return lines.join('\n');
};

const Statistics = ({ currentUser, isDarkMode, toggleDarkMode }) => {
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exportFeedback, setExportFeedback] = useState('');

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/dashboard/summary');
      setSummary({ ...defaultSummary, ...(response.data || {}) });
    } catch (fetchError) {
      console.error(fetchError);
      setError('Impossible de charger les statistiques du dashboard depuis l’API.');
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cards = summary.cards || defaultSummary.cards;
  const meta = summary.meta || defaultSummary.meta;
  const salesTrend = useMemo(() => summary.charts?.salesTrend || [], [summary]);
  const topProducts = useMemo(() => summary.charts?.topProducts || [], [summary]);
  const seasonality = useMemo(() => summary.charts?.seasonality || [], [summary]);
  const alerts = useMemo(() => summary.alerts || [], [summary]);
  const insights = useMemo(() => summary.insights || [], [summary]);

  const handleExport = () => {
    const csv = buildStatisticsCsv(summary, currentUser);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiques-${currentUser?.role || 'dashboard'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExportFeedback('Export CSV généré avec succès.');
    window.setTimeout(() => setExportFeedback(''), 3200);
  };

  if (loading) {
    return <div className="p-5 text-center">Chargement des statistiques depuis l’API...</div>;
  }

  return (
    <div className={`stats-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="stats-top-bar">
        <div className="top-bar-left">
          <h2>Dashboard</h2>
          <small className="text-muted">Vue synthétique des données backend et export des statistiques</small>
        </div>
        <div className="top-bar-right stats-actions">
          <div className="clock-display">
            <Clock size={18} className="me-2" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <button onClick={handleExport} className="export-btn" type="button">
            <FileSpreadsheet size={18} />
            Exporter
          </button>
          <button onClick={toggleDarkMode} className="theme-btn" type="button">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {exportFeedback && <div className="export-feedback">{exportFeedback}</div>}
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card blue">
          <p className="card-label">{cards.monthlyRevenue.label}</p>
          <h3 className="card-value">{formatCardValue(cards.monthlyRevenue)}</h3>
          <p className="card-footer"><TrendingUp size={14} className="me-1" />{cards.monthlyRevenue.helper}</p>
        </div>
        <div className="stat-card red">
          <p className="card-label">{cards.stockAlerts.label}</p>
          <h3 className="card-value">{formatCardValue(cards.stockAlerts)}</h3>
          <p className="card-footer">{cards.stockAlerts.helper}</p>
        </div>
        <div className="stat-card green">
          <p className="card-label">{cards.todayOrdonnances.label}</p>
          <h3 className="card-value">{formatCardValue(cards.todayOrdonnances)}</h3>
          <p className="card-footer">{cards.todayOrdonnances.helper}</p>
        </div>
        <div className="stat-card yellow">
          <p className="card-label">{cards.availabilityRate.label}</p>
          <h3 className="card-value">{formatCardValue(cards.availabilityRate)}</h3>
          <p className="card-footer">{cards.availabilityRate.helper}</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container main-chart">
          <div className="chart-header">
            <h4>Tendance des commandes (7 derniers jours)</h4>
            <span className="text-muted small">Données Laravel synchronisées</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#b2bec3', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b2bec3', fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} DH`, 'Montant']} />
                <Line type="monotone" dataKey="sales" stroke="#009688" strokeWidth={3} dot={{ r: 6, fill: '#009688', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container side-chart">
          <div className="chart-header">
            <h4>Top produits par valeur</h4>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#b2bec3', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b2bec3', fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} DH`, 'Valeur']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <div className="section-header-main">
          <Brain className="text-primary me-2" />
          <h3>Analyse du stock et des commandes</h3>
        </div>

        <div className="analysis-grid">
          <div className="analysis-card seasonality">
            <div className="card-header-flex">
              <h4>Activité mensuelle des commandes</h4>
              <Calendar size={16} className="text-muted" />
            </div>
            <div className="chart-wrapper-small">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={seasonality}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009688" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#009688" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} DH`, 'Montant']} />
                  <Area type="monotone" dataKey="sales" stroke="#009688" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="analysis-note">
              <strong>{meta.commandes}</strong> commande(s) fournisseur, <strong>{meta.onlineOrders || 0}</strong> commande(s) web, <strong>{meta.deliveryRate}%</strong> de taux de livraison.
            </p>
          </div>

          <div className="analysis-card insights">
            <div className="card-header-flex">
              <h4>Insights API</h4>
              <Zap size={16} className="text-warning" />
            </div>
            <ul className="insights-list">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <li key={`${insight.icon}-${index}`}>
                    <span className="insight-icon">{insight.icon}</span>
                    <p>{insight.text}</p>
                  </li>
                ))
              ) : (
                <li>
                  <span className="insight-icon">ℹ️</span>
                  <p>Aucun insight disponible pour le moment.</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="alerts-section">
          <div className="section-header">
            <AlertTriangle className="text-danger me-2" size={20} />
            <h4>Alertes critiques</h4>
          </div>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={`${alert.label}-${index}`} className={`alert-item ${alert.type || 'warning'}`}>
                  {alert.label}
                </div>
              ))
            ) : (
              <div className="alert-item info">Aucune alerte remontée par l’API.</div>
            )}
          </div>
        </div>

        <div className="reports-section">
          <h4>Résumé opérationnel</h4>
          <p>Toutes les cartes et les graphiques sont alimentés par l’API backend.</p>
          <div className="reports-actions flex-column align-items-start gap-3">
            <div className="d-flex align-items-center gap-2"><Pill size={18} /><span>{meta.medicines} médicament(s)</span></div>
            <div className="d-flex align-items-center gap-2"><ShoppingBag size={18} /><span>{meta.categories} catégorie(s)</span></div>
            <div className="d-flex align-items-center gap-2"><Truck size={18} /><span>{meta.pendingCommandes} commande(s) fournisseur en attente</span></div>
            <div className="d-flex align-items-center gap-2"><Truck size={18} /><span>{meta.pendingOnlineOrders || 0} commande(s) web en attente</span></div>
            <div className="d-flex align-items-center gap-2"><Package size={18} /><span>{meta.lowStockMedicines} produit(s) à stock faible</span></div>
            <div className="d-flex align-items-center gap-2"><FileText size={18} /><span>{meta.ordonnances} ordonnance(s)</span></div>
            <div className="d-flex align-items-center gap-2"><FileSpreadsheet size={18} /><span>{meta.expiredMedicines} produit(s) expiré(s)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
