import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import Navbar from './navbar/Navbar';
import HeroSection from './herosection/HeroSection';
import Categorie from './Accueil-categorie/Categorie';
import Medicament from './Accuiel-medicament/Medicament';
import Services from './services/Services';
import About from './about/About';
import Testimonials from './testimonials/Testimonials';
import Newsletter from './newsletter/Newsletter';
import Footer from './footer/Footer';
import './Accueil.css';

const Accueil = ({ searchQuery, setSearchQuery }) => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { currentLanguage, t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const [medRes, catRes] = await Promise.all([api.get('http://localhost:8000/api/medicaments'), api.get('http://localhost:8000/api/categories')]);
        setMedicines(Array.isArray(medRes.data) ? medRes.data : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch (e) {
        setError(true);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLanguage]);

  const filteredMedicines = medicines.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category_id === parseInt(selectedCategory, 10);
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (m.nom || '').toLowerCase().includes(query) || (m.dci || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleConnexionClick = () => {
    navigate('/authentification');
  };

  if (loading) {
    return (
      <div className="accueil-loading">
        <div className="loading-spinner">
          <i className="fas fa-plus-circle"></i>
        </div>
        <span>{t('common.loading_pharmacy', 'Chargement de la pharmacie...')}</span>
      </div>
    );
  }

  return (
    <div className="accueil-container">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onConnexionClick={handleConnexionClick}
        showDarkModeToggle={false}
      />

      <HeroSection onConnexionClick={handleConnexionClick} />

      <div id="products-section">
        <Categorie
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <Medicament medicines={filteredMedicines} error={error} addToCart={addToCart} />
      </div>

      <Services />
      <About />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Accueil;
