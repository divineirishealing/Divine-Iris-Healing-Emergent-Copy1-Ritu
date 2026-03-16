import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CurrencyContext = createContext(null);

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('aed');
  const [symbol, setSymbol] = useState('AED');
  const [country, setCountry] = useState('AE');
  const [rate, setRate] = useState(1.0);
  const [isPrimary, setIsPrimary] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    detectCurrency();
  }, []);

  const detectCurrency = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const previewCountry = urlParams.get('preview_country');
      const url = previewCountry ? `${API}/currency/detect?preview_country=${previewCountry}` : `${API}/currency/detect`;
      const response = await axios.get(url);
      const d = response.data;
      setCurrency(d.currency);
      setSymbol(d.symbol);
      setCountry(d.country);
      setRate(d.rate);
      setIsPrimary(d.is_primary);
    } catch {
      setCurrency('aed');
      setSymbol('AED');
      setCountry('AE');
      setRate(1.0);
      setIsPrimary(true);
    } finally {
      setReady(true);
    }
  };

  const getPrice = (item, tierIndex = null) => {
    if (!item) return 0;
    const tiers = item.duration_tiers || [];
    const hasTiers = item.is_flagship && tiers.length > 0;
    const tier = hasTiers && tierIndex !== null ? tiers[tierIndex] : null;

    if (isPrimary) {
      const key = `price_${currency}`;
      if (tier) return tier[key] || 0;
      return item[key] || 0;
    }
    // Convert from AED for non-primary currencies
    const aedPrice = tier ? (tier.price_aed || 0) : (item.price_aed || 0);
    return Math.round(aedPrice * rate);
  };

  const getOfferPrice = (item, tierIndex = null) => {
    if (!item) return 0;
    const tiers = item.duration_tiers || [];
    const hasTiers = item.is_flagship && tiers.length > 0;
    const tier = hasTiers && tierIndex !== null ? tiers[tierIndex] : null;

    if (tier) {
      if (isPrimary) {
        const key = `offer_${currency}`;
        return tier[key] || 0;
      }
      return Math.round((tier.offer_aed || 0) * rate);
    }
    // Non-tier offer prices
    if (isPrimary) {
      if (currency === 'aed') return item.offer_price_aed || 0;
      if (currency === 'inr') return item.offer_price_inr || 0;
      if (currency === 'usd') return item.offer_price_usd || 0;
      return 0;
    }
    return 0;
  };

  const formatPrice = (amount) => {
    if (!amount || amount <= 0) return null;
    return `${symbol} ${amount.toLocaleString()}`;
  };

  const convertFromAed = (aedAmount) => {
    if (isPrimary && currency === 'aed') return aedAmount;
    if (isPrimary) return aedAmount; // For INR/USD, admin sets prices directly
    return Math.round(aedAmount * rate);
  };

  return (
    <CurrencyContext.Provider value={{
      currency, symbol, country, rate, isPrimary, ready,
      getPrice, getOfferPrice, formatPrice, convertFromAed,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
