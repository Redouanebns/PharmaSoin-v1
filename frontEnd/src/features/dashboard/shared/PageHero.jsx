import React, { useEffect, useState } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';
import './PageHero.css';

const PageHero = ({ title, description, icon = 'fas fa-layer-group', isDarkMode = false, toggleDarkMode }) => {
  const [clock, setClock] = useState('00:00:00');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('fr-FR', { hour12: false }));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: isDarkMode ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.88)', border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(148, 163, 184, 0.16)', boxShadow: '0 22px 50px rgba(15, 23, 42, 0.08)', backdropFilter: 'blur(16px)', borderRadius: '1.45rem', padding: '1.3rem 1.45rem', marginBottom: '1.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {icon && (
          <div className="page-header-icon" style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0f766e, #134e4a)', color: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)' }}>
            <i className={icon}></i>
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{title}</h2>
          {description && <p style={{ margin: '0.35rem 0 0', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem' }}>{description}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', borderRadius: '999px', padding: '0.5rem 1rem', background: isDarkMode ? 'rgba(15, 23, 42, 0.82)' : '#f8fafc', border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDarkMode ? '#e2e8f0' : '#475569', fontWeight: '700', fontSize: '0.9rem' }}>
          <Clock size={16} />
          <span>{clock}</span>
        </div>
        <button onClick={toggleDarkMode} title="Basculer le thème" style={{ width: '40px', height: '40px', borderRadius: '999px', border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #dbe4ea', background: isDarkMode ? 'rgba(15, 23, 42, 0.82)' : '#f8fafc', color: isDarkMode ? '#e2e8f0' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PageHero;
