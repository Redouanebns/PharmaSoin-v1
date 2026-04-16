import { useCallback, useState } from 'react';
import api from '../services/api';

/**
 * useBarcodeCart
 * ──────────────
 * Hook qui gère :
 *  - L'appel à l'API Laravel pour récupérer un médicament par code-barres
 *  - L'ajout / l'incrémentation dans le panier (cart)
 *
 * Usage dans VentesList (ou tout autre composant POS) :
 *
 *   const {
 *     isScannerOpen, openScanner, closeScanner,
 *     handleBarcodeScan,
 *     scanLoading, scanError, scanSuccess,
 *   } = useBarcodeCart({ cart, setCart });
 */
const useBarcodeCart = ({ cart, setCart }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError]   = useState('');
  const [scanSuccess, setScanSuccess] = useState('');

  const openScanner  = useCallback(() => setIsScannerOpen(true),  []);
  const closeScanner = useCallback(() => setIsScannerOpen(false), []);

  /**
   * Appelé par <BarcodeScanner onDetected={handleBarcodeScan} />
   * 1. Appel GET /api/medicaments/scan/{barcode}
   * 2. Si trouvé → ajout au panier ou incrémentation quantité
   */
  const handleBarcodeScan = useCallback(
    async (barcode) => {
      if (!barcode) return;

      setScanLoading(true);
      setScanError('');
      setScanSuccess('');

      try {
        const response = await api.get(`/medicaments/scan/${encodeURIComponent(barcode)}`);
        const { medicine, out_of_stock } = response.data;

        if (out_of_stock) {
          setScanError(`"${medicine.nom}" est en rupture de stock.`);
          return;
        }

        setCart((prevCart) => {
          const existingIndex = prevCart.findIndex((item) => item.id === medicine.id);

          if (existingIndex !== -1) {
            // Produit déjà dans le panier → incrémenter quantité
            const updatedCart = [...prevCart];
            const existing = updatedCart[existingIndex];
            const newQty = existing.quantite + 1;

            if (newQty > medicine.stock) {
              // Stock insuffisant pour cette quantité
              setScanError(`Stock insuffisant pour "${medicine.nom}" (stock : ${medicine.stock}).`);
              return prevCart; // Pas de modification
            }

            updatedCart[existingIndex] = { ...existing, quantite: newQty };
            setScanSuccess(`"${medicine.nom}" → quantité : ${newQty}`);
            return updatedCart;
          } else {
            // Nouveau produit → l'ajouter
            setScanSuccess(`"${medicine.nom}" ajouté au panier.`);
            return [
              ...prevCart,
              {
                id:       medicine.id,
                nom:      medicine.nom,
                code:     medicine.code,
                prix:     parseFloat(medicine.prix),
                stock:    medicine.stock,
                quantite: 1,
                // Champs optionnels utiles pour l'affichage
                image_url: medicine.image_url ?? null,
                ordonnance: medicine.ordonnance ?? false,
              },
            ];
          }
        });

        // Effacer le message de succès après 3 s
        setTimeout(() => setScanSuccess(''), 3000);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          `Produit introuvable pour le code-barres "${barcode}".`;
        setScanError(msg);
        setTimeout(() => setScanError(''), 4000);
      } finally {
        setScanLoading(false);
      }
    },
    [setCart]
  );

  return {
    isScannerOpen,
    openScanner,
    closeScanner,
    handleBarcodeScan,
    scanLoading,
    scanError,
    scanSuccess,
  };
};

export default useBarcodeCart;
