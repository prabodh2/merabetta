export type OrganizationType = 'Government' | 'Private' | 'Trust/NGO' | 'Other';
export type EnrollmentStatus = 'submitted' | 'approved' | 'rejected';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface EnrollmentRecord {
  _id: string;
  referenceId: string;
  status: EnrollmentStatus;
  adminNotes?: string;
  reviewedAt?: string | Date;
  reviewedBy?: string;
  submittedAt: string | Date;
  fullData: EnrollmentFormData;
  flatData?: Record<string, unknown>;
}

export interface EnrollmentFormData {
  // Step 1: Organisation Information
  homeName: string;
  registrationNumber: string;
  yearEstablished: string;
  organizationType: OrganizationType;
  organizationTypeOther?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  website?: string;
  contactPersonName: string;
  designation: string;
  mobileNumber: string;
  emailAddress: string;

  // Step 2: Facility Details
  totalCapacity: string;
  currentResidents: string;
  activeResidents: string;
  bedRiddenResidents: string;
  
  // Medical Facilities (multi-select + other)
  medicalFacilities: {
    doctorVisits: boolean;
    nursingCare: boolean;
    emergencyCare: boolean;
    physiotherapy: boolean;
    other: boolean;
    otherDetails?: string;
  };

  // Services Offered (multi-select + other)
  servicesOffered: {
    assistedLiving: boolean;
    independentLiving: boolean;
    dementiaCare: boolean;
    palliativeCare: boolean;
    homeHospital: boolean;
    dayCareServices: boolean;
    meals: boolean;
    recreationalActivities: boolean;
    other: boolean;
    otherDetails?: string;
  };

  // Facility Price Ranges (per facility: from and to values)
  facilityPricing: Record<string, { from: string; to: string }>;

  // Step 3: Documents Uploaded
  documents: {
    registrationCertificate?: UploadedFileItem;
    panCard?: UploadedFileItem;
    gstCertificate?: UploadedFileItem;
    addressProof?: UploadedFileItem;
    representativeIdProof?: UploadedFileItem;
    bankAccountDetails?: UploadedFileItem;
    facilityPhotographs?: UploadedFileItem[];
    facilityVideo?: UploadedFileItem;
    licensesCertificates?: UploadedFileItem[];
  };

  // Step 4: Commercial Terms & Declaration
  commercialAgreed: boolean;
  declarationAgreed: boolean;
  submissionDate: string;

  // Step 4 (Owner Section): Old Age Home Owner / Signatory Details
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  digitalSignature: string;
}

export const INITIAL_FORM_DATA: EnrollmentFormData = {
  homeName: '',
  registrationNumber: '',
  yearEstablished: '',
  organizationType: 'Private',
  organizationTypeOther: '',
  address: '',
  city: '',
  state: 'Maharashtra',
  pinCode: '',
  website: '',
  contactPersonName: '',
  designation: '',
  mobileNumber: '',
  emailAddress: '',

  totalCapacity: '',
  currentResidents: '',
  activeResidents: '',
  bedRiddenResidents: '',

  medicalFacilities: {
    doctorVisits: false,
    nursingCare: false,
    emergencyCare: false,
    physiotherapy: false,
    other: false,
    otherDetails: '',
  },

  servicesOffered: {
    assistedLiving: false,
    independentLiving: false,
    dementiaCare: false,
    palliativeCare: false,
    homeHospital: false,
    dayCareServices: false,
    meals: false,
    recreationalActivities: false,
    other: false,
    otherDetails: '',
  },

  facilityPricing: {
    assistedLiving: { from: '15000', to: '20000' },
    independentLiving: { from: '', to: '' },
    dementiaCare: { from: '', to: '' },
    palliativeCare: { from: '', to: '' },
    homeHospital: { from: '', to: '' },
    dayCareServices: { from: '', to: '' },
    meals: { from: '', to: '' },
    recreationalActivities: { from: '', to: '' },
  },

  documents: {
    facilityPhotographs: [],
    licensesCertificates: [],
  },

  commercialAgreed: false,
  declarationAgreed: false,
  submissionDate: new Date().toISOString().split('T')[0],

  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  digitalSignature: '',
};
