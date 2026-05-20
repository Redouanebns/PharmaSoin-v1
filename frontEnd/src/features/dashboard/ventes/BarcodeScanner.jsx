import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

// ID unique du conteneur vidéo requis par html5-qrcode
const SCANNER_CONTAINER_ID = 'pharmasoin-barcode-scanner';

// Délai avant fermeture automatique après détection (ms)
const AUTO_CLOSE_DELAY = 1200;

// Formats de codes-barres supportés (médicaments utilisent principalement EAN-13)
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
];

const BarcodeScanner = ({ onDetected, onClose, isOpen }) => {
  const autoCloseRef = useRef(null); // timer de fermeture automatique
  const scannerRef    = useRef(null);   // instance Html5Qrcode
  const cooldownRef   = useRef(false);
  const mountedRef    = useRef(false);  // évite les appels sur composant démonté

  const [cameras, setCameras]               = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [error, setError]                   = useState('');
  const [lastCode, setLastCode]             = useState('');
  const [isScanning, setIsScanning]         = useState(false);
  const [loading, setLoading]               = useState(false);

  // ── Arrêt propre du scanner ────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    // Annuler le timer de fermeture automatique si présent
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.();
        // state 2 = SCANNING, state 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (_) {
        // Ignore les erreurs d'arrêt
      }
      scannerRef.current = null;
    }
    if (mountedRef.current) {
      setIsScanning(false);
      setLoading(false);
    }
  }, []);

  // ── Démarrage du scanner sur un deviceId ──────────────────────────────────
  const startScanner = useCallback(async (deviceId) => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError('');

    // Attendre que le DOM ait rendu le conteneur
    await new Promise((r) => setTimeout(r, 150));

    if (!document.getElementById(SCANNER_CONTAINER_ID)) {
      if (mountedRef.current) {
        setError('Conteneur vidéo introuvable, réessayez.');
        setLoading(false);
      }
      return;
    }

    try {
      const html5Qrcode = new Html5Qrcode(SCANNER_CONTAINER_ID, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      scannerRef.current = html5Qrcode;

      // Configuration optimisée pour la vitesse
      const config = {
        fps: 30, // 30 fps pour une détection beaucoup plus rapide
        aspectRatio: 1.777,
        disableFlip: false,
      };

      await html5Qrcode.start(
        deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
        config,
        // Succès
        (decodedText) => {
          if (!cooldownRef.current && mountedRef.current) {
            cooldownRef.current = true;
            setLastCode(decodedText);

            // 1. Notifier le parent IMMEDIATEMENT
            onDetected(decodedText);

            // 2. Mettre en pause le scanner pour éviter de chauffer la caméra
            try {
              if (scannerRef.current && scannerRef.current.getState?.() === 2) {
                scannerRef.current.pause();
              }
            } catch (e) {}

            // 3. Fermer le modal IMMÉDIATEMENT
            if (mountedRef.current) {
              onClose();
            }
          }
        },
        // Erreur frame (normal, ignorée)
        () => {}
      );

      if (mountedRef.current) {
        setIsScanning(true);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err?.message || String(err);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
          setError('Accès à la caméra refusé. Autorisez la caméra dans votre navigateur.');
        } else {
          setError('Impossible de démarrer la caméra : ' + msg);
        }
        setLoading(false);
        setIsScanning(false);
      }
    }
  }, [onDetected, onClose, stopScanner]);

  // ── Cycle de vie : ouverture / fermeture du modal ─────────────────────────
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setCameras([]);
      setSelectedCamera('');
      setError('');
      setLastCode('');
      return;
    }

    mountedRef.current  = true;
    cooldownRef.current = false;
    setLoading(true);
    setError('');

    // Énumérer les caméras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!mountedRef.current) return;
        if (!devices || devices.length === 0) {
          setError('Aucune caméra détectée sur cet appareil.');
          setLoading(false);
          return;
        }
        setCameras(devices);
        // Préférer la caméra arrière sur mobile, sinon la première
        const back = devices.find((d) => /back|rear|environment/i.test(d.label));
        const chosen = back ? back.id : devices[0].id;
        setSelectedCamera(chosen);
        startScanner(chosen);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        setError('Accès caméra refusé. Autorisez la caméra dans votre navigateur. (' + (err?.message || '') + ')');
        setLoading(false);
      });

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  // ── Changement de caméra ──────────────────────────────────────────────────
  const handleCameraChange = useCallback(async (e) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    setIsScanning(false);
    await stopScanner();
    startScanner(deviceId);
  }, [startScanner, stopScanner]);

  // ── Saisie manuelle ───────────────────────────────────────────────────────
  const handleManualSubmit = useCallback((e) => {
    e.preventDefault();
    const input = e.target.elements.manualCode;
    const code = input.value.trim();
    if (code) {
      onDetected(code);
      input.value = '';
    }
  }, [onDetected]);

  if (!isOpen) return null;

  return (
    <div className="barcode-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="barcode-modal">

        <div className="barcode-header">
          <span className="barcode-title">
            <i className="fas fa-barcode" /> Scan Code-Barres
          </span>
          <button className="barcode-close" onClick={onClose} type="button">
            <i className="fas fa-times" />
          </button>
        </div>

        {error && (
          <div className="barcode-error">
            <i className="fas fa-exclamation-triangle" /> {error}
          </div>
        )}

        {cameras.length > 1 && (
          <div className="barcode-camera-select">
            <label><i className="fas fa-video" /> Caméra :</label>
            <select value={selectedCamera} onChange={handleCameraChange}>
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || 'Caméra ' + cam.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="barcode-viewfinder">
          {loading && (
            <div className="barcode-loading">
              <i className="fas fa-spinner fa-spin" />
              <span>Démarrage de la caméra...</span>
            </div>
          )}

          {/* html5-qrcode gère lui-même le rendu vidéo dans ce div */}
          <div
            id={SCANNER_CONTAINER_ID}
            className="barcode-video"
            style={{ width: '100%' }}
          />

          {!loading && isScanning && (
            <>
              <div className="barcode-crosshair">
                <div className="corner top-left" />
                <div className="corner top-right" />
                <div className="corner bottom-left" />
                <div className="corner bottom-right" />
              </div>
              <div className="barcode-scan-line" />
            </>
          )}
        </div>

        {lastCode && (
          <div className="barcode-last-detected">
            <i className="fas fa-check-circle" /> Détecté : <strong>{lastCode}</strong>
          </div>
        )}

        <div className="barcode-manual">
          <span className="barcode-manual-label">Ou saisir manuellement :</span>
          <form onSubmit={handleManualSubmit} className="barcode-manual-form">
            <input
              type="text"
              name="manualCode"
              placeholder="Code-barres..."
              autoComplete="off"
              className="barcode-manual-input"
            />
            <button type="submit" className="barcode-manual-btn">
              <i className="fas fa-search" /> Chercher
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default BarcodeScanner;
