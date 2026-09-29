'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BrandLogo from '@/components/BrandLogo';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

const BACKGROUND_VIDEOS = [
  '/videos/clip1.mp4',
  '/videos/clip2.mp4',
  '/videos/login-bg.mp4',
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isLoading: authLoading } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredArea, setPreferredArea] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [videoIndex, setVideoIndex] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirectParam = search?.get('redirect');
      router.push(redirectParam || '/homes');
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleVideoEnded = () => {
    setVideoIndex((prev) => (prev + 1) % BACKGROUND_VIDEOS.length);
  };

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
        const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectParam = search?.get('redirect');
        const destination = redirectParam
          ? redirectParam
          : preferredArea.trim()
            ? `/homes?city=${encodeURIComponent(preferredArea.trim().toLowerCase())}`
            : '/homes';
        setTimeout(() => {
          router.push(destination);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E86A33]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      {/* ── Public Navbar (Preserved as requested) ── */}
      <PublicNavbar />

      <main className="flex-1 w-full flex flex-col lg:flex-row items-stretch">
        {/* ── LEFT HALF: Dynamic Looping Background Video Sequence with Official Logo ── */}
        <div className="w-full lg:w-1/2 min-h-[320px] sm:min-h-[380px] lg:min-h-[calc(100vh-4.5rem)] relative overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
          {/* Alternating Video Clips with onEnded auto-advance */}
          <video
            key={BACKGROUND_VIDEOS[videoIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover filter brightness-90 transition-opacity duration-1000"
          >
            <source src={BACKGROUND_VIDEOS[videoIndex]} type="video/mp4" />
          </video>

          {/* Ambient Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/65 pointer-events-none" />

          {/* Centered Official Logo: Icon + merabetta.com */}
          <div className="relative z-10 text-center px-6 max-w-lg select-none flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
              <BrandLogo size="md" variant="icon" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 drop-shadow-2xl shrink-0" />
              <img
                src="/merabetta_wordmark_light.svg"
                alt="merabetta.com"
                className="h-7 sm:h-9 lg:h-11 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 font-normal drop-shadow-md tracking-wide mt-1">
              Redefining Senior Living Care.
            </p>

            {/* Subtle Scene Indicator Dots */}
            <div className="flex items-center gap-1.5 mt-4 opacity-70">
              {BACKGROUND_VIDEOS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setVideoIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    videoIndex === idx ? 'w-6 bg-[#E86A33]' : 'w-1.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Video clip ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT HALF: Minimalist, Clean Auth Form ── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-10 lg:p-14 xl:p-16 bg-white">
          <div className="w-full max-w-sm sm:max-w-md mx-auto py-4">
            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-700 animate-in fade-in">
                {error}
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-normal">
                  Please enter your details to sign in.
                </p>

                <form onSubmit={handleSendOtp} className="mt-7 space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-[#F4F4F6] border border-transparent rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/15 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit number"
                        required
                        className="w-full pl-13 pr-4 py-3 bg-[#F4F4F6] border border-transparent rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/15 focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Preferred Area / City Field (Added per request) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span>Area / City to Find Old Age Home</span>
                      <span className="text-[11px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-[#E86A33] absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={preferredArea}
                        onChange={(e) => setPreferredArea(e.target.value)}
                        placeholder="e.g. Pune, Mumbai, Thane, Nashik..."
                        className="w-full pl-10 pr-4 py-3 bg-[#F4F4F6] border border-transparent rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/15 focus:outline-none transition-all"
                      />
                    </div>
                    {/* Quick City Selectors */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Pune', 'Mumbai', 'Thane', 'Nashik', 'Navi Mumbai'].map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setPreferredArea(city)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            preferredArea.toLowerCase() === city.toLowerCase()
                              ? 'bg-orange-50 border-orange-300 text-[#E86A33] font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Signature MeraBetta Orange Sign In Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10 || !name.trim()}
                      className="w-full bg-[#E86A33] hover:bg-[#D85820] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] shadow-md shadow-orange-500/25"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <span>Sign in</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change mobile number</span>
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Enter verification code
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-normal">
                  Please enter the 6-digit code sent to <b className="text-slate-900">+91 {phone}</b>.
                </p>

                {/* 6 Digit OTP inputs */}
                <div className="mt-6">
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center bg-[#F4F4F6] border border-transparent rounded-xl text-xl font-bold text-slate-900 focus:bg-white focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/15 focus:outline-none transition-all font-mono"
                      />
                    ))}
                  </div>

                  <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                    <p className="text-xs text-slate-500">
                      Dev Mode: enter code <b className="text-[#E86A33] font-mono font-bold">123456</b>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => verifyOtp(otp.join(''))}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full mt-6 bg-[#E86A33] hover:bg-[#D85820] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] shadow-md shadow-orange-500/25"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Proceed</span>
                  )}
                </button>

                <div className="text-center mt-5">
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={countdown > 0 || loading}
                    className="text-xs font-semibold text-slate-500 hover:text-[#E86A33] disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code via SMS'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome, {name ? name.split(' ')[0] : 'there'}!
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Signed in successfully. Opening senior living directory...
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#E86A33]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Redirecting to homes...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}
