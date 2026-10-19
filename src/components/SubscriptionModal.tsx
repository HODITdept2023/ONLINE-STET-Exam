import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Shield,
  FileCheck,
  Send,
  AlertCircle,
  GraduationCap,
  User,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { UserProfile, AdminPaymentConfig } from '../types';
import { getAdminPaymentConfig, saveClients, getAllClients, submitPaymentForm, isAdminUser } from '../utils/storage';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  initialStreamId?: string;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onNavigateToAdmin?: () => void;
}

export const STET_STREAMS = [
  {
    id: 'primary',
    name: 'Primary Teacher (Paper I)',
    level: 'Classes I - V',
    badge: 'Paper I',
    subtext: 'Child Development, Pedagogy, Maths, EVS, English & Regional Language',
  },
  {
    id: 'graduate-science',
    name: 'Graduate Teacher (Paper II) - Maths & Science',
    level: 'Classes VI - VIII',
    badge: 'Paper II (Sci/Math)',
    subtext: 'Child Development, Pedagogy, Mathematics, Science & Languages',
  },
  {
    id: 'graduate-social',
    name: 'Graduate Teacher (Paper II) - Social Studies',
    level: 'Classes VI - VIII',
    badge: 'Paper II (Social)',
    subtext: 'Child Development, Pedagogy, History, Geography, Civics & Languages',
  },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  initialStreamId,
  onOpenAuth,
  onNavigateToAdmin,
}) => {
  const [paymentConfig, setPaymentConfig] = useState<AdminPaymentConfig>(() => getAdminPaymentConfig());
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'upi'>('qr');
  const [selectedStreamId, setSelectedStreamId] = useState<string>('primary');
  
  // Candidate Form Details State (Autofilled!)
  const [candidateName, setCandidateName] = useState(userProfile.name || '');
  const [candidatePhone, setCandidatePhone] = useState(userProfile.phone || '');
  const [candidateEmail, setCandidateEmail] = useState(userProfile.email || '');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Self-report transaction state
  const [utrNumber, setUtrNumber] = useState('');
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  // Sync profile details when user profile changes
  useEffect(() => {
    if (userProfile.name && !candidateName) setCandidateName(userProfile.name);
    if (userProfile.phone && !candidatePhone) setCandidatePhone(userProfile.phone);
    if (userProfile.email && !candidateEmail) setCandidateEmail(userProfile.email);
  }, [userProfile]);

  // Synchronize stream with initialStreamId or current user exam track
  useEffect(() => {
    if (initialStreamId) {
      setSelectedStreamId(initialStreamId);
    } else if (userProfile.selectedExamTrack) {
      if (userProfile.selectedExamTrack === 'gt-maths-science') {
        setSelectedStreamId('graduate-science');
      } else if (userProfile.selectedExamTrack === 'gt-humanities') {
        setSelectedStreamId('graduate-social');
      } else {
        setSelectedStreamId('primary');
      }
    }
  }, [initialStreamId, userProfile.selectedExamTrack, isOpen]);

  // Sync payment config when updated by admin
  useEffect(() => {
    const handleConfigUpdate = () => {
      setPaymentConfig(getAdminPaymentConfig());
    };
    window.addEventListener('studeezone_payment_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('studeezone_payment_config_updated', handleConfigUpdate);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'upi' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const selectedStream = STET_STREAMS.find((s) => s.id === selectedStreamId) || STET_STREAMS[0];

  // Clean admin phone for WhatsApp link (normalize 10-digit Indian mobile numbers with 91)
  const rawPhone = (paymentConfig.adminPhone || '').replace(/[^\d]/g, '');
  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const effectiveName = candidateName.trim() || userProfile.name || 'Candidate';
  const effectiveEmail = candidateEmail.trim() || userProfile.email || 'Email provided in form';
  const effectivePhone = candidatePhone.trim() || userProfile.phone || 'Phone provided in form';

  const whatsappMessage = encodeURIComponent(
    `Hello Sabu Tamang (studeezone Admin)!\n\nI have submitted my payment details for STET Pro access:\n\n• Candidate Name: ${effectiveName}\n• Phone Number: ${effectivePhone}\n• Email ID: ${effectiveEmail}\n• Selected Stream: ${selectedStream.name} (${selectedStream.level})\n• Amount: ₹${paymentConfig.subscriptionPrice} (1 Year Access)\n${utrNumber ? `• UPI Ref / UTR: ${utrNumber.trim()}\n` : ''}\nI am attaching my payment screenshot with this message. Please approve my access directly in the Admin Panel.`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
  const upiIntentUrl = `upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.upiName)}&am=${paymentConfig.subscriptionPrice}&cu=INR&tn=${encodeURIComponent(`studeezone Pro - ${selectedStream.badge}`)}`;

  const handleCandidateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      alert('Please enter your candidate name');
      return;
    }
    if (!candidatePhone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!candidateEmail.trim() || !candidateEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmittingForm(true);
    try {
      submitPaymentForm({
        name: candidateName.trim(),
        phone: candidatePhone.trim(),
        email: candidateEmail.trim(),
        selectedStreamId: selectedStream.id,
        selectedStreamName: selectedStream.name,
        amount: paymentConfig.subscriptionPrice,
        utrNumber: utrNumber.trim() || undefined,
        notes: candidateNotes.trim() || undefined,
      });
      setFormSubmitted(true);
      setUtrSubmitted(true);
      setFormSuccessMessage(
        `Form details successfully saved for ${selectedStream.name}! Admin Sabu Tamang can now directly approve your paid access. Send your screenshot on WhatsApp below for immediate verification.`
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to submit candidate details');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      id="subscription-modal-overlay"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        id="subscription-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-indigo-700 to-slate-900 p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
            id="close-subscription-modal-btn"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STET PRO PASS • ₹499 PER STREAM</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium border border-white/20">
              1 Year / Stream
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
            Subscribe: ₹499 Per Stream
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1.5 max-w-lg leading-relaxed">
            Select your target STET stream below. Pricing is <strong>₹499 per stream</strong> (not bundled for all streams), giving full 1-year access to grand mocks, answer keys, analytics, and 24/7 Ask Lama.
          </p>

          {/* Price Tag Pill */}
          <div className="mt-4 inline-flex items-baseline space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <span className="text-xs text-amber-200 font-semibold uppercase tracking-wider">Fee:</span>
            <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-amber-300">
              {paymentConfig.currency}{paymentConfig.subscriptionPrice}
            </span>
            <span className="text-xs text-amber-200 font-bold">/ per stream (1 Year)</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Select Target Stream */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>1. Select Target Stream (₹499 per stream)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                Not for all streams
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {STET_STREAMS.map((stream) => {
                const isSelected = selectedStreamId === stream.id;
                return (
                  <button
                    type="button"
                    key={stream.id}
                    onClick={() => setSelectedStreamId(stream.id)}
                    className={`text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {stream.name}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {stream.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {stream.subtext}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2.5">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">₹499</div>
                        <div className="text-[9px] text-slate-400">1 Year</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pro Benefits Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <div className="text-indigo-600 font-bold text-xs">3,500+ MCQs</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Real past papers &amp; answers</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <div className="text-emerald-600 font-bold text-xs">Full Mocks</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Timer &amp; detailed scorecards</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <div className="text-violet-600 font-bold text-xs">24/7 Ask Lama</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Step-by-step mentor answers</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <div className="text-amber-600 font-bold text-xs">High-Yield Notes</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Formulas, acts &amp; pedagogies</div>
            </div>
          </div>

          {/* Payment Method Switcher (GPay QR Scanner vs Direct UPI ID) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'qr'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  id="tab-gpay-scanner-btn"
                >
                  Option 1: GPay QR Scanner
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'upi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  id="tab-upi-id-btn"
                >
                  Option 2: Pay via UPI ID
                </button>
              </div>

              <div className="hidden sm:flex items-center space-x-1 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Direct Payment</span>
              </div>
            </div>

            {/* TAB 1: GPay Scanner Image */}
            {activeTab === 'qr' && (
              <div className="bg-gradient-to-b from-indigo-50/50 to-slate-50 border-2 border-indigo-200 rounded-2xl p-5 text-center relative">
                <div className="max-w-xs mx-auto space-y-3">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white shadow-2xs border border-indigo-100 text-indigo-900 text-xs font-bold">
                    <span>Google Pay / PhonePe / Paytm / BHIM</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block relative group">
                    {paymentConfig.qrScannerImageUrl ? (
                      <img
                        src={paymentConfig.qrScannerImageUrl}
                        alt="GPay Scanner QR Code"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl mx-auto"
                        id="gpay-scanner-image"
                      />
                    ) : (
                      /* Stylized Stand-in QR when admin hasn't uploaded custom image yet */
                      <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
                        {/* Realistic QR Pattern SVG */}
                        <svg className="w-40 h-40 text-white" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="11" y="11" width="16" height="16" fill="currentColor" />
                          <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="73" y="11" width="16" height="16" fill="currentColor" />
                          <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="11" y="73" width="16" height="16" fill="currentColor" />
                          <rect x="42" y="8" width="6" height="14" />
                          <rect x="52" y="12" width="6" height="6" />
                          <rect x="42" y="42" width="16" height="16" rx="2" fill="#4f46e5" />
                          <rect x="12" y="42" width="6" height="14" />
                          <rect x="24" y="46" width="6" height="10" />
                          <rect x="68" y="42" width="14" height="6" />
                          <rect x="84" y="46" width="6" height="12" />
                          <rect x="42" y="68" width="12" height="6" />
                          <rect x="60" y="68" width="8" height="14" />
                          <rect x="74" y="74" width="16" height="16" />
                        </svg>
                        <div className="mt-2 text-center">
                          <span className="text-[11px] font-bold text-amber-300">Scan to pay: {paymentConfig.currency}{paymentConfig.subscriptionPrice}</span>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{paymentConfig.upiId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Open any UPI App (<strong>Google Pay, PhonePe, Paytm</strong>) and scan this QR code.
                  </p>

                  {/* Direct Mobile UPI Intent Button (if on mobile) */}
                  <div className="pt-1">
                    <a
                      href={upiIntentUrl}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      id="open-upi-app-btn"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tap to Pay Directly with UPI App</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UPI ID & Payee Name */}
            {activeTab === 'upi' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Official UPI ID:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-mono font-bold text-slate-900 truncate">
                        {paymentConfig.upiId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(paymentConfig.upiId, 'upi')}
                        className="ml-2 p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer shrink-0"
                        title="Copy UPI ID"
                        id="copy-upi-id-btn"
                      >
                        {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    {copiedUpi && <p className="text-[11px] text-emerald-600 font-medium">Copied to clipboard!</p>}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Payee / Account Name:
                    </span>
                    <div className="text-sm sm:text-base font-bold text-slate-800 truncate">
                      {paymentConfig.upiName}
                    </div>
                    <span className="text-[11px] text-slate-400">Verified Merchant Account</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Enter the UPI ID <strong>{paymentConfig.upiId}</strong> in your payment app and pay <strong>{paymentConfig.currency}{paymentConfig.subscriptionPrice}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CRITICAL STEP 2: Candidate Details Form (Name, Phone, Email, Autofilled Selected Stream) */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border-2 border-indigo-200 rounded-2xl p-5 space-y-4 shadow-xs" id="payment-details-form-section">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                    2. Fill Details for Admin Direct Approval
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Your name, phone, email &amp; selected stream are submitted directly to the Admin Panel for 1-click paid approval.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Form Required
              </span>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3 text-emerald-900">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Candidate Details &amp; Payment Submitted!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {formSuccessMessage}
                </p>
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
                  <div><strong>Name:</strong> {effectiveName}</div>
                  <div><strong>Phone:</strong> {effectivePhone}</div>
                  <div><strong>Email:</strong> {effectiveEmail}</div>
                  <div><strong>Stream:</strong> {selectedStream.name} ({paymentConfig.currency}{paymentConfig.subscriptionPrice})</div>
                  {utrNumber && <div><strong>UTR:</strong> {utrNumber}</div>}
                </div>
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Screenshot on WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                    className="px-3 py-2 bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCandidateFormSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Candidate Full Name <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sabu Tamang"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                      id="input-candidate-name"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Phone Number (WhatsApp) <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                      id="input-candidate-phone"
                    />
                  </div>

                  {/* Email ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Email ID <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. candidate@gmail.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                      id="input-candidate-email"
                    />
                  </div>

                  {/* Selected Stream (Autofilled!) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Target Stream (Autofilled)</span>
                      </span>
                      <span className="text-[10px] text-indigo-600 font-bold">₹{paymentConfig.subscriptionPrice}</span>
                    </label>
                    <div className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-950 font-bold flex items-center justify-between">
                      <span className="truncate">{selectedStream.name}</span>
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md shrink-0 ml-1">
                        {selectedStream.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UTR / Transaction Ref */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>12-Digit UPI Transaction ID / UTR Number</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">From GPay / PhonePe / Paytm</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit UTR ref from payment app"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    id="input-candidate-utr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  id="submit-payment-form-btn"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isSubmittingForm ? 'Submitting Details...' : 'Submit Details for Admin Direct Approval'}</span>
                </button>
              </form>
            )}
          </div>

          {/* STEP 3: Share Screenshot on WhatsApp */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm sm:text-base font-['Outfit']">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs">
                3
              </span>
              <span>Share Payment Screenshot to Admin on WhatsApp</span>
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed">
              Once you have completed the payment of <strong>₹{paymentConfig.subscriptionPrice}</strong> for <strong>{selectedStream.name}</strong>, send the screenshot to Sabu Tamang at{' '}
              <strong className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-950 font-bold">
                {paymentConfig.adminPhone}
              </strong>
              . Admin will directly verify and approve your enrollment!
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              {/* WhatsApp Share Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                id="share-payment-screenshot-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Share Details &amp; Screenshot on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {/* Copy Phone Number */}
              <button
                type="button"
                onClick={() => copyToClipboard(paymentConfig.adminPhone, 'phone')}
                className="px-4 py-3 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                id="copy-admin-phone-btn"
              >
                {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPhone ? 'Number Copied!' : 'Copy Admin Number'}</span>
              </button>
            </div>
          </div>

          {/* Admin shortcut if logged-in user is admin */}
          {(userProfile.role === 'admin' || (userProfile.email ? isAdminUser(userProfile.email) : false)) && onNavigateToAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-amber-900 font-semibold">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Admin Notice: Check "Paid &amp; Form Filled Submissions" in Admin Panel to directly approve candidates</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdmin();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 ml-2"
              >
                Go to Direct Approvals
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Secure &amp; Verified Manual Payment Activation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
            id="close-subscription-footer-btn"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
