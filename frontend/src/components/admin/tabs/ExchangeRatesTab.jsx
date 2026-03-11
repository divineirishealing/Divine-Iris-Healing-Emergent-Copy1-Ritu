import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Save, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CURRENCY_NAMES = {
  gbp: 'British Pound', eur: 'Euro', cad: 'Canadian Dollar', aud: 'Australian Dollar',
  sgd: 'Singapore Dollar', jpy: 'Japanese Yen', sar: 'Saudi Riyal', qar: 'Qatari Riyal',
  pkr: 'Pakistani Rupee', bdt: 'Bangladeshi Taka', lkr: 'Sri Lankan Rupee', npr: 'Nepalese Rupee',
  myr: 'Malaysian Ringgit', zar: 'South African Rand', ngn: 'Nigerian Naira', kes: 'Kenyan Shilling',
  egp: 'Egyptian Pound', php: 'Philippine Peso', thb: 'Thai Baht', idr: 'Indonesian Rupiah',
  brl: 'Brazilian Real', mxn: 'Mexican Peso', try: 'Turkish Lira', cny: 'Chinese Yuan',
  hkd: 'Hong Kong Dollar', nzd: 'New Zealand Dollar', chf: 'Swiss Franc',
  sek: 'Swedish Krona', nok: 'Norwegian Krone', dkk: 'Danish Krone', pln: 'Polish Zloty',
  kwd: 'Kuwaiti Dinar', omr: 'Omani Rial', bhd: 'Bahraini Dinar', krw: 'South Korean Won',
};

const ExchangeRatesTab = () => {
  const { toast } = useToast();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRates(); }, []);

  const loadRates = async () => {
    try {
      const res = await axios.get(`${API}/currency/exchange-rates`);
      setRates(res.data.rates || {});
    } catch { toast({ title: 'Failed to load rates', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const saveRates = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/currency/exchange-rates`, { rates });
      toast({ title: 'Exchange rates saved!' });
    } catch { toast({ title: 'Failed to save', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const updateRate = (code, value) => {
    setRates(prev => ({ ...prev, [code]: parseFloat(value) || 0 }));
  };

  if (loading) return <p className="text-gray-500 text-sm p-4">Loading exchange rates...</p>;

  const sortedCodes = Object.keys(rates).sort((a, b) => (CURRENCY_NAMES[a] || a).localeCompare(CURRENCY_NAMES[b] || b));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Fixed Exchange Rates</h3>
          <p className="text-xs text-gray-500">Base: 1 AED = X local currency. INR/USD have separate prices set per program.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={loadRates} data-testid="rates-reload"><RefreshCw size={14} /></Button>
          <Button size="sm" onClick={saveRates} disabled={saving} data-testid="rates-save" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
            <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Currency</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Code</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">1 AED =</th>
            </tr>
          </thead>
          <tbody>
            {sortedCodes.map(code => (
              <tr key={code} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-700">{CURRENCY_NAMES[code] || code}</td>
                <td className="px-3 py-2 text-gray-500 uppercase">{code}</td>
                <td className="px-3 py-2">
                  <Input
                    data-testid={`rate-${code}`}
                    type="number" step="0.001" min="0"
                    value={rates[code] || 0}
                    onChange={e => updateRate(code, e.target.value)}
                    className="w-28 text-xs h-8"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExchangeRatesTab;
