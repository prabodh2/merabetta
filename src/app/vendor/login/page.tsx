'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowLeft, RefreshCw, Shield, CheckCircle2, Building2 } from 'lucide-react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import Link from 'next/link';

export default function VendorLoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isLoading: authLoading } = useVendorAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && isLoggedIn) router.push('/vendor');
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vendor/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
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
    } catch {
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
      pasted.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + pasted.length, 5)]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== '') && newOtp.length === 6) {
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
      const res = await fetch('/api/vendor/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpString }),
      });
      const data = await res.json();
      if (data.success && data.vendor) {
        login(data.token, data.vendor);
        setStep(3);
        setTimeout(() => router.push('/vendor'), 1200);
      } else {
        setError(data.error || 'Invalid OTP. Dev mode: use 123456');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-[#E86A33] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E86A33] to-[#D85820] text-white mb-4 shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Portal</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">MeraBetta — Old Age Home Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Registered Mobile Number
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
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-400 font-medium text-center">
                  Use the number registered with your MeraBetta enrollment
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-[#E86A33] hover:bg-[#D85820] text-white py-3.5 rounded-full text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send OTP →'}
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
                  OTP sent to <span className="font-bold text-slate-900">+91 {phone}</span>
                </div>
              </div>

              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-center">
                Enter 6-Digit Code
              </label>

              <div className="flex justify-between gap-2 mb-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
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
                Dev mode code: <b className="font-mono text-slate-700">123456</b>
              </p>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => verifyOtp(otp.join(''))}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-[#E86A33] hover:bg-[#D85820] text-white py-3.5 rounded-full text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Enter Portal'}
                </button>
                <button
                  onClick={() => handleSendOtp()}
                  disabled={countdown > 0 || loading}
                  className="text-xs font-bold text-slate-500 hover:text-[#E86A33] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Welcome back!</h2>
              <p className="text-sm text-slate-500 font-medium">Loading your dashboard...</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          Not a registered vendor?{' '}
          <Link href="/" className="text-[#E86A33] font-bold hover:underline">
            Enroll your facility →
          </Link>
        </p>
      </div>
    </div>
  );
}
