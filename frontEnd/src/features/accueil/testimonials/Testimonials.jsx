import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './Testimonials.css';

const testimonialBase = [
  { id: 1, name: 'Fatima Zahra B.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b6e5?w=100&q=80', rating: 5 },
  { id: 2, name: 'Mohamed A.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', rating: 5 },
  { id: 3, name: 'Amina K.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', rating: 5 },
  { id: 4, name: 'Karim M.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', rating: 4 },
  { id: 5, name: 'Nadia R.', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80', rating: 5 },
  { id: 6, name: 'Hassan T.', avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&q=80', rating: 5 },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();

  const testimonials = useMemo(
    () =>
      testimonialBase.map((item) => ({
        ...item,
        role: t(`testimonials.items.${item.id}.role`, ''),
        text: t(`testimonials.items.${item.id}.text`, ''),
        tag: t(`testimonials.items.${item.id}.tag`, ''),
      })),
    [t],
  );

  const visibleTestimonials = [
    testimonials[activeIndex % testimonials.length],
    testimonials[(activeIndex + 1) % testimonials.length],
    testimonials[(activeIndex + 2) % testimonials.length],
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <span className="testimonials-badge">
            <i className="fas fa-star me-2"></i>
            {t('testimonials.badge', 'Témoignages')}
          </span>
          <h2 className="testimonials-title">
            {t('testimonials.title_line1', 'Ce Que Disent')}
            <br />
            <span className="testimonials-highlight">{t('testimonials.highlight', 'Nos Clients')}</span>
          </h2>
          <p className="testimonials-subtitle">{t('testimonials.subtitle')}</p>
        </div>

        <div className="rating-summary">
          <div className="rating-score">
            <span className="score-number">4.9</span>
            <div className="score-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
            </div>
            <span className="score-count">{t('testimonials.score_count', 'Basé sur 850+ avis')}</span>
          </div>
          <div className="rating-bars">
            {[
              { stars: 5, percent: 88 },
              { stars: 4, percent: 9 },
              { stars: 3, percent: 2 },
              { stars: 2, percent: 1 },
              { stars: 1, percent: 0 },
            ].map((bar) => (
              <div className="rating-bar-row" key={bar.stars}>
                <span>
                  {bar.stars} <i className="fas fa-star"></i>
                </span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${bar.percent}%` }}></div>
                </div>
                <span>{bar.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials-grid">
          {visibleTestimonials.map((testimonial, index) => (
            <div className={`testimonial-card ${index === 1 ? 'featured' : ''}`} key={testimonial.id}>
              <div className="testimonial-top">
                <div className="testimonial-avatar">
                  <img src={testimonial.avatar} alt={testimonial.name} referrerPolicy="no-referrer" />
                </div>
                <div className="testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
                <div className="testimonial-quote-icon">
                  <i className="fas fa-quote-right"></i>
                </div>
              </div>
              <div className="testimonial-stars">
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <i key={starIndex} className="fas fa-star"></i>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <span className="testimonial-tag">
                <i className="fas fa-tag me-1"></i>
                {testimonial.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="testimonials-nav">
          <button
            className="nav-btn"
            onClick={() => setActiveIndex((activeIndex - 1 + testimonials.length) % testimonials.length)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="nav-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`nav-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button className="nav-btn" onClick={() => setActiveIndex((activeIndex + 1) % testimonials.length)}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
