export type OrganizationType = 'Government' | 'Private' | 'Trust/NGO' | 'Other';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
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
    dayCareServices: boolean;
    meals: boolean;
    recreationalActivities: boolean;
    other: boolean;
    otherDetails?: string;
  };

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
    dayCareServices: false,
    meals: false,
    recreationalActivities: false,
    other: false,
    otherDetails: '',
  },

  documents: {
    facilityPhotographs: [],
    licensesCertificates: [],
  },

  commercialAgreed: false,
  declarationAgreed: false,
  submissionDate: new Date().toISOString().split('T')[0],
};
