'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, CheckCircle2, Shield, AlertCircle, Heart, User, Clock, Phone, MapPin, Star
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

export default function ReservePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refCode, setRefCode] = useState('');

  const [formData, setFormData] = useState({
    residentName: '',
    residentAge: '',
    residentGender: '',
    relationship: '',
    careLevel: '',
    medicalConditions: '',
    medications: '',
    roomPreference: '',
    moveInDate: '',
    urgency: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: ''
  });

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await fetch(`/api/homes/${id}`);
        if (!res.ok) throw new Error('Facility not found');
        const data = await res.json();
        setFacility(data.facility || data);
      } catch (err: any) {
        setError(err.message || 'Failed to load facility');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFacility();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/homes/${id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reservation',
          fullName: formData.contactName,
          phoneNumber: formData.contactPhone,
          email: formData.contactEmail,
          residentCondition: formData.careLevel,
          roomType: formData.roomPreference,
          notes: [
            formData.residentName ? `Resident: ${formData.residentName}, Age: ${formData.residentAge}, Gender: ${formData.residentGender}, Relationship: ${formData.relationship}` : '',
            formData.medicalConditions ? `Medical: ${formData.medicalConditions}` : '',
            formData.medications ? `Medications: ${formData.medications}` : '',
            formData.urgency ? `Urgency: ${formData.urgency}` : '',
            formData.moveInDate ? `Move-in: ${formData.moveInDate}` : '',
            formData.notes || '',
          ].filter(Boolean).join(' | '),
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit reservation');
      
      setIsSuccess(true);
      setRefCode(data.referenceCode || `RES-${Math.floor(Math.random()*10000)}`);
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
        <div>
          <PublicNavbar />
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-[#E86A33]/20 border-t-[#E86A33] rounded-full animate-spin" />
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between">
        <div>
          <PublicNavbar />
          <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Facility not found</h2>
            <Link href="/homes" className="text-[#E86A33] hover:underline font-medium">Return to Directory</Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-900 flex flex-col justify-between selection:bg-[#E86A33] selection:text-white">
      <div>
        <PublicNavbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/homes" className="hover:text-[#E86A33] transition-colors">Homes Directory</Link>
            <span>/</span>
            <Link href={`/homes?city=${facility.city}`} className="hover:text-[#E86A33] transition-colors">{facility.city}</Link>
            <span>/</span>
            <Link href={`/homes/${id}`} className="hover:text-[#E86A33] transition-colors truncate max-w-[150px]">{facility.name}</Link>
            <span>/</span>
            <span className="text-slate-900">Reserve Bed</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6">
              Reserve a Bed
            </h1>
            
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-full sm:w-32 h-32 relative rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                {facility.images?.[0] ? (
                   <Image src={facility.images[0]} alt={facility.name} fill className="object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <h2 className="text-lg font-bold text-slate-900">{facility.name}</h2>
                  {facility.isVerified && (
                    <span className="bg-emerald-50 text-emerald-800 border-emerald-200 border px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1 mb-3">
                  <MapPin size={14} /> {facility.city}, {facility.state}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm">
                   <div className="flex items-center gap-1 font-bold text-slate-700">
                     <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                     {facility.rating || 'New'}
                   </div>
                   <div className="h-4 w-px bg-slate-200" />
                   <div className="font-bold text-slate-900">
                     Starts at ₹{facility.pricing?.startingPrice?.toLocaleString('en-IN') || 'TBD'}/mo
                   </div>
                </div>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-8 sm:p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Reservation Request Sent!</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                We have received your reservation request for {facility.name}. Our care counselor will contact you shortly to confirm availability and discuss next steps.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 mb-8 inline-block mx-auto min-w-[250px]">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Reference Code</p>
                <p className="text-xl font-black text-[#E86A33] tracking-widest">{refCode}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/payment?facility=${id}&type=reservation&ref=${refCode}`}
                  className="w-full sm:w-auto bg-[#E86A33] hover:bg-[#D85820] text-white rounded-full px-8 py-3.5 text-sm font-bold shadow-xs active:scale-98 transition-all"
                >
                  Proceed to Payment
                </Link>
                <a
                  href={`https://wa.me/919371458326?text=Hi, I want to follow up on my reservation request ${refCode} for ${facility.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full px-8 py-3.5 text-sm font-bold transition-all"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Resident Info */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#E86A33]" />
                    <h3 className="font-bold text-slate-900 text-lg">Resident Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                      <input required type="text" name="residentName" value={formData.residentName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all" placeholder="Enter resident's full name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Age</label>
                        <input required type="number" name="residentAge" value={formData.residentAge} onChange={handleInputChange} min="50" max="120" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all" placeholder="e.g. 75" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Gender</label>
                        <select required name="residentGender" value={formData.residentGender} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all appearance-none">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Relationship to you</label>
                      <select required name="relationship" value={formData.relationship} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all appearance-none">
                        <option value="">Select</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Self">Self</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Care Needs */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#E86A33]" />
                    <h3 className="font-bold text-slate-900 text-lg">Care Needs</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Level of Care</label>
                      <select required name="careLevel" value={formData.careLevel} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all appearance-none">
                        <option value="">Select primary care level needed</option>
                        <option value="Independent">Independent Living (Minimal assistance)</option>
                        <option value="Assisted">Assisted Living (Help with daily activities)</option>
                        <option value="Bedridden">Bedridden / Palliative Care</option>
                        <option value="Dementia">Dementia / Alzheimer's Care</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Medical Conditions (Optional)</label>
                        <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all resize-none" placeholder="Briefly list any major medical conditions..." />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Current Medications (Optional)</label>
                        <textarea name="medications" value={formData.medications} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all resize-none" placeholder="List key ongoing medications..." />
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Room Preference */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[#E86A33]" />
                    <h3 className="font-bold text-slate-900 text-lg">Room Preference</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Deluxe Private Suite', 'Twin Sharing', 'ICU / Bedridden'].map((type) => (
                      <label key={type} className={`cursor-pointer border rounded-2xl p-4 transition-all ${formData.roomPreference === type ? 'border-[#E86A33] bg-[#E86A33]/5 ring-1 ring-[#E86A33]' : 'border-slate-200 hover:border-[#E86A33]/50 bg-slate-50'}`}>
                        <input type="radio" name="roomPreference" value={type} checked={formData.roomPreference === type} onChange={handleInputChange} className="sr-only" />
                        <div className="font-bold text-slate-900 text-sm mb-1">{type}</div>
                        <div className="text-xs text-slate-500 font-medium">Subject to availability</div>
                      </label>
                    ))}
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Timeline */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#E86A33]" />
                    <h3 className="font-bold text-slate-900 text-lg">Move-in Timeline</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Urgency</label>
                      <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all appearance-none">
                        <option value="">Select urgency</option>
                        <option value="Immediate">Immediate (Within 48 hours)</option>
                        <option value="Within 1 week">Within 1 week</option>
                        <option value="Within 1 month">Within 1 month</option>
                        <option value="Exploring">Just exploring options</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Preferred Date (Optional)</label>
                      <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all" />
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Contact */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-[#E86A33]" />
                    <h3 className="font-bold text-slate-900 text-lg">Your Contact Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Your Full Name</label>
                      <input required type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                      <div className="flex gap-2">
                        <div className="bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 flex items-center justify-center shrink-0">
                          +91
                        </div>
                        <input required type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} pattern="[0-9]{10}" maxLength={10} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all" placeholder="10-digit mobile number" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Email (Optional)</label>
                      <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all" placeholder="For reservation updates" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Additional Notes (Optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] transition-all resize-none" placeholder="Any special requests or concerns..." />
                  </div>
                </section>

                <div className="pt-4 flex items-center gap-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#E86A33] hover:bg-[#D85820] text-white rounded-full py-4 text-sm font-bold shadow-md active:scale-98 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Submit Reservation Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}
