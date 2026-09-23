'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowLeft, CheckCircle2, RefreshCw, Shield, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, user, isLoading: authLoading } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [redirectTarget, setRedirectTarget] = useState('/payment');
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      if (user?.isSubscribed) {
        router.push('/homes');
      } else {
        router.push('/payment');
      }
    }
  }, [isLoggedIn, user, authLoading, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(2);
        setCountdown(30);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(index + pasted.length, 5);
      otpRefs.current[focusIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }

    if (newOtp.every(d => d !== '') && newOtp.length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (otpString: string) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpString, name: name.trim() })
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        login(data.token, data.user);
        setStep(3);
        const nextUrl = data.user.isSubscribed ? '/homes' : '/payment';
        setRedirectTarget(nextUrl);
        setTimeout(() => {
          router.push(nextUrl);
        }, 1200);
      } else {
        setError(data.error || 'Invalid OTP. Please enter 123456 in dev mode.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E86A33]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        <PublicNavbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex justify-center">
          <div className="w-full max-w-md">
            
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-[#FFF5EE] to-[#EBE6F8] rounded-3xl p-8 mb-6 text-center border border-orange-100/70 shadow-xs">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-[#E86A33] mb-4 shadow-xs">
                <Shield size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Login / Sign Up</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                Enter your details to access 50+ verified senior living homes across Maharashtra.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 text-center">
                  {error}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Full Name Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
                        placeholder="e.g. Ramesh Kulkarni"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Mobile Number Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 pl-4 flex items-center pointer-events-none gap-2">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-500 border-r border-slate-200 pr-2">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-24 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
                        placeholder="10-digit number"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-start gap-2 text-[11px] text-slate-600">
                    <Sparkles className="w-4 h-4 text-[#E86A33] shrink-0 mt-0.5" />
                    <span>
                      6-month directory pass: <b>₹999</b> for unlimited verified listings & direct home owner contact.
                    </span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10 || !name.trim()}
                    className="w-full bg-[#E86A33] hover:bg-[#D85820] text-white py-4 rounded-full text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Continue with OTP'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <div>
                  <div className="flex items-center mb-6">
                    <button 
                      onClick={() => setStep(1)}
                      className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="ml-2 text-sm text-slate-600 font-medium">
                      Sent OTP to <span className="font-bold text-slate-900">+91 {phone}</span>
                    </div>
                  </div>

                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  
                  <div className="flex justify-between gap-1.5 sm:gap-2 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all"
                      />
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mb-6">
                    (In development mode, enter code: <b className="text-slate-700 font-mono">123456</b>)
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() => verifyOtp(otp.join(''))}
                      disabled={loading || otp.join('').length !== 6}
                      className="w-full bg-[#E86A33] hover:bg-[#D85820] text-white py-4 rounded-full text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify & Proceed'}
                    </button>
                    
                    <button
                      onClick={() => handleSendOtp()}
                      disabled={countdown > 0 || loading}
                      className="text-xs font-bold text-slate-500 hover:text-[#E86A33] disabled:opacity-50 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-[bounce_1s_ease-in-out]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">Verified Successfully!</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium text-center">
                    {redirectTarget === '/homes' 
                      ? 'Subscription active. Loading verified homes...' 
                      : 'Redirecting to activate your 6-month directory pass...'}
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
      
      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}
