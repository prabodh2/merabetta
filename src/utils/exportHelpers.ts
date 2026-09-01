import { EnrollmentFormData } from '../types/enrollment';

export function flattenFormData(data: EnrollmentFormData, referenceId: string) {
  const medicalFacs = Object.entries(data.medicalFacilities)
    .filter(([key, val]) => val === true && key !== 'other')
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()))
    .concat(data.medicalFacilities.other && data.medicalFacilities.otherDetails ? [`Other: ${data.medicalFacilities.otherDetails}`] : [])
    .join(', ');

  const services = Object.entries(data.servicesOffered)
    .filter(([key, val]) => val === true && key !== 'other')
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()))
    .concat(data.servicesOffered.other && data.servicesOffered.otherDetails ? [`Other: ${data.servicesOffered.otherDetails}`] : [])
    .join(', ');

  return {
    'Reference ID': referenceId,
    'Submission Date': data.submissionDate || new Date().toISOString().split('T')[0],
    'Old Age Home Name': data.homeName,
    'Registration Number': data.registrationNumber,
    'Year Established': data.yearEstablished,
    'Organization Type': data.organizationType === 'Other' ? `Other (${data.organizationTypeOther})` : data.organizationType,
    'Address': data.address,
    'City': data.city,
    'State': data.state,
    'PIN Code': data.pinCode,
    'Website': data.website || 'N/A',
    'Contact Person': data.contactPersonName,
    'Designation': data.designation,
    'Mobile Number': data.mobileNumber,
    'Email Address': data.emailAddress,
    'Total Resident Capacity': data.totalCapacity,
    'Current Residents': data.currentResidents,
    'Active Residents': data.activeResidents,
    'Bed Ridden Residents': data.bedRiddenResidents,
    'Medical Facilities': medicalFacs || 'None selected',
    'Services Offered': services || 'None selected',
    'Reg Certificate Uploaded': data.documents.registrationCertificate ? data.documents.registrationCertificate.name : 'No',
    'PAN Card Uploaded': data.documents.panCard ? data.documents.panCard.name : 'No',
    'GST Certificate Uploaded': data.documents.gstCertificate ? data.documents.gstCertificate.name : 'No',
    'Address Proof Uploaded': data.documents.addressProof ? data.documents.addressProof.name : 'No',
    'Rep ID Proof Uploaded': data.documents.representativeIdProof ? data.documents.representativeIdProof.name : 'No',
    'Bank Account Details Uploaded': data.documents.bankAccountDetails ? data.documents.bankAccountDetails.name : 'No',
    'Facility Photos Count': data.documents.facilityPhotographs ? data.documents.facilityPhotographs.length : 0,
    'Facility Video Uploaded': data.documents.facilityVideo ? data.documents.facilityVideo.name : 'No',
    'Licenses / Certs Count': data.documents.licensesCertificates ? data.documents.licensesCertificates.length : 0,
    'Commercial Terms Agreed': data.commercialAgreed ? 'YES' : 'NO',
    'Declaration Agreed': data.declarationAgreed ? 'YES' : 'NO',
  };
}

