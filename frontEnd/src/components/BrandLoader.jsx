import React from 'react';
import './BrandLoader.css';

const BrandLoader = ({
  title = 'PharmaSoin',
  message = 'Préparation de votre espace santé...',
  kicker = 'Chargement sécurisé',
  fullscreen = true,
  compact = false,
}) => (
  <div className={`brand-loader-shell ${fullscreen ? 'fullscreen' : ''} ${compact ? 'compact' : ''}`}>
    <div className="brand-loader-card glass-card">
      <div className="brand-loader-visual" aria-hidden="true">
        <div className="brand-loader-ring brand-loader-ring--outer"></div>
        <div className="brand-loader-ring brand-loader-ring--inner"></div>
        <div className="brand-loader-core">
          <span className="brand-loader-cross brand-loader-cross--vertical"></span>
          <span className="brand-loader-cross brand-loader-cross--horizontal"></span>
        </div>
        <div className="brand-loader-pulse"></div>
      </div>

      <div className="brand-loader-copy">
        <span className="brand-loader-kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  </div>
);

export default BrandLoader;
