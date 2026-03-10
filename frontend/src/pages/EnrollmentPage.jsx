import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { resolveImageUrl } from '../lib/imageUtils';
import { useToast } from '../hooks/use-toast';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  User, MapPin, Monitor, Mail, Phone, CreditCard, Lock,
  ChevronRight, ChevronLeft, Check, ShieldAlert, ShieldCheck, AlertTriangle, Loader2
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
const RELATIONSHIPS = ["Single", "Married", "In a Relationship", "Divorced", "Widowed", "Other"];

const StepIndicator = ({ current, steps }) => (
  <div className="flex items-center justify-center mb-10" data-testid="step-indicator">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            i < current ? 'bg-green-500 text-white' :
            i === current ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30' :
            'bg-gray-200 text-gray-400'
          }`}>
            {i < current ? <Check size={18} /> : i + 1}
          </div>
          <span className={`text-xs mt-1.5 ${i <= current ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{s}</span>
        </div>
        {i < steps.length - 1 && (
          <div className={`w-12 md:w-20 h-0.5 mx-1 mt-[-16px] transition-all duration-300 ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

function EnrollmentPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [vpnDetected, setVpnDetected] = useState(false);
  const [pricing, setPricing] = useState(null);

  // Step 1: Profile
  const [profile, setProfile] = useState({ name: '', relationship: '', age: '', gender: '', country: 'AE' });

  // Step 2: Attendance
  const [attendance, setAttendance] = useState('');
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Step 3: Contact
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [mockOtp, setMockOtp] = useState('');

  // Step 4: Billing
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id, type]);

  const loadItem = async () => {
    try {
      const endpoint = type === 'program' ? 'programs' : 'sessions';
      const res = await axios.get(`${API}/${endpoint}/${id}`);
      setItem(res.data);
    } catch { navigate('/'); }
  };

  // Update country code when country changes
  useEffect(() => {
    const c = COUNTRIES.find(c => c.code === profile.country);
    if (c) setCountryCode(c.phone);
  }, [profile.country]);

  // ─── Step 1: Submit Profile ───
  const submitProfile = async () => {
    if (!profile.name.trim()) return toast({ title: 'Please enter your name', variant: 'destructive' });
    if (!profile.relationship) return toast({ title: 'Please select relationship status', variant: 'destructive' });
    if (!profile.age || profile.age < 10 || profile.age > 120) return toast({ title: 'Please enter a valid age', variant: 'destructive' });
    if (!profile.gender) return toast({ title: 'Please select gender', variant: 'destructive' });

    setLoading(true);
    try {
      const res = await axios.post(`${API}/enrollment/start`, {
        ...profile, age: parseInt(profile.age),
      });
      setEnrollmentId(res.data.enrollment_id);
      setVpnDetected(res.data.vpn_detected);
      if (res.data.vpn_detected) {
        toast({ title: 'VPN/Proxy Detected', description: 'Your pricing will be in AED.', variant: 'destructive' });
      }
      setStep(1);
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.detail || 'Failed to save profile', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ─── Step 2: Submit Attendance ───
  const submitAttendance = async () => {
    if (!attendance) return toast({ title: 'Please select attendance mode', variant: 'destructive' });

    setLoading(true);
    try {
      const res = await axios.put(`${API}/enrollment/${enrollmentId}/attendance`, { mode: attendance });
      if (attendance === 'offline' && res.data.offline_info) {
        setShowOfflineModal(true);
      } else {
        setStep(2);
      }
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.detail || 'Failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ─── Step 3a: Validate Email ───
  const validateEmail = async () => {
    if (!email.trim()) return toast({ title: 'Please enter your email', variant: 'destructive' });
    setLoading(true);
    try {
      await axios.post(`${API}/enrollment/${enrollmentId}/validate-email`, { email });
      setEmailVerified(true);
      toast({ title: 'Email verified!' });
    } catch (err) {
      toast({ title: 'Invalid Email', description: err.response?.data?.detail || 'Check your email', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ─── Step 3b: Send OTP ───
  const sendOtp = async () => {
    if (!phone.trim() || phone.length < 7) return toast({ title: 'Enter a valid phone number', variant: 'destructive' });
    setLoading(true);
    try {
      const res = await axios.post(`${API}/enrollment/${enrollmentId}/send-otp`, { phone, country_code: countryCode });
      setOtpSent(true);
      if (res.data.mock_otp) setMockOtp(res.data.mock_otp);
      toast({ title: 'OTP Sent', description: `Check your phone ${res.data.phone}` });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.detail || 'Failed to send OTP', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ─── Step 3b: Verify OTP ───
  const verifyOtp = async () => {
    if (otp.length !== 6) return toast({ title: 'Enter 6-digit OTP', variant: 'destructive' });
    setLoading(true);
    try {
      await axios.post(`${API}/enrollment/${enrollmentId}/verify-otp`, { phone, country_code: countryCode, otp });
      setPhoneVerified(true);
      toast({ title: 'Phone verified!' });
      // Load pricing
      const pricingRes = await axios.get(`${API}/enrollment/${enrollmentId}/pricing?item_type=${type}&item_id=${id}`);
      setPricing(pricingRes.data);
      setStep(3);
    } catch (err) {
      toast({ title: 'Verification Failed', description: err.response?.data?.detail || 'Wrong OTP', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ─── Step 4: Checkout ───
  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`${API}/enrollment/${enrollmentId}/checkout`, {
        enrollment_id: enrollmentId,
        item_type: type,
        item_id: id,
        currency: pricing.pricing.currency,
      });
      window.location.href = res.data.url;
    } catch (err) {
      toast({ title: 'Payment Error', description: err.response?.data?.detail || 'Please try again', variant: 'destructive' });
      setProcessing(false);
    }
  };

  if (!item) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={32} /></div>;

  const stepNames = ['Profile', 'Attendance', 'Verify', 'Payment'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Item Header */}
          <div className="text-center mb-8">
            <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-2">{type === 'program' ? 'Program Enrollment' : 'Session Booking'}</p>
            <h1 data-testid="enrollment-title" className="text-2xl md:text-3xl text-gray-900 mb-2">{item.title}</h1>
          </div>

          <StepIndicator current={step} steps={stepNames} />

          <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
            {/* VPN Warning Banner */}
            {vpnDetected && (
              <div data-testid="vpn-warning" className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <ShieldAlert size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-semibold">VPN / Proxy Detected</p>
                  <p className="text-red-600 text-xs mt-1">Regional pricing is unavailable. You will be charged the standard AED rate. Please disable your VPN and try again for local pricing.</p>
                </div>
              </div>
            )}

            {/* ═══ STEP 1: PROFILE ═══ */}
            {step === 0 && (
              <div data-testid="step-profile">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <User size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
                    <p className="text-xs text-gray-500">Tell us about yourself</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Full Name *</label>
                    <Input data-testid="enroll-name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Enter your full name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Age *</label>
                      <Input data-testid="enroll-age" type="number" min="10" max="120" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} placeholder="Age" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Gender *</label>
                      <select data-testid="enroll-gender" value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">Select...</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Relationship Status *</label>
                    <select data-testid="enroll-relationship" value={profile.relationship} onChange={e => setProfile({...profile, relationship: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select...</option>
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Country (where you currently live) *</label>
                    <select data-testid="enroll-country" value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <Button data-testid="step1-next" onClick={submitProfile} disabled={loading} className="w-full mt-6 bg-[#D4AF37] hover:bg-[#b8962e] text-white py-3 rounded-full">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><span>Continue</span> <ChevronRight size={18} /></>}
                </Button>
              </div>
            )}

            {/* ═══ STEP 2: ATTENDANCE MODE ═══ */}
            {step === 1 && (
              <div data-testid="step-attendance">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <Monitor size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Attendance Mode</h2>
                    <p className="text-xs text-gray-500">How would you like to attend?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    data-testid="mode-online"
                    onClick={() => setAttendance('online')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-center ${
                      attendance === 'online' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Monitor size={32} className={`mx-auto mb-3 ${attendance === 'online' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900 text-sm">Online</p>
                    <p className="text-xs text-gray-500 mt-1">Attend from anywhere</p>
                  </button>
                  <button
                    data-testid="mode-offline"
                    onClick={() => setAttendance('offline')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-center ${
                      attendance === 'offline' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MapPin size={32} className={`mx-auto mb-3 ${attendance === 'offline' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900 text-sm">In-Person</p>
                    <p className="text-xs text-gray-500 mt-1">Attend at the studio</p>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-full">
                    <ChevronLeft size={18} /> Back
                  </Button>
                  <Button data-testid="step2-next" onClick={submitAttendance} disabled={loading || !attendance} className="flex-1 bg-[#D4AF37] hover:bg-[#b8962e] text-white rounded-full">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><span>Continue</span> <ChevronRight size={18} /></>}
                  </Button>
                </div>

                {/* Offline Location Modal */}
                {showOfflineModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" data-testid="offline-modal">
                      <div className="text-center mb-6">
                        <MapPin size={40} className="mx-auto text-[#D4AF37] mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900">In-Person Attendance</h3>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                        <p className="text-sm"><strong>Venue:</strong> Divine Iris Soulful Healing Studio</p>
                        <p className="text-sm"><strong>Location:</strong> Dubai, UAE</p>
                        <p className="text-sm text-gray-600"><strong>Note:</strong> Please arrive 15 minutes early. Comfortable clothing recommended.</p>
                      </div>
                      <Button data-testid="offline-modal-confirm" onClick={() => { setShowOfflineModal(false); setStep(2); }} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white rounded-full">
                        I Understand, Continue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ STEP 3: CONTACT VERIFICATION ═══ */}
            {step === 2 && (
              <div data-testid="step-contact">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <ShieldCheck size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Contact Verification</h2>
                    <p className="text-xs text-gray-500">Verify your email and phone number</p>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-6 p-4 rounded-xl border bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={16} className={emailVerified ? 'text-green-500' : 'text-gray-400'} />
                    <span className="text-sm font-medium text-gray-700">Email Address</span>
                    {emailVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                  </div>
                  <div className="flex gap-2">
                    <Input data-testid="enroll-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" disabled={emailVerified} className="flex-1" />
                    {!emailVerified && (
                      <Button data-testid="verify-email-btn" onClick={validateEmail} disabled={loading} size="sm" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                        {loading ? <Loader2 className="animate-spin" size={14} /> : 'Verify'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-6 p-4 rounded-xl border bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone size={16} className={phoneVerified ? 'text-green-500' : 'text-gray-400'} />
                    <span className="text-sm font-medium text-gray-700">Phone Number</span>
                    {phoneVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                  </div>
                  {!phoneVerified && (
                    <>
                      <div className="flex gap-2 mb-3">
                        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-24">
                          {COUNTRIES.map(c => <option key={c.code} value={c.phone}>{c.phone} ({c.code})</option>)}
                        </select>
                        <Input data-testid="enroll-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Phone number" disabled={otpSent} className="flex-1" />
                        {!otpSent && (
                          <Button data-testid="send-otp-btn" onClick={sendOtp} disabled={loading || !emailVerified} size="sm" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Send OTP'}
                          </Button>
                        )}
                      </div>
                      {otpSent && (
                        <div>
                          <div className="flex gap-2">
                            <Input data-testid="enroll-otp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" maxLength={6} className="flex-1 text-center tracking-[0.5em] font-mono text-lg" />
                            <Button data-testid="verify-otp-btn" onClick={verifyOtp} disabled={loading || otp.length !== 6} size="sm" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                              {loading ? <Loader2 className="animate-spin" size={14} /> : 'Verify'}
                            </Button>
                          </div>
                          {mockOtp && (
                            <p data-testid="mock-otp-display" className="text-xs text-orange-500 mt-2 bg-orange-50 p-2 rounded text-center">
                              Test OTP: <strong className="font-mono">{mockOtp}</strong> (remove in production)
                            </p>
                          )}
                          <button onClick={() => { setOtpSent(false); setOtp(''); setMockOtp(''); }} className="text-xs text-[#D4AF37] mt-2 hover:underline">
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full">
                    <ChevronLeft size={18} /> Back
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ STEP 4: BILLING / PAYMENT ═══ */}
            {step === 3 && pricing && (
              <div data-testid="step-billing">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                    <CreditCard size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Complete Payment</h2>
                    <p className="text-xs text-gray-500">Review and pay</p>
                  </div>
                </div>

                {/* Security Status */}
                {pricing.security?.fraud_warning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2" data-testid="fraud-warning">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">{pricing.security.fraud_warning}</p>
                  </div>
                )}

                {pricing.security?.inr_eligible && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 flex items-start gap-2" data-testid="inr-eligible">
                    <ShieldCheck size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-800">India pricing verified. All checks passed.</p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6 border">
                  {item.image && (
                    <img src={resolveImageUrl(item.image)} alt={item.title} className="w-full h-36 object-cover rounded-lg mb-4" />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">{pricing.item.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{pricing.item.description}</p>

                  <div className="border-t pt-3 space-y-2">
                    {pricing.pricing.offer_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Original Price</span>
                        <span className="text-gray-400 line-through">{pricing.pricing.symbol}{pricing.pricing.price}</span>
                      </div>
                    )}
                    {pricing.pricing.offer_text && (
                      <div className="text-xs text-red-500 text-right font-medium">{pricing.pricing.offer_text}</div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-[#D4AF37]">{pricing.pricing.symbol}{pricing.pricing.final_price}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-right">Currency: {pricing.pricing.currency.toUpperCase()}</p>
                  </div>
                </div>

                {/* Enrollment Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border text-xs text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <p><strong>Phone:</strong> {countryCode}{phone}</p>
                  <p><strong>Mode:</strong> {attendance === 'online' ? 'Online' : 'In-Person'}</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-full">
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    data-testid="pay-now-btn"
                    onClick={handleCheckout}
                    disabled={processing}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#b8962e] text-white py-3 rounded-full"
                  >
                    {processing ? <><Loader2 className="animate-spin mr-2" size={16} /> Redirecting to Stripe...</> : <><Lock size={14} className="mr-2" /> Pay {pricing.pricing.symbol}{pricing.pricing.final_price}</>}
                  </Button>
                </div>

                <p className="text-xs text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
                  <Lock size={10} /> Secure payment powered by Stripe
                </p>
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
