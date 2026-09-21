'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import { Shield, Lock, CreditCard, Smartphone, Building2, CheckCircle2, Clock, MessageCircle, IndianRupee, ArrowLeft, X, ShieldCheck, AlertCircle } from 'lucide-react';

function PaymentContent() {
  const searchParams = useSearchParams();
  const facilityId = searchParams.get('facility');
  const type = searchParams.get('type');

  const [facilityName, setFacilityName] = useState('Loading...');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  useEffect(() => {
    if (facilityId) {
      fetch(`/api/homes/${facilityId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.facility && data.facility.name) {
            setFacilityName(data.facility.name);
          } else if (data && data.name) {
            setFacilityName(data.name);
          } else {
            setFacilityName('Unknown Facility');
          }
        })
        .catch(() => setFacilityName('Unknown Facility'));
    } else {
      setFacilityName('No Facility Selected');
    }
  }, [facilityId]);

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        <PublicNavbar />
        
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/directory" className="hover:text-[#E86A33] transition-colors">Homes Directory</Link>
            <span>/</span>
            <span className="text-slate-800">Payment</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          
          {/* Hero Banner */}
          <div className="bg-[#EBE6F8] rounded-3xl p-6 sm:p-8 mb-8 flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-xs">
              <ShieldCheck className="w-8 h-8 text-[#E86A33]" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 tracking-tight">Secure Payment</h1>
              <p className="text-sm text-slate-600 mt-1">Complete your reservation deposit securely</p>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Form */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Order Summary */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <h2 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#E86A33]" />
                  Order Summary
                </h2>
                
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Facility</p>
                      <p className="font-bold text-slate-800">{facilityName}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Type</p>
                      <p className="font-bold text-slate-800">Reservation Deposit</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Reservation Deposit (Refundable)</span>
                    <span className="font-bold text-slate-800">₹5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-bold text-slate-800">₹900</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-900">Total Amount</span>
                    <span className="font-black text-xl text-[#E86A33]">₹5,900</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <h2 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#E86A33]" />
                  Payment Method
                </h2>

                <div className="space-y-4 mb-8">
                  <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-[#E86A33] cursor-pointer transition-colors bg-slate-50 hover:bg-[#FFF8F3]">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-500" />
                      <span className="font-bold text-sm text-slate-800">UPI / QR Code</span>
                    </div>
                    <input type="radio" name="payment_method" className="w-4 h-4 text-[#E86A33] focus:ring-[#E86A33]" defaultChecked />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-[#E86A33] cursor-pointer transition-colors bg-slate-50 hover:bg-[#FFF8F3]">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-slate-500" />
                      <span className="font-bold text-sm text-slate-800">Credit / Debit Card</span>
                    </div>
                    <input type="radio" name="payment_method" className="w-4 h-4 text-[#E86A33] focus:ring-[#E86A33]" />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-[#E86A33] cursor-pointer transition-colors bg-slate-50 hover:bg-[#FFF8F3]">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-500" />
                      <span className="font-bold text-sm text-slate-800">Net Banking</span>
                    </div>
                    <input type="radio" name="payment_method" className="w-4 h-4 text-[#E86A33] focus:ring-[#E86A33]" />
                  </label>
                </div>

                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-[#E86A33] rounded border-slate-300 focus:ring-[#E86A33]"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the <span className="font-bold text-[#E86A33]">Terms of Service</span> and <span className="font-bold text-[#E86A33]">Refund Policy</span>. I understand this is a reservation deposit.
                  </span>
                </label>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={!agreed}
                  className={`w-full py-4 rounded-full text-sm font-bold shadow-xs transition-all ${agreed ? 'bg-[#E86A33] hover:bg-[#D85820] text-white active:scale-98' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  Pay ₹5,900
                </button>
              </div>

            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="sticky top-24 space-y-6">
                {/* Security Card */}
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs p-6 bg-gradient-to-b from-white to-emerald-50/30">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <Lock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 mb-1">Your payment is secure</h3>
                      <p className="text-xs text-slate-600">All transactions are encrypted with 256-bit SSL technology.</p>
                    </div>
                  </div>
                </div>

                {/* Refund Policy Card */}
                <div className="bg-white rounded-3xl border border-amber-100 shadow-xs p-6 bg-gradient-to-b from-white to-amber-50/30">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 mb-1">Refund Policy</h3>
                      <p className="text-xs text-slate-600">Full refund available within 48 hours of reservation if the facility visit is not completed.</p>
                    </div>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Need Help?</h3>
                  <div className="space-y-4">
                    <a href="https://wa.me/919371458326" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs font-bold text-slate-700 hover:text-[#E86A33] transition-colors">
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      Chat on WhatsApp
                    </a>
                    <a href="tel:8999188267" className="flex items-center gap-3 text-xs font-bold text-slate-700 hover:text-[#E86A33] transition-colors">
                      <Smartphone className="w-4 h-4 text-[#E86A33]" />
                      Call Helpline: 89991 88267
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <FloatingWhatsApp />
      <PublicFooter />

      {/* Coming Soon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="bg-[#FFF8F3] p-4 rounded-full mb-6">
                <Clock className="w-8 h-8 text-[#E86A33]" />
              </div>
              <h2 className="font-black text-xl text-slate-900 mb-2">Payment Gateway Coming Soon</h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                We are currently integrating a secure payment gateway. For now, please contact our team to complete your reservation.
              </p>
              
              <a 
                href="https://wa.me/919371458326" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#E86A33] hover:bg-[#D85820] text-white rounded-full py-4 text-sm font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Complete via WhatsApp
              </a>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E86A33]"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
