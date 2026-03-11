import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../hooks/use-toast';
import { useCurrency } from '../context/CurrencyContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  User, Monitor, Wifi, Mail, Phone, CreditCard, Lock, Plus, Trash2,
  ChevronRight, ChevronLeft, Check, ShieldAlert, ShieldCheck, AlertTriangle,
  Loader2, Bell, BellOff, Tag, ShoppingCart
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COUNTRIES = [
  { code: "IN", name: "India", phone: "+91" },
  { code: "AE", name: "United Arab Emirates", phone: "+971" },
  { code: "US", name: "United States", phone: "+1" },
  { code: "GB", name: "United Kingdom", phone: "+44" },
  { code: "CA", name: "Canada", phone: "+1" },
  { code: "AU", name: "Australia", phone: "+61" },
  { code: "SG", name: "Singapore", phone: "+65" },
  { code: "DE", name: "Germany", phone: "+49" },
  { code: "FR", name: "France", phone: "+33" },
  { code: "SA", name: "Saudi Arabia", phone: "+966" },
  { code: "QA", name: "Qatar", phone: "+974" },
  { code: "KW", name: "Kuwait", phone: "+965" },
  { code: "OM", name: "Oman", phone: "+968" },
  { code: "BH", name: "Bahrain", phone: "+973" },
  { code: "PK", name: "Pakistan", phone: "+92" },
  { code: "BD", name: "Bangladesh", phone: "+880" },
  { code: "LK", name: "Sri Lanka", phone: "+94" },
  { code: "NP", name: "Nepal", phone: "+977" },
  { code: "MY", name: "Malaysia", phone: "+60" },
  { code: "JP", name: "Japan", phone: "+81" },
  { code: "ZA", name: "South Africa", phone: "+27" },
  { code: "NG", name: "Nigeria", phone: "+234" },
  { code: "KE", name: "Kenya", phone: "+254" },
].sort((a, b) => a.name.localeCompare(b.name));

const GENDERS = ["Female", "Male", "Non-Binary", "Prefer not to say"];
const RELATIONSHIPS = ["Myself", "Mother", "Father", "Sister", "Brother", "Spouse", "Husband", "Wife", "Friend", "Colleague", "Other"];

const emptyParticipant = () => ({
  name: '', relationship: '', age: '', gender: '',
  country: 'AE', attendance_mode: 'online', notify: false, email: '', phone: ''
});

const StepIndicator = ({ current, steps }) => (
  <div className="flex items-center justify-center mb-8" data-testid="step-indicator">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            i < current ? 'bg-green-500 text-white' :
            i === current ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30' :
            'bg-gray-200 text-gray-400'
          }`}>
            {i < current ? <Check size={16} /> : i + 1}
          </div>
          <span className={`text-[10px] mt-1 ${i <= current ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{s}</span>
        </div>
        {i < steps.length - 1 && (
          <div className={`w-8 md:w-14 h-0.5 mx-1 mt-[-14px] ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const ParticipantForm = ({ index, data, onChange, onRemove, canRemove }) => {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const countryPhone = COUNTRIES.find(c => c.code === data.country)?.phone || '+971';

  return (
    <div className="border rounded-xl p-4 mb-3 bg-gray-50 relative" data-testid={`participant-${index}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#D4AF37]">Participant {index + 1}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors" data-testid={`remove-participant-${index}`}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="mb-3">
        <label className="text-[10px] text-gray-500 mb-0.5 block">Full Name *</label>
        <Input data-testid={`p-name-${index}`} value={data.name} onChange={e => update('name', e.target.value)} placeholder="Full name" className="text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Relationship *</label>
          <select data-testid={`p-relation-${index}`} value={data.relationship} onChange={e => update('relationship', e.target.value)} className="w-full border rounded-md px-2 py-2 text-sm bg-white">
            <option value="">Select...</option>
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Age *</label>
          <Input data-testid={`p-age-${index}`} type="number" min="5" max="120" value={data.age} onChange={e => update('age', e.target.value)} placeholder="Age" className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Gender *</label>
          <select data-testid={`p-gender-${index}`} value={data.gender} onChange={e => update('gender', e.target.value)} className="w-full border rounded-md px-2 py-2 text-sm bg-white">
            <option value="">Select...</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 mb-0.5 block">Country *</label>
          <select data-testid={`p-country-${index}`} value={data.country} onChange={e => update('country', e.target.value)} className="w-full border rounded-md px-2 py-2 text-sm bg-white">
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] text-gray-500 mb-1 block">Session Mode *</label>
        <div className="grid grid-cols-2 gap-2">
          <button data-testid={`p-mode-online-${index}`} type="button" onClick={() => update('attendance_mode', 'online')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
              data.attendance_mode === 'online'
                ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37] font-semibold'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            <Monitor size={14} /> Online (Zoom)
          </button>
          <button data-testid={`p-mode-offline-${index}`} type="button" onClick={() => update('attendance_mode', 'offline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
              data.attendance_mode === 'offline'
                ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37] font-semibold'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            <Wifi size={14} /> Remote Healing
          </button>
        </div>
      </div>

      <div className="border-t pt-3">
        <label className="flex items-center gap-2 cursor-pointer group" data-testid={`p-notify-toggle-${index}`}>
          <input type="checkbox" checked={data.notify} onChange={e => update('notify', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
          <span className="text-xs text-gray-600 group-hover:text-gray-800 flex items-center gap-1">
            {data.notify ? <Bell size={12} className="text-[#D4AF37]" /> : <BellOff size={12} className="text-gray-400" />}
            Send session info to this participant
          </span>
        </label>
        {data.notify && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block">Email</label>
              <Input data-testid={`p-email-${index}`} type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="Email address" className="text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block">Phone ({countryPhone})</label>
              <Input data-testid={`p-phone-${index}`} type="tel" value={data.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))} placeholder="Phone number" className="text-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function EnrollmentPage() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPrice, getOfferPrice, symbol, currency, country: detectedCountry } = useCurrency();

  const tierParam = searchParams.get('tier');
  const selectedTier = tierParam !== null ? parseInt(tierParam) : null;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [vpnDetected, setVpnDetected] = useState(false);

  // Step 0: Participants
  const [participants, setParticipants] = useState([emptyParticipant()]);

  // Step 1: Review & Promo
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Step 2: Booker & Verify
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [bookerCountry, setBookerCountry] = useState(detectedCountry || 'AE');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [mockOtp, setMockOtp] = useState('');

  // Step 3: Pay
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const ep = type === 'program' ? 'programs' : 'sessions';
    axios.get(`${API}/${ep}/${id}`).then(r => setItem(r.data)).catch(() => navigate('/'));
  }, [id, type, navigate]);

  useEffect(() => {
    if (detectedCountry) {
      setBookerCountry(detectedCountry);
      const c = COUNTRIES.find(c => c.code === detectedCountry);
      if (c) setCountryCode(c.phone);
    }
  }, [detectedCountry]);

  useEffect(() => {
    const c = COUNTRIES.find(c => c.code === bookerCountry);
    if (c) setCountryCode(c.phone);
  }, [bookerCountry]);

  // Price calculations
  const tiers = item?.duration_tiers || [];
  const hasTiers = item?.is_flagship && tiers.length > 0 && selectedTier !== null;
  const tierObj = hasTiers ? tiers[selectedTier] : null;
  const unitPrice = item ? getPrice(item, hasTiers ? selectedTier : null) : 0;
  const offerUnitPrice = item ? getOfferPrice(item, hasTiers ? selectedTier : null) : 0;
  const effectiveUnitPrice = offerUnitPrice > 0 ? offerUnitPrice : unitPrice;
  const participantCount = participants.length;

  const calculateDiscount = () => {
    if (!promoResult) return 0;
    const subtotal = effectiveUnitPrice * participantCount;
    if (promoResult.discount_type === 'percentage') {
      return Math.round(subtotal * promoResult.discount_percentage / 100);
    }
    // Fixed discount - use the right currency field
    const key = `discount_${currency}`;
    return promoResult[key] || promoResult.discount_aed || 0;
  };

  const discount = calculateDiscount();
  const subtotal = effectiveUnitPrice * participantCount;
  const total = Math.max(0, subtotal - discount);

  const updateParticipant = (index, data) => {
    const updated = [...participants];
    updated[index] = data;
    setParticipants(updated);
  };

  const addParticipant = () => setParticipants([...participants, emptyParticipant()]);
  const removeParticipant = (index) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  // Validate promo code
  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await axios.post(`${API}/promotions/validate`, {
        code: promoCode.trim(), program_id: id, currency,
      });
      setPromoResult(res.data);
      toast({ title: res.data.message });
    } catch (err) {
      setPromoResult(null);
      toast({ title: 'Invalid Code', description: err.response?.data?.detail || 'Code not valid', variant: 'destructive' });
    } finally { setPromoLoading(false); }
  };

  // Step 0 → Step 1: Validate participants
  const goToReview = () => {
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.name.trim()) return toast({ title: `Participant ${i + 1}: Enter name`, variant: 'destructive' });
      if (!p.relationship) return toast({ title: `Participant ${i + 1}: Select relationship`, variant: 'destructive' });
      if (!p.age || p.age < 5) return toast({ title: `Participant ${i + 1}: Enter valid age (5+)`, variant: 'destructive' });
      if (!p.gender) return toast({ title: `Participant ${i + 1}: Select gender`, variant: 'destructive' });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (p.notify && p.email && !emailRegex.test(p.email)) return toast({ title: `Participant ${i + 1}: Invalid email`, variant: 'destructive' });
    }
    setStep(1);
  };

  // Step 1 → Step 2
  const goToBilling = () => setStep(2);

  // Step 2: Submit booker + verify phone → create enrollment
  const submitBookerAndSendOtp = async () => {
    if (!bookerName.trim()) return toast({ title: 'Enter your name', variant: 'destructive' });
    if (!bookerEmail.trim()) return toast({ title: 'Enter your email', variant: 'destructive' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookerEmail)) return toast({ title: 'Enter a valid email', variant: 'destructive' });
    if (!phone.trim() || phone.length < 7) return toast({ title: 'Enter valid phone number', variant: 'destructive' });

    setLoading(true);
    try {
      // Create enrollment
      const enrollRes = await axios.post(`${API}/enrollment/start`, {
        booker_name: bookerName, booker_email: bookerEmail, booker_country: bookerCountry,
        participants: participants.map(p => ({
          name: p.name, relationship: p.relationship, age: parseInt(p.age),
          gender: p.gender, country: p.country, attendance_mode: p.attendance_mode,
          notify: p.notify, email: p.notify ? p.email : null, phone: p.notify ? p.phone : null,
        })),
      });
      setEnrollmentId(enrollRes.data.enrollment_id);
      setVpnDetected(enrollRes.data.vpn_detected);
      if (enrollRes.data.vpn_detected) {
        toast({ title: 'VPN/Proxy Detected', description: 'Regional pricing may not apply.', variant: 'destructive' });
      }

      // Send OTP
      const otpRes = await axios.post(`${API}/enrollment/${enrollRes.data.enrollment_id}/send-otp`, { phone, country_code: countryCode });
      setOtpSent(true);
      if (otpRes.data.mock_otp) setMockOtp(otpRes.data.mock_otp);
      toast({ title: 'OTP Sent!', description: `Check ${otpRes.data.phone}` });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.detail || 'Failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) return toast({ title: 'Enter 6-digit OTP', variant: 'destructive' });
    setLoading(true);
    try {
      await axios.post(`${API}/enrollment/${enrollmentId}/verify-otp`, { phone, country_code: countryCode, otp });
      setPhoneVerified(true);
      toast({ title: 'Phone verified!' });
      setStep(3);
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.detail || 'Wrong OTP', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // Step 3: Checkout
  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`${API}/enrollment/${enrollmentId}/checkout`, {
        enrollment_id: enrollmentId, item_type: type, item_id: id, currency,
        origin_url: window.location.origin,
        promo_code: promoResult?.code || null,
      });
      window.location.href = res.data.url;
    } catch (err) {
      toast({ title: 'Payment Error', description: err.response?.data?.detail || 'Try again', variant: 'destructive' });
      setProcessing(false);
    }
  };

  if (!item) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">

          <div className="text-center mb-6">
            <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-1">{type === 'program' ? 'Program Enrollment' : 'Session Booking'}</p>
            <h1 data-testid="enrollment-title" className="text-2xl md:text-3xl text-gray-900">{item.title}</h1>
            {tierObj && <p className="text-sm text-gray-500 mt-1">Duration: {tierObj.label}</p>}
          </div>

          <StepIndicator current={step} steps={['Participants', 'Review', 'Billing', 'Pay']} />

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

            {/* STEP 0: PARTICIPANTS */}
            {step === 0 && (
              <div data-testid="step-participants">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><User size={18} className="text-[#D4AF37]" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Who is participating?</h2>
                    <p className="text-xs text-gray-500">Add details for everyone being enrolled</p>
                  </div>
                </div>

                {participants.map((p, i) => (
                  <ParticipantForm key={i} index={i} data={p} onChange={d => updateParticipant(i, d)} onRemove={() => removeParticipant(i)} canRemove={participants.length > 1} />
                ))}
                <button data-testid="add-participant-btn" onClick={addParticipant}
                  className="w-full border-2 border-dashed border-[#D4AF37]/40 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors mb-4">
                  <Plus size={16} /> Add Another Person
                </button>

                <Button data-testid="step0-next" onClick={goToReview} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white py-3 rounded-full">
                  <span>Review Cart ({participantCount} participant{participantCount > 1 ? 's' : ''})</span> <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            )}

            {/* STEP 1: REVIEW CART + PROMO */}
            {step === 1 && (
              <div data-testid="step-review">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><ShoppingCart size={18} className="text-[#D4AF37]" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Your Cart</h2>
                    <p className="text-xs text-gray-500">Review what you've chosen</p>
                  </div>
                </div>

                {/* Cart summary */}
                <div className="bg-gray-50 rounded-xl p-5 mb-5 border">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
                  {tierObj && <p className="text-xs text-[#D4AF37] mb-3">Duration: {tierObj.label}</p>}

                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Participants ({participantCount})</p>
                    {participants.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-gray-600 py-1.5 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400 ml-1">({p.relationship})</span>
                          <span className={`ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
                            p.attendance_mode === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {p.attendance_mode === 'online' ? <Monitor size={9} /> : <Wifi size={9} />}
                            {p.attendance_mode === 'online' ? 'Zoom' : 'Remote'}
                          </span>
                        </div>
                        <span>{symbol} {effectiveUnitPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div className="border-t mt-3 pt-3">
                    <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1"><Tag size={12} /> Promo Code</label>
                    <div className="flex gap-2 mt-1">
                      <Input data-testid="promo-code-input" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code" className="text-sm flex-1" disabled={!!promoResult} />
                      {promoResult ? (
                        <Button size="sm" variant="outline" onClick={() => { setPromoResult(null); setPromoCode(''); }}
                          data-testid="promo-remove-btn" className="text-xs">Remove</Button>
                      ) : (
                        <Button size="sm" onClick={validatePromo} disabled={promoLoading || !promoCode.trim()}
                          data-testid="promo-apply-btn" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white text-xs">
                          {promoLoading ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                        </Button>
                      )}
                    </div>
                    {promoResult && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span className="text-xs text-green-700">{promoResult.message} &mdash; Saving {symbol} {discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t mt-3 pt-3 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal ({participantCount} x {symbol} {effectiveUnitPrice.toLocaleString()})</span>
                      <span>{symbol} {subtotal.toLocaleString()}</span>
                    </div>
                    {offerUnitPrice > 0 && (
                      <div className="flex justify-between text-xs text-red-500">
                        <span>Offer discount</span>
                        <span>-{symbol} {((unitPrice - offerUnitPrice) * participantCount).toLocaleString()}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>Promo ({promoResult.code})</span>
                        <span>-{symbol} {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-[#D4AF37]">{symbol} {total.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">{currency.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="rounded-full"><ChevronLeft size={18} /> Back</Button>
                  <Button data-testid="step1-next" onClick={goToBilling} className="flex-1 bg-[#D4AF37] hover:bg-[#b8962e] text-white py-3 rounded-full">
                    <span>Proceed to Billing</span> <ChevronRight size={18} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: BOOKER & PHONE VERIFY */}
            {step === 2 && (
              <div data-testid="step-billing">
                {vpnDetected && (
                  <div data-testid="vpn-warning" className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-start gap-2">
                    <ShieldAlert size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 text-sm font-semibold">VPN / Proxy Detected</p>
                      <p className="text-red-600 text-xs">Regional pricing unavailable. Standard AED rate applies.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#D4AF37]/10 rounded-full flex items-center justify-center"><CreditCard size={18} className="text-[#D4AF37]" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Billing Details</h2>
                    <p className="text-xs text-gray-500">Your contact info for confirmation</p>
                  </div>
                </div>

                <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-gray-500 mb-0.5 block">Your Name *</label>
                      <Input data-testid="booker-name" value={bookerName} onChange={e => setBookerName(e.target.value)} placeholder="Your full name" className="text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-0.5 block">Your Email *</label>
                      <Input data-testid="booker-email" type="email" value={bookerEmail} onChange={e => setBookerEmail(e.target.value)} placeholder="your@email.com" className="text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-gray-500 mb-0.5 block">Your Country *</label>
                      <select data-testid="booker-country" value={bookerCountry} onChange={e => setBookerCountry(e.target.value)} className="w-full border rounded-md px-2 py-2 text-sm bg-white">
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-0.5 block">Phone *</label>
                      <div className="flex gap-1">
                        <select data-testid="phone-country-code" value={countryCode} onChange={e => setCountryCode(e.target.value)} className="border rounded-md px-1 py-2 text-xs w-20 bg-white">
                          {COUNTRIES.map(c => <option key={c.code} value={c.phone}>{c.phone}</option>)}
                        </select>
                        <Input data-testid="enroll-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Phone" className="text-sm flex-1" disabled={otpSent} />
                      </div>
                    </div>
                  </div>
                </div>

                {!otpSent && !phoneVerified && (
                  <Button data-testid="send-otp-btn" onClick={submitBookerAndSendOtp} disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white py-3 rounded-full mb-3">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Phone size={16} className="mr-2" /> Verify & Continue</>}
                  </Button>
                )}

                {otpSent && !phoneVerified && (
                  <div className="border rounded-xl p-4 bg-gray-50 mb-4">
                    <p className="text-xs text-gray-600 mb-2">Enter the 6-digit OTP sent to {countryCode}{phone}</p>
                    <div className="flex gap-2">
                      <Input data-testid="enroll-otp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP" maxLength={6} className="flex-1 text-center tracking-[0.5em] font-mono text-lg" />
                      <Button data-testid="verify-otp-btn" onClick={verifyOtp} disabled={loading || otp.length !== 6} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                        {loading ? <Loader2 className="animate-spin" size={14} /> : 'Verify'}
                      </Button>
                    </div>
                    {mockOtp && (
                      <p data-testid="mock-otp-display" className="text-xs text-orange-500 mt-2 bg-orange-50 p-2 rounded text-center">
                        Test OTP: <strong className="font-mono">{mockOtp}</strong>
                      </p>
                    )}
                    <button onClick={() => { setOtpSent(false); setOtp(''); setMockOtp(''); }} className="text-xs text-[#D4AF37] mt-2 hover:underline">Resend OTP</button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-full"><ChevronLeft size={18} /> Back</Button>
                </div>
              </div>
            )}

            {/* STEP 3: FINAL PAYMENT */}
            {step === 3 && (
              <div data-testid="step-payment">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center"><ShieldCheck size={18} className="text-green-600" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Confirm & Pay</h2>
                    <p className="text-xs text-gray-500">Everything looks good. Complete your payment.</p>
                  </div>
                </div>

                {/* Final summary */}
                <div className="bg-gray-50 rounded-xl p-5 mb-5 border">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
                  {tierObj && <p className="text-xs text-[#D4AF37] mb-2">{tierObj.label}</p>}

                  <div className="border-t pt-3 mb-3">
                    {participants.map((p, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 py-1">
                        <span>{p.name} ({p.relationship})</span>
                        <span>{symbol} {effectiveUnitPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 py-1 border-t">
                      <span>Promo ({promoResult?.code})</span>
                      <span>-{symbol} {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg border-t pt-3 mt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[#D4AF37]">{symbol} {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 border text-xs text-gray-600 space-y-1">
                  <p><strong>Booked by:</strong> {bookerName}</p>
                  <p><strong>Email:</strong> {bookerEmail}</p>
                  <p><strong>Phone:</strong> {countryCode}{phone} <span className="text-green-600 text-[10px]">Verified</span></p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-full"><ChevronLeft size={18} /></Button>
                  <Button data-testid="pay-now-btn" onClick={handleCheckout} disabled={processing || total <= 0} className="flex-1 bg-[#D4AF37] hover:bg-[#b8962e] text-white py-3 rounded-full disabled:opacity-50">
                    {processing ? <><Loader2 className="animate-spin mr-2" size={16} /> Redirecting...</> : <><Lock size={14} className="mr-2" /> Pay {symbol} {total.toLocaleString()}</>}
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center flex items-center justify-center gap-1"><Lock size={10} /> Secure payment via Stripe</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EnrollmentPage;
