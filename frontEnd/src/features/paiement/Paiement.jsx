import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CreditCard, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../services/api';
import './Paiement.css';

const Payment = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const produits = cartItems.map(item => ({
        medicine_id: item.id,
        qte: item.quantity,
        prix_unitaire: item.prix
      }));

      const payload = {
        produits,
        payment_reference: formData.cardNumber.slice(-4),
        paiement: 'Carte',
      };

      await api.post('/client/orders/checkout', payload);
      
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert(error.response?.data?.message || 'Erreur lors de la validation de la commande. Veuillez vérifier que vous êtes connecté en tant que client.');
    }
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="payment-empty">
        <div className="text-center">
          <CreditCard size={64} className="mb-4 text-muted opacity-20" />
          <h2>Votre panier est vide</h2>
          <p>Ajoutez des produits avant de procéder au paiement.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/home')}>
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container py-5">
        <button className="back-btn mb-4" onClick={() => navigate('/home')}>
          <ArrowLeft size={20} />
          Retour
        </button>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="payment-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="row g-4"
            >
              <div className="col-lg-7">
                <div className="payment-card main-card">
                  <div className="card-header-custom">
                    <CreditCard className="text-success" />
                    <h3>Détails du Paiement</h3>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="payment-form">
                    <div className="mb-4">
                      <label className="form-label">Nom sur la carte</label>
                      <input 
                        type="text" 
                        name="name"
                        className="form-control custom-input" 
                        placeholder="M. Jean Dupont"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Numéro de carte</label>
                      <div className="input-group-custom">
                        <input 
                          type="text" 
                          name="cardNumber"
                          className="form-control custom-input" 
                          placeholder="0000 0000 0000 0000"
                          maxLength="19"
                          required
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                        />
                        <div className="card-icons">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label">Date d'expiration</label>
                        <input 
                          type="text" 
                          name="expiry"
                          className="form-control custom-input" 
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                          value={formData.expiry}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label">CVV</label>
                        <input 
                          type="password" 
                          name="cvv"
                          className="form-control custom-input" 
                          placeholder="***"
                          maxLength="3"
                          required
                          value={formData.cvv}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="security-info mb-4">
                      <ShieldCheck size={18} className="text-success" />
                      <span>Paiement sécurisé SSL 256-bit</span>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-success w-100 py-3 fw-bold payment-submit-btn"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      {isProcessing ? 'Traitement en cours...' : `PAYER ${cartTotal.toFixed(2)} DH`}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="payment-card summary-card">
                  <h3>Récapitulatif</h3>
                  <div className="summary-items">
                    {cartItems.map(item => (
                      <div key={item.id} className="summary-item">
                        <span className="item-name">{item.nom} x {item.quantity}</span>
                        <span className="item-price">{(item.prix * item.quantity).toFixed(2)} DH</span>
                      </div>
                    ))}
                  </div>
                  <div className="summary-total">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Sous-total</span>
                      <span>{cartTotal.toFixed(2)} DH</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Livraison</span>
                      <span className="text-success">Gratuite</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between total-row">
                      <span>Total à payer</span>
                      <span>{cartTotal.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success-message"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="success-container"
            >
              <div className="success-card">
                <div className="success-icon">
                  <CheckCircle2 size={80} className="text-success" />
                </div>
                <h2>Paiement Réussi !</h2>
                <p>Votre commande a été enregistrée avec succès. Vous recevrez un e-mail de confirmation sous peu.</p>
                <div className="order-number">Numéro de commande : #PH-{Math.floor(Math.random() * 1000000)}</div>
                <button className="btn btn-success px-5 py-3 mt-4" onClick={() => navigate('/home')}>
                  Retour à l'accueil
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Payment;
