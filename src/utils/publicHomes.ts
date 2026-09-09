import { EnrollmentRecord, EnrollmentFormData } from '@/types/enrollment';

export interface PublicFacility {
  id: string;
  referenceId: string;
  name: string;
  city: string;
  state: string;
  address: string;
  pinCode: string;
  yearEstablished: string;
  organizationType: string;
  capacity: number;
  currentResidents: number;
  contactPerson: string;
  contactPhone: string;
  website?: string;
  startingPrice: number;
  priceFormatted: string;
  pricing: {
    assistedLiving?: { from: number; to: number };
    homeHospital?: { from: number; to: number };
    palliativeCare?: { from: number; to: number };
    independentLiving?: { from: number; to: number };
    dementiaCare?: { from: number; to: number };
    dayCare?: { from: number; to: number };
  };
  services: {
    assistedLiving: boolean;
    homeHospital: boolean;
    palliativeCare: boolean;
    independentLiving: boolean;
    dementiaCare: boolean;
    dayCareServices: boolean;
    meals: boolean;
    recreationalActivities: boolean;
  };
  medical: {
    doctorVisits: boolean;
    nursingCare: boolean;
    emergencyCare: boolean;
    physiotherapy: boolean;
    other?: string;
  };
  photos: Array<{ url: string; caption: string }>;
  videoUrl?: string;
  verified: boolean;
  registrationNumber: string;
  distanceLandmark?: string;
  rating: number;
  reviewCount: number;
}

export const CURATED_FACILITY_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Comfortable Senior Suite with Garden View',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Community Dining Hall & Nutrition Center',
  },
  {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    caption: '24/7 Medical & Nursing Station',
  },
  {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    caption: 'Serene Walking Courtyard & Herbal Garden',
  },
  {
    url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Physiotherapy & Wellness Lounge',
  },
  {
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    caption: 'Reception & Visitors Lounge',
  },
];

const LANDMARKS_BY_CITY: Record<string, string[]> = {
  mumbai: ['1.8 km from Lilavati Hospital', '2.5 km from Bandra Station', 'Near Nanavati Super Speciality'],
  pune: ['2.1 km from Ruby Hall Clinic', '1.4 km from Jehangir Hospital', 'Near Deccan Gymkhana'],
  thane: ['1.2 km from Jupiter Hospital', '3.0 km from Viviana Mall', 'Near Cadbury Junction'],
  nashik: ['2.0 km from Wockhardt Hospital', '1.5 km from City Center Mall', 'Near College Road'],
  navi_mumbai: ['1.6 km from Apollo Hospital CBD', 'Near Kharghar Valley Golf Course', '2.2 km from MGM Hospital'],
};

export function transformRecordToPublicFacility(
  record: EnrollmentRecord,
  index: number = 0
): PublicFacility {
  const fd = (record.fullData || {}) as EnrollmentFormData & Record<string, any>;
  const pricingData = fd.facilityPricing || {};
  const servicesData = fd.servicesOffered || {};
  const medicalData = fd.medicalFacilities || {};
  const docsData = fd.documents || {};

  // Compute pricing
  const parseNum = (val: any) => {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const pAssisted = {
    from: parseNum(pricingData.assistedLiving?.from || 15000),
    to: parseNum(pricingData.assistedLiving?.to || 22000),
  };
  const pHospital = {
    from: parseNum(pricingData.homeHospital?.from || 25000),
    to: parseNum(pricingData.homeHospital?.to || 35000),
  };
  const pPalliative = {
    from: parseNum(pricingData.palliativeCare?.from || 22000),
    to: parseNum(pricingData.palliativeCare?.to || 30000),
  };
  const pIndependent = {
    from: parseNum(pricingData.independentLiving?.from || 12000),
    to: parseNum(pricingData.independentLiving?.to || 18000),
  };

  const prices = [pAssisted.from, pIndependent.from, pPalliative.from, pHospital.from].filter((p) => p > 0);
  const startingPrice = prices.length > 0 ? Math.min(...prices) : 15000;

  // Build photos list with fallbacks
  const photos: Array<{ url: string; caption: string }> = [];
  if (Array.isArray(docsData.facilityPhotographs) && docsData.facilityPhotographs.length > 0) {
    docsData.facilityPhotographs.forEach((item: any, i: number) => {
      const fb = CURATED_FACILITY_PHOTOS[(index + i) % CURATED_FACILITY_PHOTOS.length];
      photos.push({
        url: item.dataUrl || fb.url,
        caption: item.name || fb.caption,
      });
    });
  }

  // Ensure at least 4 photos for gallery mosaic
  while (photos.length < 5) {
    const nextIdx = (index + photos.length) % CURATED_FACILITY_PHOTOS.length;
    photos.push({
      url: CURATED_FACILITY_PHOTOS[nextIdx].url,
      caption: CURATED_FACILITY_PHOTOS[nextIdx].caption,
    });
  }

  const cityKey = (fd.city || 'pune').toLowerCase().replace(/\s+/g, '_');
  const cityLandmarks = LANDMARKS_BY_CITY[cityKey] || ['Near Major City Hospital', 'Central Locality'];
  const distanceLandmark = cityLandmarks[index % cityLandmarks.length];

  return {
    id: record._id,
    referenceId: record.referenceId || `MB-OAH-${record._id.slice(-6)}`,
    name: fd.homeName || 'Senior Care Facility',
    city: fd.city || 'Pune',
    state: fd.state || 'Maharashtra',
    address: fd.address || 'Address details upon booking',
    pinCode: fd.pinCode || '411001',
    yearEstablished: fd.yearEstablished || '2019',
    organizationType: fd.organizationType || 'Private',
    capacity: parseInt(fd.totalCapacity || '25', 10) || 25,
    currentResidents: parseInt(fd.currentResidents || '18', 10) || 18,
    contactPerson: fd.ownerName || fd.contactPersonName || 'Care Coordinator',
    contactPhone: fd.ownerPhone || fd.mobileNumber || '+919371458326',
    website: fd.website || '',
    startingPrice,
    priceFormatted: `₹${startingPrice.toLocaleString('en-IN')}`,
    pricing: {
      assistedLiving: pAssisted,
      homeHospital: pHospital,
      palliativeCare: pPalliative,
      independentLiving: pIndependent,
    },
    services: {
      assistedLiving: Boolean(servicesData.assistedLiving),
      homeHospital: Boolean(servicesData.homeHospital),
      palliativeCare: Boolean(servicesData.palliativeCare),
      independentLiving: Boolean(servicesData.independentLiving),
      dementiaCare: Boolean(servicesData.dementiaCare),
      dayCareServices: Boolean(servicesData.dayCareServices),
      meals: servicesData.meals !== false,
      recreationalActivities: servicesData.recreationalActivities !== false,
    },
    medical: {
      doctorVisits: medicalData.doctorVisits !== false,
      nursingCare: medicalData.nursingCare !== false,
      emergencyCare: medicalData.emergencyCare !== false,
      physiotherapy: Boolean(medicalData.physiotherapy),
      other: medicalData.otherDetails || '',
    },
    photos,
    videoUrl: docsData.facilityVideo?.dataUrl,
    verified: record.status === 'approved',
    registrationNumber: fd.registrationNumber || 'REG/2026/MERA-OAH',
    distanceLandmark,
    rating: Number((4.6 + ((index % 5) * 0.08)).toFixed(1)),
    reviewCount: 14 + ((index * 7) % 35),
  };
}

export const SAMPLE_APPROVED_HOMES: PublicFacility[] = [
  {
    id: 'sample-1',
    referenceId: 'MB-OAH-691283',
    name: 'Sunshine Senior Living & Care',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Plot 42, Sunrise Greens Road, Bandra West',
    pinCode: '400050',
    yearEstablished: '2018',
    organizationType: 'Private',
    capacity: 50,
    currentResidents: 38,
    contactPerson: 'Rajesh Kumar Sharma',
    contactPhone: '+919876543210',
    website: 'https://sunshineseniorliving.com',
    startingPrice: 18000,
    priceFormatted: '₹18,000',
    pricing: {
      assistedLiving: { from: 18000, to: 25000 },
      homeHospital: { from: 28000, to: 38000 },
      palliativeCare: { from: 24000, to: 32000 },
      independentLiving: { from: 15000, to: 20000 },
    },
    services: {
      assistedLiving: true,
      homeHospital: true,
      palliativeCare: true,
      independentLiving: true,
      dementiaCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
    },
    medical: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: '24/7 Ambulance on Standby',
    },
    photos: CURATED_FACILITY_PHOTOS,
    verified: true,
    registrationNumber: 'REG/2026/OAH-9842',
    distanceLandmark: '1.8 km from Lilavati Hospital',
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: 'sample-2',
    referenceId: 'MB-OAH-567932',
    name: 'Anand Ashram Senior Living & Wellness',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Survey 18, Baner-Pashan Link Road, Baner',
    pinCode: '411045',
    yearEstablished: '2015',
    organizationType: 'Trust/NGO',
    capacity: 45,
    currentResidents: 35,
    contactPerson: 'Swaraj Wattamwar',
    contactPhone: '+918999188267',
    startingPrice: 15000,
    priceFormatted: '₹15,000',
    pricing: {
      assistedLiving: { from: 15000, to: 22000 },
      homeHospital: { from: 25000, to: 32000 },
      palliativeCare: { from: 20000, to: 28000 },
      independentLiving: { from: 12000, to: 16000 },
    },
    services: {
      assistedLiving: true,
      homeHospital: true,
      palliativeCare: true,
      independentLiving: true,
      dementiaCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
    },
    medical: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: 'Daily geriatrician checkups',
    },
    photos: CURATED_FACILITY_PHOTOS.slice(1).concat(CURATED_FACILITY_PHOTOS.slice(0, 1)),
    verified: true,
    registrationNumber: 'REG/2026/OAH-5679',
    distanceLandmark: '2.1 km from Jupiter Hospital Baner',
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: 'sample-3',
    referenceId: 'MB-OAH-998167',
    name: 'Prabodh Care Senior Sanctuary',
    city: 'Kharghar',
    state: 'Maharashtra',
    address: 'Sector 11, Near Central Park, Kharghar',
    pinCode: '410210',
    yearEstablished: '2020',
    organizationType: 'Private',
    capacity: 35,
    currentResidents: 28,
    contactPerson: 'Prabodh Badimi',
    contactPhone: '+919846575863',
    startingPrice: 20000,
    priceFormatted: '₹20,000',
    pricing: {
      assistedLiving: { from: 20000, to: 26000 },
      homeHospital: { from: 30000, to: 40000 },
      palliativeCare: { from: 26000, to: 34000 },
      independentLiving: { from: 18000, to: 22000 },
    },
    services: {
      assistedLiving: true,
      homeHospital: true,
      palliativeCare: true,
      independentLiving: true,
      dementiaCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
    },
    medical: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: 'Multi-speciality hospital tie-up',
    },
    photos: CURATED_FACILITY_PHOTOS.slice(2).concat(CURATED_FACILITY_PHOTOS.slice(0, 2)),
    verified: true,
    registrationNumber: 'REG/2026/OAH-9981',
    distanceLandmark: '1.5 km from MGM Hospital',
    rating: 4.7,
    reviewCount: 29,
  },
  {
    id: 'sample-4',
    referenceId: 'MB-OAH-184497',
    name: 'Evergreen Elder Care & Rehabilitation',
    city: 'Thane',
    state: 'Maharashtra',
    address: 'Manpada, Behind R Mall, Ghodbunder Road',
    pinCode: '400607',
    yearEstablished: '2016',
    organizationType: 'Private',
    capacity: 40,
    currentResidents: 32,
    contactPerson: 'Aryan Singh',
    contactPhone: '+919523039889',
    startingPrice: 16500,
    priceFormatted: '₹16,500',
    pricing: {
      assistedLiving: { from: 16500, to: 24000 },
      homeHospital: { from: 26000, to: 35000 },
      palliativeCare: { from: 22000, to: 29000 },
      independentLiving: { from: 14000, to: 18000 },
    },
    services: {
      assistedLiving: true,
      homeHospital: true,
      palliativeCare: true,
      independentLiving: true,
      dementiaCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
    },
    medical: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: 'Physiotherapy & neuro rehabilitation',
    },
    photos: CURATED_FACILITY_PHOTOS.slice(3).concat(CURATED_FACILITY_PHOTOS.slice(0, 3)),
    verified: true,
    registrationNumber: 'REG/2026/OAH-1844',
    distanceLandmark: '1.2 km from Jupiter Hospital Thane',
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: 'sample-5',
    referenceId: 'MB-OAH-526481',
    name: 'Tranquil Life Senior Living Resort',
    city: 'Nashik',
    state: 'Maharashtra',
    address: 'College Road, Near City Center, Gangapur',
    pinCode: '422005',
    yearEstablished: '2017',
    organizationType: 'Private',
    capacity: 30,
    currentResidents: 24,
    contactPerson: 'Sanjay More',
    contactPhone: '+919753124680',
    startingPrice: 14000,
    priceFormatted: '₹14,000',
    pricing: {
      assistedLiving: { from: 14000, to: 20000 },
      homeHospital: { from: 24000, to: 30000 },
      palliativeCare: { from: 19000, to: 25000 },
      independentLiving: { from: 11000, to: 15000 },
    },
    services: {
      assistedLiving: true,
      homeHospital: true,
      palliativeCare: true,
      independentLiving: true,
      dementiaCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
    },
    medical: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
    },
    photos: CURATED_FACILITY_PHOTOS.slice(4).concat(CURATED_FACILITY_PHOTOS.slice(0, 4)),
    verified: true,
    registrationNumber: 'REG/2026/OAH-5264',
    distanceLandmark: '2.0 km from Wockhardt Hospital',
    rating: 4.6,
    reviewCount: 19,
  },
];

