import React, { useEffect, useState } from 'react';
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
    <div className={`dashboard-page-hero ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="dashboard-page-hero__content">
        <div className="dashboard-page-hero__icon">
          <i className={icon}></i>
        </div>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="dashboard-page-hero__meta">
        <div className="dashboard-page-hero__clock">{clock}</div>
        <div className="dashboard-page-hero__tools">
          <button
            type="button"
            className="dashboard-page-hero__theme-btn"
            onClick={toggleDarkMode}
            title="Basculer le thème"
            aria-label="Basculer le thème"
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageHero;
