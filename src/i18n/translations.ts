export type Language = 'en' | 'mr' | 'hi';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'EN',
  mr: 'मराठी',
  hi: 'हिंदी',
};

// Forward-declare so the object is typed as Record<Language, Translations> below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationMap = Record<Language, any>;

const translations = {
  en: {
    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      company: 'VISION55 MEGACARE PVT LTD.',
      formTitle: 'Old Age Home Enrollment Form',
      formSubtitle:
        'Partner with Merabetta to list your old age home, showcase your facility, manage vacancies, and reach families seeking compassionate senior living and assisted care.',
      address: 'Office No 6. Soham Riveria, Near Sun Planet, Anandnagar Pune 411051',
      instructions: 'Representative / Home Owner Instructions: Please fill in accurate facility details.',
      required: '* Indicates required question',
      draftSaved: 'Draft saved',
    },

    // ── Progress Bar ─────────────────────────────────────────────────────────
    progress: {
      stepOf: (current: number, total: number) => `Step ${current} of ${total}:`,
      completed: '% Completed',
      steps: [
        { title: 'Organisation Info', shortTitle: 'Org Info' },
        { title: 'Facility Details', shortTitle: 'Facility' },
        { title: 'Documents Upload', shortTitle: 'Documents' },
        { title: 'Terms & Declaration', shortTitle: 'Terms' },
      ],
    },

    // ── Navigation Buttons ───────────────────────────────────────────────────
    nav: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      submitting: 'Submitting...',
      pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
      confirmReset: 'Are you sure you want to reset and clear all entered form data?',
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
      rights: (year: number) => `© ${year} Vision55 Megacare Private Limited. All rights reserved.`,
      tagline: 'merabetta.com • Senior Living & Healthcare Platform',
    },

    // ── Section 1 ────────────────────────────────────────────────────────────
    s1: {
      sectionLabel: 'Section 1 of 4',
      title: 'Organisation Information',
      subtitle: 'General details, legal structure & primary point of contact.',

      cardGeneral: 'General Organization Details',
      homeName: 'Name of Old Age Home',
      homeNamePlaceholder: 'e.g. Anand Ashram Senior Care Home',

      registrationNumber: 'Registration Number',
      registrationNumberPlaceholder: 'e.g. MAH/PUN/1234/2018',

      yearEstablished: 'Year Established',
      yearEstablishedPlaceholder: 'e.g. 2012',

      orgType: 'Type of Organization',
      orgTypeOtherPlaceholder: 'Specify type of organization (e.g. Society / Section 8)',
      orgTypes: {
        Government: 'Government',
        Private: 'Private',
        'Trust/NGO': 'Trust/NGO',
        Other: 'Other',
      },

      cardAddress: 'Location & Address',
      fullAddress: 'Full Address',
      fullAddressPlaceholder: 'Building name, Street, Landmark, Area',
      city: 'City',
      cityPlaceholder: 'e.g. Pune',
      state: 'State',
      statePlaceholder: 'e.g. Maharashtra',
      pinCode: 'PIN Code',
      pinCodePlaceholder: 'e.g. 411051',
      website: 'Website (if available)',
      websitePlaceholder: 'https://www.example.com',

      cardContact: 'Primary Contact Details',
      contactPersonName: 'Contact Person Name',
      contactPersonNamePlaceholder: 'Full name of representative / trustee',
      designation: 'Designation',
      designationPlaceholder: 'e.g. Director / Trustee / Manager',
      mobileNumber: 'Mobile Number',
      mobileNumberPlaceholder: '9876543210',
      emailAddress: 'Email Address',
      emailAddressPlaceholder: 'contact@oldagehome.com',
    },

    // ── Section 2 ────────────────────────────────────────────────────────────
    s2: {
      sectionLabel: 'Section 2 of 4',
      title: 'Facility Details & Care Services',
      subtitle: 'Resident capacity, healthcare support & lifestyle amenities.',

      cardCapacity: 'Resident Capacity & Occupancy',
      totalCapacity: 'Total Resident Capacity',
      totalCapacityPlaceholder: 'e.g. 50',
      currentResidents: 'Total Current Residents',
      currentResidentsPlaceholder: 'e.g. 35',
      activeResidents: 'Active Residents',
      activeResidentsPlaceholder: 'e.g. 25',
      bedRiddenResidents: 'Bed Ridden Residents',
      bedRiddenResidentsPlaceholder: 'e.g. 10',

      cardMedical: 'Medical Facilities Available',
      selectAll: 'Select all that apply',
      medicalFacilities: {
        doctorVisits: 'Doctor Visits',
        nursingCare: 'Nursing Care (24/7 / Dedicated)',
        emergencyCare: 'Emergency Care / Ambulance',
        physiotherapy: 'Physiotherapy',
        other: 'Other Medical Facilities',
      },
      otherMedicalPlaceholder:
        'Specify other medical facilities (e.g. Oxygen support, ICU tie-up, Dialysis escort)',

      cardServices: 'Services & Care Offered',
      services: {
        assistedLiving: 'Assisted Living',
        independentLiving: 'Independent Living',
        dementiaCare: 'Dementia / Alzheimer Care',
        palliativeCare: 'Palliative Care',
        dayCareServices: 'Day Care Services',
        meals: 'Nutritious Customized Meals',
        recreationalActivities: 'Recreational & Social Activities',
        other: 'Other Services',
      },
      otherServicesPlaceholder:
        'Specify other services (e.g. Yoga & Meditation, Spiritual visits, Laundry service)',
    },

    // ── Section 3 ────────────────────────────────────────────────────────────
    s3: {
      sectionLabel: 'Section 3 of 4',
      title: 'Documents & Verification',
      subtitle: 'Upload verified copies of legal documents, IDs, and facility media.',

      docGuidelines: 'Document Guidelines:',
      docGuidelinesText:
        'Clear mobile photos or PDF scans are accepted. Max file size is 15MB per file. These documents are securely stored and verified before granting active listing on Merabetta.',

      cardMandatory: 'Mandatory Legal & Identity Documents',
      cardMedia: 'Facility Media & Certifications',

      docs: {
        registrationCertificate: 'Organization Registration Certificate',
        registrationCertificateSub: 'Trust deed, Society registration, or Certificate of Incorporation',
        panCard: 'PAN Card',
        panCardSub: 'Organization PAN Card (or Proprietor/Trustee PAN)',
        gstCertificate: 'GST Certificate',
        gstCertificateSub: 'If applicable to your organization',
        addressProof: 'Address Proof of Facility',
        addressProofSub: 'Electricity bill, Rent agreement, or Property tax receipt',
        representativeIdProof: 'Authorized Representative ID Proof',
        representativeIdProofSub: 'Aadhaar Card, Passport, or Voter ID of Contact Person',
        bankAccountDetails: 'Bank Account Details / Cancelled Cheque',
        bankAccountDetailsSub: 'For verified financial records and payouts',
        facilityPhotographs: 'Facility Photographs',
        facilityPhotographsSub:
          'Upload photos of rooms, dining hall, garden, activity center & medical room (.jpg, .png)',
        facilityVideo: 'Facility Video Walkthrough',
        facilityVideoSub: 'Short video clip in .mp4, .mpg, or .mov format',
        licensesCertificates: 'Any Relevant Licenses / Fire NOC / Food Safety',
        licensesCertificatesSub:
          'Fire safety NOC, FSSAI certificate, Clinical establishment license (if applicable)',
      },
    },

    // ── Section 4 ────────────────────────────────────────────────────────────
    s4: {
      sectionLabel: 'Section 4 of 4',
      title: 'Commercial Terms & Declaration',
      subtitle: 'Platform charges, digital promotion benefits & legal declaration.',

      cardCommercial: 'Platform Commercial Terms',
      term1Label: 'Term 1 • Admission Fee',
      term1Title: '10% + GST on First Billing',
      term1Body:
        'A nominal one-time charge of 10% + GST for every successful resident admission routed through Vision55 Megacare Pvt. Ltd., calculated on the first month billing towards platform service charges.',
      term1Footer: 'Payable only upon successful admission',

      term2Label: 'Term 2 • Platform Subscription',
      term2Title: '₹299 / Month',
      term2Body:
        'A nominal subscription fee of ₹299 per month for real-time updating of vacancy information on the Merabetta website & mobile app, highlighting resident activities, and dedicated digital media promotions for increased viewership.',
      term2Footer: 'Includes website, app & social reach',

      commercialCheckLabel:
        'I have read, understood, and agree to the commercial terms mentioned above.',
      commercialCheckSub:
        'These terms will govern the partnership between Vision55 Megacare Pvt. Ltd. and your facility.',

      cardDeclaration: 'Legal Declaration & Agreement',
      declaration1:
        '1. I hereby declare that the information provided above is true and accurate to the best of my knowledge. I understand that the platform (Vision55 Megacare Pvt. Ltd. / merabetta.com) may verify the submitted information before approving the registration.',
      declaration2:
        "2. I agree to comply with the platform's policies, terms of use, quality standards, and all applicable healthcare and eldercare regulations.",
      declaration3: 'All legal matters are subject to Pune Jurisdiction.',
      declarationCheckLabel:
        'I confirm that I am an authorized signatory and agree to all terms stated in this declaration.',
    },

    // ── Success Modal ────────────────────────────────────────────────────────
    success: {
      badge: 'Application Submitted Successfully',
      title: 'Enrollment Received!',
      body: (homeName: string) =>
        `Thank you for enrolling ${homeName} with Vision55 Megacare Pvt. Ltd. (merabetta.com). Our team will review the submitted details and contact you for active onboarding.`,
      newForm: 'Submit Another Old Age Home Form',
    },

    // ── File Upload Card ─────────────────────────────────────────────────────
    upload: {
      clickToBrowse: 'Click to browse',
      orDragDrop: 'or drag and drop',
      formats: 'Formats:',
      max: 'Max',
      attached: 'Attached',
      fileTooLarge: (name: string, max: number) =>
        `File "${name}" exceeds the maximum size of ${max}MB.`,
    },

    // ── Validation Errors ────────────────────────────────────────────────────
    errors: {
      homeName: 'Please enter the name of the Old Age Home.',
      registrationNumber: 'Registration number is required.',
      yearEstablished: 'Year established is required.',
      address: 'Full address is required.',
      city: 'City is required.',
      state: 'State is required.',
      pinCode: 'Valid 6-digit PIN code is required.',
      contactPersonName: 'Contact person name is required.',
      designation: 'Designation is required.',
      mobileNumber: 'Valid 10-digit mobile number is required.',
      emailAddress: 'Valid email address is required.',
      totalCapacity: 'Please enter valid total capacity.',
      currentResidents: 'Please enter valid current resident count.',
      commercialAgreed: 'You must accept the commercial terms to continue.',
      declarationAgreed: 'You must confirm and agree to the declaration.',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  //  MARATHI (मराठी)
  // ════════════════════════════════════════════════════════════════════════════
  mr: {
    header: {
      company: 'व्हिजन55 मेगाकेअर प्रा. लि.',
      formTitle: 'वृद्धाश्रम नोंदणी अर्ज',
      formSubtitle:
        'तुमचे वृद्धाश्रम मेरबेटावर सूचीबद्ध करण्यासाठी, सुविधा दर्शविण्यासाठी, रिक्त जागा व्यवस्थापित करण्यासाठी आणि ज्येष्ठ नागरिकांच्या काळजीसाठी कुटुंबांपर्यंत पोहोचण्यासाठी आमच्याशी भागीदारी करा.',
      address: 'ऑफिस क्र. 6, सोहम रिव्हेरिया, सन प्लॅनेटजवळ, आनंदनगर, पुणे ४११०५१',
      instructions:
        'प्रतिनिधी / गृह मालक सूचना: कृपया अचूक सुविधा तपशील भरा.',
      required: '* अनिवार्य प्रश्न दर्शवते',
      draftSaved: 'मसुदा जतन झाला',
    },

    progress: {
      stepOf: (current: number, total: number) => `${total} पैकी ${current} पायरी:`,
      completed: '% पूर्ण',
      steps: [
        { title: 'संस्था माहिती', shortTitle: 'संस्था' },
        { title: 'सुविधा तपशील', shortTitle: 'सुविधा' },
        { title: 'कागदपत्र अपलोड', shortTitle: 'कागदपत्रे' },
        { title: 'अटी व घोषणा', shortTitle: 'अटी' },
      ],
    },

    nav: {
      back: 'मागे',
      next: 'पुढे',
      submit: 'सादर करा',
      submitting: 'सादर होत आहे...',
      pageOf: (current: number, total: number) => `${total} पैकी ${current} पृष्ठ`,
      confirmReset: 'तुम्हाला खात्री आहे का? सर्व भरलेली माहिती हटवायची आहे का?',
    },

    footer: {
      rights: (year: number) =>
        `© ${year} व्हिजन55 मेगाकेअर प्रायव्हेट लिमिटेड. सर्व हक्क राखीव.`,
      tagline: 'merabetta.com • ज्येष्ठ नागरिक निवास आणि आरोग्यसेवा मंच',
    },

    s1: {
      sectionLabel: '४ पैकी विभाग १',
      title: 'संस्था माहिती',
      subtitle: 'सामान्य तपशील, कायदेशीर रचना आणि प्राथमिक संपर्क व्यक्ती.',

      cardGeneral: 'संस्थेचे सामान्य तपशील',
      homeName: 'वृद्धाश्रमाचे नाव',
      homeNamePlaceholder: 'उदा. आनंद आश्रम सीनियर केअर होम',

      registrationNumber: 'नोंदणी क्रमांक',
      registrationNumberPlaceholder: 'उदा. MAH/PUN/1234/2018',

      yearEstablished: 'स्थापना वर्ष',
      yearEstablishedPlaceholder: 'उदा. 2012',

      orgType: 'संस्थेचा प्रकार',
      orgTypeOtherPlaceholder: 'संस्थेचा प्रकार नमूद करा (उदा. सोसायटी / कलम ८)',
      orgTypes: {
        Government: 'शासकीय',
        Private: 'खासगी',
        'Trust/NGO': 'ट्रस्ट/स्वयंसेवी संस्था',
        Other: 'इतर',
      },

      cardAddress: 'स्थान आणि पत्ता',
      fullAddress: 'पूर्ण पत्ता',
      fullAddressPlaceholder: 'इमारतीचे नाव, रस्ता, खूण, परिसर',
      city: 'शहर',
      cityPlaceholder: 'उदा. पुणे',
      state: 'राज्य',
      statePlaceholder: 'उदा. महाराष्ट्र',
      pinCode: 'पिन कोड',
      pinCodePlaceholder: 'उदा. 411051',
      website: 'संकेतस्थळ (उपलब्ध असल्यास)',
      websitePlaceholder: 'https://www.example.com',

      cardContact: 'प्राथमिक संपर्क तपशील',
      contactPersonName: 'संपर्क व्यक्तीचे नाव',
      contactPersonNamePlaceholder: 'प्रतिनिधी / विश्वस्त यांचे पूर्ण नाव',
      designation: 'पद',
      designationPlaceholder: 'उदा. संचालक / विश्वस्त / व्यवस्थापक',
      mobileNumber: 'मोबाइल नंबर',
      mobileNumberPlaceholder: '9876543210',
      emailAddress: 'ईमेल पत्ता',
      emailAddressPlaceholder: 'contact@oldagehome.com',
    },

    s2: {
      sectionLabel: '४ पैकी विभाग २',
      title: 'सुविधा तपशील आणि काळजी सेवा',
      subtitle: 'रहिवाशांची क्षमता, आरोग्यसेवा आधार आणि जीवनशैली सुविधा.',

      cardCapacity: 'रहिवासी क्षमता आणि उपस्थिती',
      totalCapacity: 'एकूण रहिवासी क्षमता',
      totalCapacityPlaceholder: 'उदा. 50',
      currentResidents: 'सध्याचे एकूण रहिवासी',
      currentResidentsPlaceholder: 'उदा. 35',
      activeResidents: 'सक्रिय रहिवासी',
      activeResidentsPlaceholder: 'उदा. 25',
      bedRiddenResidents: 'अंथरुणावर खिळलेले रहिवासी',
      bedRiddenResidentsPlaceholder: 'उदा. 10',

      cardMedical: 'उपलब्ध वैद्यकीय सुविधा',
      selectAll: 'लागू असलेले सर्व निवडा',
      medicalFacilities: {
        doctorVisits: 'डॉक्टरांची भेट',
        nursingCare: 'परिचारिका सेवा (२४/७ / समर्पित)',
        emergencyCare: 'आपत्कालीन सेवा / रुग्णवाहिका',
        physiotherapy: 'फिजिओथेरपी',
        other: 'इतर वैद्यकीय सुविधा',
      },
      otherMedicalPlaceholder:
        'इतर वैद्यकीय सुविधा नमूद करा (उदा. ऑक्सिजन सपोर्ट, ICU टाय-अप, डायलिसिस सेवा)',

      cardServices: 'प्रदान केल्या जाणाऱ्या सेवा',
      services: {
        assistedLiving: 'सहाय्यित निवास',
        independentLiving: 'स्वतंत्र निवास',
        dementiaCare: 'स्मृतिभ्रंश / अल्झायमर काळजी',
        palliativeCare: 'उपशामक काळजी',
        dayCareServices: 'दिवस काळजी सेवा',
        meals: 'पौष्टिक सानुकूल जेवण',
        recreationalActivities: 'मनोरंजन आणि सामाजिक उपक्रम',
        other: 'इतर सेवा',
      },
      otherServicesPlaceholder:
        'इतर सेवा नमूद करा (उदा. योग व ध्यान, आध्यात्मिक भेटी, धुलाई सेवा)',
    },

    s3: {
      sectionLabel: '४ पैकी विभाग ३',
      title: 'कागदपत्रे आणि पडताळणी',
      subtitle: 'कायदेशीर कागदपत्रे, ओळखपत्रे आणि सुविधा मीडियाच्या सत्यापित प्रती अपलोड करा.',

      docGuidelines: 'कागदपत्र मार्गदर्शक तत्त्वे:',
      docGuidelinesText:
        'स्पष्ट मोबाइल फोटो किंवा PDF स्कॅन स्वीकारले जातात. प्रति फाइल कमाल आकार 15MB आहे. ही कागदपत्रे मेरबेटावर सक्रिय सूचीकरण करण्यापूर्वी सुरक्षितपणे साठवली आणि पडताळली जातात.',

      cardMandatory: 'अनिवार्य कायदेशीर आणि ओळख कागदपत्रे',
      cardMedia: 'सुविधा मीडिया आणि प्रमाणपत्रे',

      docs: {
        registrationCertificate: 'संस्था नोंदणी प्रमाणपत्र',
        registrationCertificateSub: 'ट्रस्ट डीड, सोसायटी नोंदणी, किंवा समावेश प्रमाणपत्र',
        panCard: 'पॅन कार्ड',
        panCardSub: 'संस्थेचे पॅन कार्ड (किंवा मालक/विश्वस्त यांचे पॅन)',
        gstCertificate: 'GST प्रमाणपत्र',
        gstCertificateSub: 'तुमच्या संस्थेस लागू असल्यास',
        addressProof: 'सुविधेचा पत्त्याचा पुरावा',
        addressProofSub: 'वीज बिल, भाडे करार, किंवा मालमत्ता कर पावती',
        representativeIdProof: 'अधिकृत प्रतिनिधी ओळख पुरावा',
        representativeIdProofSub: 'संपर्क व्यक्तीचे आधार कार्ड, पासपोर्ट, किंवा मतदार ओळखपत्र',
        bankAccountDetails: 'बँक खाते तपशील / रद्द केलेला चेक',
        bankAccountDetailsSub: 'सत्यापित आर्थिक नोंदी आणि देयकांसाठी',
        facilityPhotographs: 'सुविधेचे फोटो',
        facilityPhotographsSub:
          'खोल्या, जेवण कक्ष, बाग, क्रियाकलाप केंद्र आणि वैद्यकीय कक्षाचे फोटो अपलोड करा (.jpg, .png)',
        facilityVideo: 'सुविधा व्हिडिओ टूर',
        facilityVideoSub: '.mp4, .mpg, किंवा .mov स्वरूपातील लघु व्हिडिओ क्लिप',
        licensesCertificates: 'कोणतेही संबंधित परवाने / अग्नी NOC / अन्न सुरक्षा',
        licensesCertificatesSub:
          'अग्नी सुरक्षा NOC, FSSAI प्रमाणपत्र, क्लिनिकल स्थापना परवाना (लागू असल्यास)',
      },
    },

    s4: {
      sectionLabel: '४ पैकी विभाग ४',
      title: 'व्यावसायिक अटी आणि घोषणा',
      subtitle: 'प्लॅटफॉर्म शुल्क, डिजिटल प्रचार लाभ आणि कायदेशीर घोषणा.',

      cardCommercial: 'प्लॅटफॉर्म व्यावसायिक अटी',
      term1Label: 'अट १ • प्रवेश शुल्क',
      term1Title: 'पहिल्या बिलावर १०% + GST',
      term1Body:
        'व्हिजन55 मेगाकेअर प्रा. लि. द्वारे यशस्वीरित्या केल्या गेलेल्या प्रत्येक रहिवाशाच्या प्रवेशासाठी एकवेळचे नाममात्र शुल्क १०% + GST, जे प्लॅटफॉर्म सेवा शुल्कासाठी पहिल्या महिन्याच्या बिलावर आकारले जाते.',
      term1Footer: 'केवळ यशस्वी प्रवेशावर देय',

      term2Label: 'अट २ • प्लॅटफॉर्म सदस्यता',
      term2Title: '₹२९९ / महिना',
      term2Body:
        'मेरबेटा वेबसाइट आणि मोबाइल अॅपवर रिक्त जागेची माहिती रिअल-टाइम अपडेट करण्यासाठी, रहिवाशांच्या उपक्रमांना ठळक करण्यासाठी आणि अधिक दर्शकांसाठी समर्पित डिजिटल मीडिया प्रचारासाठी ₹२९९ प्रति महिना नाममात्र सदस्यता शुल्क.',
      term2Footer: 'वेबसाइट, अॅप आणि सोशल पोहोच समाविष्ट',

      commercialCheckLabel:
        'मी वर नमूद केलेल्या व्यावसायिक अटी वाचल्या, समजल्या आणि मान्य केल्या आहेत.',
      commercialCheckSub:
        'या अटी व्हिजन55 मेगाकेअर प्रा. लि. आणि तुमच्या सुविधेमधील भागीदारी नियंत्रित करतील.',

      cardDeclaration: 'कायदेशीर घोषणा आणि करार',
      declaration1:
        '१. मी याद्वारे घोषित करतो/करते की वर दिलेली माहिती माझ्या सर्वोत्तम ज्ञानानुसार खरी आणि अचूक आहे. नोंदणी मंजूर करण्यापूर्वी प्लॅटफॉर्म (व्हिजन55 मेगाकेअर प्रा. लि. / merabetta.com) सादर केलेली माहिती पडताळू शकतो हे मला समजते.',
      declaration2:
        '२. मी प्लॅटफॉर्मच्या धोरणांचे, वापराच्या अटींचे, गुणवत्ता मानकांचे आणि सर्व लागू आरोग्यसेवा आणि वृद्धांच्या काळजीच्या नियमांचे पालन करण्यास सहमत आहे.',
      declaration3: 'सर्व कायदेशीर बाबी पुणे न्यायालयीन क्षेत्राच्या अधीन आहेत.',
      declarationCheckLabel:
        'मी पुष्टी करतो/करते की मी अधिकृत स्वाक्षरीकर्ता आहे आणि या घोषणेत नमूद केलेल्या सर्व अटींना सहमत आहे.',
    },

    success: {
      badge: 'अर्ज यशस्वीरित्या सादर झाला',
      title: 'नोंदणी प्राप्त झाली!',
      body: (homeName: string) =>
        `व्हिजन55 मेगाकेअर प्रा. लि. (merabetta.com) सोबत ${homeName} नोंदणी केल्याबद्दल धन्यवाद. आमची टीम सादर केलेल्या तपशीलांचे पुनरावलोकन करेल आणि सक्रिय ऑनबोर्डिंगसाठी तुमच्याशी संपर्क साधेल.`,
      newForm: 'दुसरा वृद्धाश्रम अर्ज सादर करा',
    },

    upload: {
      clickToBrowse: 'ब्राउझ करण्यासाठी क्लिक करा',
      orDragDrop: 'किंवा ड्रॅग आणि ड्रॉप करा',
      formats: 'स्वरूपे:',
      max: 'कमाल',
      attached: 'जोडले',
      fileTooLarge: (name: string, max: number) =>
        `"${name}" फाइल ${max}MB च्या कमाल आकारापेक्षा मोठी आहे.`,
    },

    errors: {
      homeName: 'कृपया वृद्धाश्रमाचे नाव प्रविष्ट करा.',
      registrationNumber: 'नोंदणी क्रमांक आवश्यक आहे.',
      yearEstablished: 'स्थापना वर्ष आवश्यक आहे.',
      address: 'पूर्ण पत्ता आवश्यक आहे.',
      city: 'शहर आवश्यक आहे.',
      state: 'राज्य आवश्यक आहे.',
      pinCode: 'वैध ६ अंकी पिन कोड आवश्यक आहे.',
      contactPersonName: 'संपर्क व्यक्तीचे नाव आवश्यक आहे.',
      designation: 'पद आवश्यक आहे.',
      mobileNumber: 'वैध १० अंकी मोबाइल नंबर आवश्यक आहे.',
      emailAddress: 'वैध ईमेल पत्ता आवश्यक आहे.',
      totalCapacity: 'कृपया वैध एकूण क्षमता प्रविष्ट करा.',
      currentResidents: 'कृपया वैध सध्याच्या रहिवाशांची संख्या प्रविष्ट करा.',
      commercialAgreed: 'पुढे जाण्यासाठी तुम्ही व्यावसायिक अटी स्वीकारणे आवश्यक आहे.',
      declarationAgreed: 'तुम्ही घोषणेची पुष्टी करणे आणि सहमत होणे आवश्यक आहे.',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  //  HINDI (हिंदी)
  // ════════════════════════════════════════════════════════════════════════════
  hi: {
    header: {
      company: 'विज़न55 मेगाकेयर प्रा. लि.',
      formTitle: 'वृद्धाश्रम नामांकन फॉर्म',
      formSubtitle:
        'अपने वृद्धाश्रम को मेरबेटा पर सूचीबद्ध करने, सुविधाएं प्रदर्शित करने, रिक्तियां प्रबंधित करने और बुजुर्गों की देखभाल चाहने वाले परिवारों तक पहुंचने के लिए हमारे साथ भागीदारी करें।',
      address: 'कार्यालय सं. 6, सोहम रिवेरिया, सन प्लैनेट के पास, आनंदनगर, पुणे 411051',
      instructions:
        'प्रतिनिधि / गृह स्वामी निर्देश: कृपया सटीक सुविधा विवरण भरें।',
      required: '* अनिवार्य प्रश्न दर्शाता है',
      draftSaved: 'ड्राफ्ट सहेजा गया',
    },

    progress: {
      stepOf: (current: number, total: number) => `${total} में से ${current} चरण:`,
      completed: '% पूर्ण',
      steps: [
        { title: 'संस्था जानकारी', shortTitle: 'संस्था' },
        { title: 'सुविधा विवरण', shortTitle: 'सुविधा' },
        { title: 'दस्तावेज़ अपलोड', shortTitle: 'दस्तावेज़' },
        { title: 'शर्तें और घोषणा', shortTitle: 'शर्तें' },
      ],
    },

    nav: {
      back: 'वापस',
      next: 'अगला',
      submit: 'जमा करें',
      submitting: 'जमा हो रहा है...',
      pageOf: (current: number, total: number) => `${total} में से ${current} पृष्ठ`,
      confirmReset: 'क्या आप सुनिश्चित हैं? सभी भरी हुई जानकारी हटाना चाहते हैं?',
    },

    footer: {
      rights: (year: number) =>
        `© ${year} विज़न55 मेगाकेयर प्राइवेट लिमिटेड। सर्वाधिकार सुरक्षित।`,
      tagline: 'merabetta.com • वरिष्ठ नागरिक आवास और स्वास्थ्यसेवा मंच',
    },

    s1: {
      sectionLabel: '4 में से खंड 1',
      title: 'संस्था जानकारी',
      subtitle: 'सामान्य विवरण, कानूनी संरचना और प्राथमिक संपर्क व्यक्ति।',

      cardGeneral: 'संस्था का सामान्य विवरण',
      homeName: 'वृद्धाश्रम का नाम',
      homeNamePlaceholder: 'उदा. आनंद आश्रम सीनियर केयर होम',

      registrationNumber: 'पंजीकरण संख्या',
      registrationNumberPlaceholder: 'उदा. MAH/PUN/1234/2018',

      yearEstablished: 'स्थापना वर्ष',
      yearEstablishedPlaceholder: 'उदा. 2012',

      orgType: 'संस्था का प्रकार',
      orgTypeOtherPlaceholder: 'संस्था का प्रकार बताएं (उदा. सोसाइटी / धारा 8)',
      orgTypes: {
        Government: 'सरकारी',
        Private: 'निजी',
        'Trust/NGO': 'ट्रस्ट/स्वयंसेवी संस्था',
        Other: 'अन्य',
      },

      cardAddress: 'स्थान और पता',
      fullAddress: 'पूर्ण पता',
      fullAddressPlaceholder: 'भवन का नाम, सड़क, लैंडमार्क, क्षेत्र',
      city: 'शहर',
      cityPlaceholder: 'उदा. पुणे',
      state: 'राज्य',
      statePlaceholder: 'उदा. महाराष्ट्र',
      pinCode: 'पिन कोड',
      pinCodePlaceholder: 'उदा. 411051',
      website: 'वेबसाइट (यदि उपलब्ध हो)',
      websitePlaceholder: 'https://www.example.com',

      cardContact: 'प्राथमिक संपर्क विवरण',
      contactPersonName: 'संपर्क व्यक्ति का नाम',
      contactPersonNamePlaceholder: 'प्रतिनिधि / ट्रस्टी का पूरा नाम',
      designation: 'पदनाम',
      designationPlaceholder: 'उदा. निदेशक / ट्रस्टी / प्रबंधक',
      mobileNumber: 'मोबाइल नंबर',
      mobileNumberPlaceholder: '9876543210',
      emailAddress: 'ईमेल पता',
      emailAddressPlaceholder: 'contact@oldagehome.com',
    },

    s2: {
      sectionLabel: '4 में से खंड 2',
      title: 'सुविधा विवरण और देखभाल सेवाएं',
      subtitle: 'निवासियों की क्षमता, स्वास्थ्य सहायता और जीवनशैली सुविधाएं।',

      cardCapacity: 'निवासी क्षमता और अधिभोग',
      totalCapacity: 'कुल निवासी क्षमता',
      totalCapacityPlaceholder: 'उदा. 50',
      currentResidents: 'वर्तमान कुल निवासी',
      currentResidentsPlaceholder: 'उदा. 35',
      activeResidents: 'सक्रिय निवासी',
      activeResidentsPlaceholder: 'उदा. 25',
      bedRiddenResidents: 'शय्याग्रस्त निवासी',
      bedRiddenResidentsPlaceholder: 'उदा. 10',

      cardMedical: 'उपलब्ध चिकित्सा सुविधाएं',
      selectAll: 'सभी लागू विकल्प चुनें',
      medicalFacilities: {
        doctorVisits: 'डॉक्टर विज़िट',
        nursingCare: 'नर्सिंग देखभाल (24/7 / समर्पित)',
        emergencyCare: 'आपातकालीन देखभाल / एम्बुलेंस',
        physiotherapy: 'फिजियोथेरेपी',
        other: 'अन्य चिकित्सा सुविधाएं',
      },
      otherMedicalPlaceholder:
        'अन्य चिकित्सा सुविधाएं बताएं (उदा. ऑक्सीजन सपोर्ट, ICU टाई-अप, डायलिसिस सेवा)',

      cardServices: 'प्रदान की जाने वाली सेवाएं',
      services: {
        assistedLiving: 'सहायता प्राप्त आवास',
        independentLiving: 'स्वतंत्र आवास',
        dementiaCare: 'मनोभ्रंश / अल्जाइमर देखभाल',
        palliativeCare: 'उपशामक देखभाल',
        dayCareServices: 'दिन देखभाल सेवाएं',
        meals: 'पौष्टिक अनुकूलित भोजन',
        recreationalActivities: 'मनोरंजन और सामाजिक गतिविधियां',
        other: 'अन्य सेवाएं',
      },
      otherServicesPlaceholder:
        'अन्य सेवाएं बताएं (उदा. योग और ध्यान, आध्यात्मिक दौरे, धुलाई सेवा)',
    },

    s3: {
      sectionLabel: '4 में से खंड 3',
      title: 'दस्तावेज़ और सत्यापन',
      subtitle: 'कानूनी दस्तावेज़ों, पहचान पत्रों और सुविधा मीडिया की सत्यापित प्रतियां अपलोड करें।',

      docGuidelines: 'दस्तावेज़ दिशानिर्देश:',
      docGuidelinesText:
        'स्पष्ट मोबाइल फोटो या PDF स्कैन स्वीकार किए जाते हैं। प्रति फ़ाइल अधिकतम आकार 15MB है। ये दस्तावेज़ मेरबेटा पर सक्रिय सूचीकरण से पहले सुरक्षित रूप से संग्रहीत और सत्यापित किए जाते हैं।',

      cardMandatory: 'अनिवार्य कानूनी और पहचान दस्तावेज़',
      cardMedia: 'सुविधा मीडिया और प्रमाणपत्र',

      docs: {
        registrationCertificate: 'संस्था पंजीकरण प्रमाणपत्र',
        registrationCertificateSub: 'ट्रस्ट डीड, सोसाइटी पंजीकरण, या निगमन प्रमाणपत्र',
        panCard: 'पैन कार्ड',
        panCardSub: 'संस्था का पैन कार्ड (या मालिक/ट्रस्टी का पैन)',
        gstCertificate: 'GST प्रमाणपत्र',
        gstCertificateSub: 'यदि आपकी संस्था पर लागू हो',
        addressProof: 'सुविधा का पता प्रमाण',
        addressProofSub: 'बिजली बिल, किराया समझौता, या संपत्ति कर रसीद',
        representativeIdProof: 'अधिकृत प्रतिनिधि पहचान प्रमाण',
        representativeIdProofSub: 'संपर्क व्यक्ति का आधार कार्ड, पासपोर्ट, या मतदाता पहचान पत्र',
        bankAccountDetails: 'बैंक खाता विवरण / रद्द चेक',
        bankAccountDetailsSub: 'सत्यापित वित्तीय रिकॉर्ड और भुगतान के लिए',
        facilityPhotographs: 'सुविधा के फोटो',
        facilityPhotographsSub:
          'कमरों, भोजन कक्ष, बगीचे, गतिविधि केंद्र और चिकित्सा कक्ष के फोटो अपलोड करें (.jpg, .png)',
        facilityVideo: 'सुविधा वीडियो टूर',
        facilityVideoSub: '.mp4, .mpg, या .mov प्रारूप में लघु वीडियो क्लिप',
        licensesCertificates: 'कोई भी संबंधित लाइसेंस / अग्नि NOC / खाद्य सुरक्षा',
        licensesCertificatesSub:
          'अग्नि सुरक्षा NOC, FSSAI प्रमाणपत्र, नैदानिक स्थापना लाइसेंस (यदि लागू हो)',
      },
    },

    s4: {
      sectionLabel: '4 में से खंड 4',
      title: 'व्यावसायिक शर्तें और घोषणा',
      subtitle: 'प्लेटफ़ॉर्म शुल्क, डिजिटल प्रचार लाभ और कानूनी घोषणा।',

      cardCommercial: 'प्लेटफ़ॉर्म व्यावसायिक शर्तें',
      term1Label: 'शर्त 1 • प्रवेश शुल्क',
      term1Title: 'पहले बिल पर 10% + GST',
      term1Body:
        'विज़न55 मेगाकेयर प्रा. लि. के माध्यम से सफलतापूर्वक प्रवेश पाने वाले प्रत्येक निवासी के लिए एकमुश्त नाममात्र शुल्क 10% + GST, जो प्लेटफ़ॉर्म सेवा शुल्क की ओर पहले महीने के बिल पर आकलित किया जाता है।',
      term1Footer: 'केवल सफल प्रवेश पर देय',

      term2Label: 'शर्त 2 • प्लेटफ़ॉर्म सदस्यता',
      term2Title: '₹299 / माह',
      term2Body:
        'मेरबेटा वेबसाइट और मोबाइल ऐप पर रिक्ति जानकारी की वास्तविक समय में अपडेटिंग, निवासियों की गतिविधियों को उजागर करने और अधिक दर्शकों के लिए समर्पित डिजिटल मीडिया प्रचार के लिए ₹299 प्रति माह नाममात्र सदस्यता शुल्क।',
      term2Footer: 'वेबसाइट, ऐप और सोशल पहुंच शामिल',

      commercialCheckLabel:
        'मैंने ऊपर उल्लिखित व्यावसायिक शर्तों को पढ़ा, समझा और सहमति दी है।',
      commercialCheckSub:
        'ये शर्तें विज़न55 मेगाकेयर प्रा. लि. और आपकी सुविधा के बीच भागीदारी को नियंत्रित करेंगी।',

      cardDeclaration: 'कानूनी घोषणा और समझौता',
      declaration1:
        '1. मैं एतद्द्वारा घोषित करता/करती हूं कि ऊपर दी गई जानकारी मेरी सर्वोत्तम जानकारी के अनुसार सत्य और सटीक है। मैं समझता/समझती हूं कि पंजीकरण स्वीकृत करने से पहले प्लेटफ़ॉर्म (विज़न55 मेगाकेयर प्रा. लि. / merabetta.com) प्रस्तुत जानकारी की जांच कर सकता है।',
      declaration2:
        '2. मैं प्लेटफ़ॉर्म की नीतियों, उपयोग की शर्तों, गुणवत्ता मानकों और सभी लागू स्वास्थ्य देखभाल और बुजुर्ग देखभाल विनियमों का पालन करने के लिए सहमत हूं।',
      declaration3: 'सभी कानूनी मामले पुणे न्यायिक क्षेत्र के अधीन हैं।',
      declarationCheckLabel:
        'मैं पुष्टि करता/करती हूं कि मैं एक अधिकृत हस्ताक्षरकर्ता हूं और इस घोषणा में बताई गई सभी शर्तों से सहमत हूं।',
    },

    success: {
      badge: 'आवेदन सफलतापूर्वक जमा हुआ',
      title: 'नामांकन प्राप्त हुआ!',
      body: (homeName: string) =>
        `विज़न55 मेगाकेयर प्रा. लि. (merabetta.com) के साथ ${homeName} को नामांकित करने के लिए धन्यवाद। हमारी टीम प्रस्तुत विवरणों की समीक्षा करेगी और सक्रिय ऑनबोर्डिंग के लिए आपसे संपर्क करेगी।`,
      newForm: 'एक और वृद्धाश्रम फॉर्म जमा करें',
    },

    upload: {
      clickToBrowse: 'ब्राउज़ करने के लिए क्लिक करें',
      orDragDrop: 'या खींचें और छोड़ें',
      formats: 'प्रारूप:',
      max: 'अधिकतम',
      attached: 'संलग्न',
      fileTooLarge: (name: string, max: number) =>
        `"${name}" फ़ाइल ${max}MB की अधिकतम सीमा से बड़ी है।`,
    },

    errors: {
      homeName: 'कृपया वृद्धाश्रम का नाम दर्ज करें।',
      registrationNumber: 'पंजीकरण संख्या आवश्यक है।',
      yearEstablished: 'स्थापना वर्ष आवश्यक है।',
      address: 'पूर्ण पता आवश्यक है।',
      city: 'शहर आवश्यक है।',
      state: 'राज्य आवश्यक है।',
      pinCode: 'वैध 6 अंकीय पिन कोड आवश्यक है।',
      contactPersonName: 'संपर्क व्यक्ति का नाम आवश्यक है।',
      designation: 'पदनाम आवश्यक है।',
      mobileNumber: 'वैध 10 अंकीय मोबाइल नंबर आवश्यक है।',
      emailAddress: 'वैध ईमेल पता आवश्यक है।',
      totalCapacity: 'कृपया वैध कुल क्षमता दर्ज करें।',
      currentResidents: 'कृपया वर्तमान निवासियों की वैध संख्या दर्ज करें।',
      commercialAgreed: 'आगे बढ़ने के लिए आपको व्यावसायिक शर्तें स्वीकार करनी होंगी।',
      declarationAgreed: 'आपको घोषणा की पुष्टि और सहमति देनी होगी।',
    },
  },
} satisfies TranslationMap;

export type Translations = typeof translations.en;
export type TranslationKey = keyof Translations;

export default translations;
