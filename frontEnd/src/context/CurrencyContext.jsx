import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CurrencyContext = createContext(null);
const STORAGE_KEY = 'pharmacy_currency';

const fallbackCurrencies = [
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', is_default: true, is_active: true },
  { code: 'EUR', symbol: '€', name: 'Euro', is_default: false, is_active: true },
  { code: 'USD', symbol: '$', name: 'US Dollar', is_default: false, is_active: true },
];

const fallbackRates = {
  MAD: 1,
  EUR: 0.092,
  USD: 0.1,
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState(localStorage.getItem(STORAGE_KEY) || 'MAD');
  const [currencies, setCurrencies] = useState(fallbackCurrencies);
  const [rates, setRates] = useState(fallbackRates);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const [currenciesResponse, ratesResponse] = await Promise.all([
          api.get('/currencies'),
          api.get('/exchange-rates'),
        ]);

        if (Array.isArray(currenciesResponse.data) && currenciesResponse.data.length > 0) {
          setCurrencies(currenciesResponse.data);
        }

        if (Array.isArray(ratesResponse.data) && ratesResponse.data.length > 0) {
          const mappedRates = { MAD: 1 };
          ratesResponse.data.forEach((item) => {
            if (item.baseCurrency?.code === 'MAD' && item.targetCurrency?.code) {
              mappedRates[item.targetCurrency.code] = Number(item.rate);
            }
          });
          setRates((prev) => ({ ...prev, ...mappedRates }));
        }
      } catch (error) {
        console.warn('Impossible de charger les devises/taux depuis le backend.', error);
      }
    };

    loadCurrencies();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentCurrency);
  }, [currentCurrency]);

  const convertFromMAD = (amount) => {
    const numericAmount = Number(amount || 0);
    const rate = rates[currentCurrency] || 1;
    return Number((numericAmount * rate).toFixed(2));
  };

  const getCurrencyMeta = (code = currentCurrency) => currencies.find((currency) => currency.code === code) || fallbackCurrencies[0];

  const formatPrice = (amount, options = {}) => {
    const convertedAmount = options.skipConversion ? Number(amount || 0) : convertFromMAD(amount);
    const currencyMeta = getCurrencyMeta(options.currencyCode || currentCurrency);
    const locale = document?.documentElement?.lang || 'fr';

    try {
      return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : locale === 'en' ? 'en-US' : 'fr-FR', {
        style: 'currency',
        currency: currencyMeta.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    } catch (error) {
      return `${convertedAmount.toFixed(2)} ${currencyMeta.symbol}`;
    }
  };

  const value = useMemo(
    () => ({
      currentCurrency,
      setCurrency: setCurrentCurrency,
      currencies,
      rates,
      convertFromMAD,
      formatPrice,
      getCurrencyMeta,
    }),
    [currentCurrency, currencies, rates],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
