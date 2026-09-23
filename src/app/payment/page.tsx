'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  QrCode,
  CreditCard,
  Building,
  Lock,
  ArrowRight,
  PhoneCall,
  RefreshCw,
  AlertCircle,
  Calendar,
  Check,
} from 'lucide-react';

export default function SubscriptionPaymentPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, activateSubscription } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');

  // If user is already subscribed, redirect them to /homes
  useEffect(() => {
    if (!authLoading && isLoggedIn && user?.isSubscribed) {
      router.push('/homes');
    }
  }, [authLoading, isLoggedIn, user, router]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('merabetta-auth-token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setReferenceId(data.referenceId || `SUB-${Math.floor(100000 + Math.random() * 900000)}`);
        activateSubscription(data.subscriptionExpiresAt);
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/homes');
        }, 2200);
      } else {
        setError(data.error || 'Failed to activate subscription. Please try again.');
      }
    } catch (err) {
      setError('Network error during payment activation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        <PublicNavbar />

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/homes" className="hover:text-[#E86A33] transition-colors">Homes</Link>
            <span>/</span>
            <span className="text-slate-800">Directory Pass Subscription</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#FFF5EE] via-[#F8F3FD] to-[#EBE6F8] rounded-3xl p-6 sm:p-8 mb-8 border border-orange-100/70 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E86A33] text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100/70 text-[#E86A33] text-[11px] font-black uppercase tracking-wider mb-1">
                  6-Month Membership
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Unlock Senior Living Directory Pass
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Get complete, unrestricted access to all 50+ verified homes across Maharashtra.
                </p>
              </div>
            </div>
            <div className="sm:text-right bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-slate-200/80 shrink-0">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pass Price</span>
              <span className="text-2xl font-black text-[#E86A33]">₹999</span>
              <span className="text-xs text-slate-500 font-semibold block">/ 6 Months Access</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Overlay Modal */}
          {isSuccess && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
                <p className="text-xs font-mono text-slate-500 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
                  Ref: {referenceId}
                </p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Your <b>6-Month Directory Access Pass</b> is now active! Unlocking all 50+ verified senior care homes...
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-[#E86A33]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Redirecting to directory...</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Dummy Payment Gateway Card */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Select Payment Method</h2>
                    <p className="text-xs text-slate-500">Test Simulator Mode — Instant activation</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[11px] font-bold border border-amber-200/60">
                    <Lock className="w-3 h-3" />
                    <span>Demo Gateway</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#E86A33]" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>NetBanking</span>
                  </button>
                </div>

                {/* UPI Content */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                      <p className="text-xs font-bold text-slate-700 mb-2">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
                      <div className="w-40 h-40 bg-white mx-auto rounded-xl p-2 border border-slate-200 shadow-2xs flex flex-col items-center justify-center">
                        <QrCode className="w-32 h-32 text-slate-800" />
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-2">UPI ID: merabetta@icici</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Or Enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                      />
                    </div>
                  </div>
                )}

                {/* Card Content */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8901"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* NetBanking Content */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Select Bank
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] cursor-pointer"
                      >
                        <option>HDFC Bank</option>
                        <option>State Bank of India</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full py-4 px-6 rounded-full bg-[#E86A33] hover:bg-[#D85820] text-white text-sm font-black shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Processing Dummy Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹999 & Unlock Access (Test Mode)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-3">
                    🔒 Demo payment simulation for prototype testing. No real money will be charged.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Pass Benefits */}
            <div className="lg:col-span-5 space-y-6">
              {/* Order Summary Box */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <h3 className="text-base font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Plan Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>6-Month Directory Access Pass</span>
                    <span className="font-bold text-slate-900">₹846.61</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span className="font-bold text-slate-900">₹152.39</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div>
                      <p className="text-sm font-black text-slate-900">Total Amount</p>
                      <p className="text-[10px] text-slate-400">Inclusive of all taxes</p>
                    </div>
                    <span className="text-2xl font-black text-[#E86A33]">₹999</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50/60 rounded-2xl border border-orange-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-[#E86A33]" />
                    <span>Validity: 180 Days (6 Months)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Once paid, your account automatically has unlimited access to all verified facility details, contact info, and visit scheduling.
                  </p>
                </div>
              </div>

              {/* What You Get Box */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                  Everything Included in Your Pass
                </h4>

                <ul className="space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><b>50+ Verified Senior Homes</b> across Pune, Mumbai, Thane & Nashik</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><b>Direct Contact Info</b> of facility owners & medical administrators</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><b>Transparent Tariff Breakdown</b> for Assisted Living, ICU, & Dementia</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><b>Free Guided Visits</b> scheduled directly through the platform</span>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Secure Transaction & Instant Activation</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}
