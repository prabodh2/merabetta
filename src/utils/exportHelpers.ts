import { EnrollmentFormData } from '../types/enrollment';

export function flattenFormData(data: EnrollmentFormData, referenceId: string) {
  const docs = data.documents || {};
  const med = data.medicalFacilities || ({} as typeof data.medicalFacilities);
  const srv = data.servicesOffered || ({} as typeof data.servicesOffered);

  const medicalFacs = Object.entries(med)
    .filter(([key, val]) => val === true && key !== 'other')
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()))
    .concat(med.other && med.otherDetails ? [`Other: ${med.otherDetails}`] : [])
    .join(', ');

  const SERVICE_DISPLAY_NAMES: Record<string, string> = {
    assistedLiving: 'Assisted Living',
    homeHospital: 'Hospital at Home',
    palliativeCare: 'Palliative / Bedridden',
    independentLiving: 'Independent Living',
    dementiaCare: 'Dementia Care',
    dayCareServices: 'Day Care Services',
    meals: 'Meals',
    recreationalActivities: 'Recreational Activities',
  };

  const services = Object.entries(srv)
    .filter(([key, val]) => val === true && key !== 'other')
    .map(([key]) => {
      const name =
        SERVICE_DISPLAY_NAMES[key] ||
        key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      const pricing = data.facilityPricing?.[key];
      if (pricing && (pricing.from || pricing.to)) {
        return `${name} (₹${pricing.from || '0'} - ₹${pricing.to || '0'}/mo)`;
      }
      return name;
    })
    .concat(
      srv.other && srv.otherDetails
        ? [
            `Other: ${srv.otherDetails}${
              data.facilityPricing?.other?.from || data.facilityPricing?.other?.to
                ? ` (₹${data.facilityPricing.other.from || '0'} - ₹${data.facilityPricing.other.to || '0'}/mo)`
                : ''
            }`,
          ]
        : []
    )
    .join(', ');

  const pricingSummary = Object.entries(data.facilityPricing || {})
    .filter(([, val]) => val.from || val.to)
    .map(([key, val]) => {
      const name =
        SERVICE_DISPLAY_NAMES[key] ||
        key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      return `${name}: ₹${val.from || '0'} - ₹${val.to || '0'}`;
    })
    .join('; ');

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
    'Facility Price Ranges': pricingSummary || 'None specified',
    'Reg Certificate Uploaded': docs.registrationCertificate ? docs.registrationCertificate.name : 'No',
    'PAN Card Uploaded': docs.panCard ? docs.panCard.name : 'No',
    'GST Certificate Uploaded': docs.gstCertificate ? docs.gstCertificate.name : 'No',
    'Address Proof Uploaded': docs.addressProof ? docs.addressProof.name : 'No',
    'Rep ID Proof Uploaded': docs.representativeIdProof ? docs.representativeIdProof.name : 'No',
    'Bank Account Details Uploaded': docs.bankAccountDetails ? docs.bankAccountDetails.name : 'No',
    'Facility Photos Count': docs.facilityPhotographs ? docs.facilityPhotographs.length : 0,
    'Facility Video Uploaded': docs.facilityVideo ? docs.facilityVideo.name : 'No',
    'Licenses / Certs Count': docs.licensesCertificates ? docs.licensesCertificates.length : 0,
    'Commercial Terms Agreed': data.commercialAgreed ? 'YES' : 'NO',
    'Declaration Agreed': data.declarationAgreed ? 'YES' : 'NO',
    'Owner / Director Name': data.ownerName || 'N/A',
    'Owner Phone Number': data.ownerPhone || 'N/A',
    'Owner Mail ID': data.ownerEmail || 'N/A',
    'Digital Signature': data.digitalSignature ? 'Captured' : 'Not provided',
  };
}

