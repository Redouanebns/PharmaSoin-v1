import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onDetected, onClose, isOpen }) => {
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const cooldownRef = useRef(false);

  const [cameras, setCameras]               = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [error, setError]                   = useState('');
  const [lastCode, setLastCode]             = useState('');
  const [isScanning, setIsScanning]         = useState(false);
  const [loading, setLoading]               = useState(false);

  const startStream = useCallback((reader, deviceId) => {
    if (!videoRef.current) {
      setError('Élément vidéo non prêt, réessayez.');
      setLoading(false);
      return;
    }
    reader
      .decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        setLoading(false);
        setIsScanning(true);
        if (result) {
          const code = result.getText();
          if (!cooldownRef.current) {
            cooldownRef.current = true;
            setLastCode(code);
            onDetected(code);
            setTimeout(() => { cooldownRef.current = false; }, 2000);
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn('ZXing:', err?.message);
        }
      })
      .catch((e) => {
        setError('Impossible de démarrer la caméra : ' + (e?.message || 'Erreur inconnue'));
        setLoading(false);
        setIsScanning(false);
      });
  }, [onDetected]);

  // Ouverture / fermeture du modal
  useEffect(() => {
    if (!isOpen) {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
      setIsScanning(false);
      setLoading(false);
      setError('');
      setLastCode('');
      setCameras([]);
      setSelectedCamera('');
      return;
    }

    setLoading(true);
    setError('');
    cooldownRef.current = false;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .listVideoInputDevices()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          setError('Aucune caméra détectée sur cet appareil.');
          setLoading(false);
          return;
        }
        setCameras(devices);
        const back = devices.find((d) => /back|rear|environment/i.test(d.label));
        const deviceId = back ? back.deviceId : devices[0].deviceId;
        setSelectedCamera(deviceId);
        startStream(reader, deviceId);
      })
      .catch((e) => {
        setError('Accès caméra refusé. Autorisez la caméra dans votre navigateur. (' + (e?.message || '') + ')');
        setLoading(false);
      });

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
      setIsScanning(false);
    };
  }, [isOpen, startStream]);

  // Changement de caméra par l'utilisateur
  const handleCameraChange = useCallback((e) => {
    const deviceId = e.target.value;
    if (!readerRef.current) return;
    readerRef.current.reset();
    setIsScanning(false);
    setLoading(true);
    setSelectedCamera(deviceId);

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    startStream(reader, deviceId);
  }, [startStream]);

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
          <button className="barcode-close" onClick={onClose}>
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
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || 'Caméra ' + cam.deviceId.slice(0, 8)}
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
          <video
            ref={videoRef}
            className="barcode-video"
            autoPlay
            playsInline
            muted
          />
          <div className="barcode-crosshair">
            <div className="corner top-left" />
            <div className="corner top-right" />
            <div className="corner bottom-left" />
            <div className="corner bottom-right" />
          </div>
          {isScanning && <div className="barcode-scan-line" />}
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
