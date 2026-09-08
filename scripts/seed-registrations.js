const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(uri);

const registrations = [
  {
    referenceId: "MB-OAH-691283",
    createdAt: new Date("2026-09-01T13:01:38.953Z"),
    homeName: "Sunshine Senior Living & Care",
    registrationNumber: "REG/2026/OAH-9842",
    yearEstablished: "2018",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "Plot 42, Sunrise Greens Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400050",
    website: "https://sunshineseniorliving.com",
    contactPersonName: "Rajesh Kumar Sharma",
    designation: "Managing Director",
    mobileNumber: "9876543210",
    emailAddress: "info@sunshineseniorliving.com",

    totalCapacity: "50",
    currentResidents: "38",
    activeResidents: "30",
    bedRiddenResidents: "8",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: true,
      otherDetails: "24/7 Ambulance on Standby"
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: true,
      otherDetails: "Yoga & Meditation classes"
    },

    facilityPricing: {
      assistedLiving: {
        from: "15000",
        to: "20000"
      },
      independentLiving: {
        from: "20000",
        to: "30000"
      },
      dementiaCare: {
        from: "25000",
        to: "35000"
      },
      palliativeCare: {
        from: "30000",
        to: "40000"
      },
      homeHospital: {
        from: "3000",
        to: "8000"
      },
      dayCareServices: {
        from: "3000",
        to: "6000"
      },
      meals: {
        from: "3000",
        to: "5000"
      },
      recreationalActivities: {
        from: "1000",
        to: "3000"
      }
    },

    documents: {
      registrationCertificate: {
        id: "doc-101",
        name: "registration_certificate_2026.pdf",
        size: 1024500,
        type: "application/pdf",
        uploadedAt: "2026-09-01T13:01:38.953Z"
      },
      panCard: {
        id: "doc-102",
        name: "pan_card_company.pdf",
        size: 512000,
        type: "application/pdf",
        uploadedAt: "2026-09-01T13:01:38.956Z"
      },
      gstCertificate: {
        id: "doc-103",
        name: "gst_certificate.pdf",
        size: 750000,
        type: "application/pdf",
        uploadedAt: "2026-09-01T13:01:38.956Z"
      },
      addressProof: {
        id: "doc-104",
        name: "electricity_bill_latest.pdf",
        size: 320000,
        type: "application/pdf",
        uploadedAt: "2026-09-01T13:01:38.956Z"
      },
      representativeIdProof: {
        id: "doc-105",
        name: "director_id_proof.pdf",
        size: 450000,
        type: "application/pdf",
        uploadedAt: "2026-09-01T13:01:38.956Z"
      },
      bankAccountDetails: {
        id: "doc-106",
        name: "cancelled_cheque.pdf",
        size: 290000,
        type: "application/pdf",
        uploadedAt: "2026-09-01T13:01:38.956Z"
      },
      facilityPhotographs: [
        {
          id: "doc-107",
          name: "facility_front_view.jpg",
          size: 2100000,
          type: "image/jpeg",
          uploadedAt: "2026-09-01T13:01:38.956Z"
        },
        {
          id: "doc-108",
          name: "resident_room.jpg",
          size: 1950000,
          type: "image/jpeg",
          uploadedAt: "2026-09-01T13:01:38.956Z"
        }
      ],
      facilityVideo: {
        id: "doc-109",
        name: "facility_virtual_tour.mp4",
        size: 15400000,
        type: "video/mp4",
        uploadedAt: "2026-09-01T13:01:38.956Z"
      },
      licensesCertificates: [
        {
          id: "doc-110",
          name: "fire_safety_noc.pdf",
          size: 890000,
          type: "application/pdf",
          uploadedAt: "2026-09-01T13:01:38.956Z"
        }
      ]
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-01",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-735214",
    createdAt: new Date("2026-09-02T09:15:20.000Z"),
    homeName: "Golden Years Care Home",
    registrationNumber: "REG/2026/OAH-7351",
    yearEstablished: "2016",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "12 Lake View Road, Powai",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400076",
    website: "https://goldenyearscare.example.com",
    contactPersonName: "Anita Deshmukh",
    designation: "Director",
    mobileNumber: "9823456712",
    emailAddress: "contact@goldenyears.example.com",

    totalCapacity: "60",
    currentResidents: "45",
    activeResidents: "36",
    bedRiddenResidents: "9",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: false,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "16000", to: "22000" },
      independentLiving: { from: "18000", to: "25000" },
      dementiaCare: { from: "25000", to: "35000" },
      palliativeCare: { from: "", to: "" },
      homeHospital: { from: "4000", to: "8000" },
      dayCareServices: { from: "3000", to: "6000" },
      meals: { from: "2500", to: "4500" },
      recreationalActivities: { from: "1000", to: "2500" }
    },

    documents: {
      registrationCertificate: {
        id: "doc-201",
        name: "registration_certificate.pdf",
        size: 950000,
        type: "application/pdf",
        uploadedAt: "2026-09-02T09:15:20.000Z"
      },
      panCard: {
        id: "doc-202",
        name: "pan_card.pdf",
        size: 500000,
        type: "application/pdf",
        uploadedAt: "2026-09-02T09:15:20.000Z"
      },
      gstCertificate: {
        id: "doc-203",
        name: "gst_certificate.pdf",
        size: 720000,
        type: "application/pdf",
        uploadedAt: "2026-09-02T09:15:20.000Z"
      },
      addressProof: {
        id: "doc-204",
        name: "address_proof.pdf",
        size: 310000,
        type: "application/pdf",
        uploadedAt: "2026-09-02T09:15:20.000Z"
      },
      representativeIdProof: {
        id: "doc-205",
        name: "director_id.pdf",
        size: 430000,
        type: "application/pdf",
        uploadedAt: "2026-09-02T09:15:20.000Z"
      },
      bankAccountDetails: {
        id: "doc-206",
        name: "bank_details.pdf",
        size: 280000,
        type: "application/pdf",
        uploadedAt: "2026-09-02T09:15:20.000Z"
      },
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-02",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-482916",
    createdAt: new Date("2026-09-02T11:30:00.000Z"),
    homeName: "Peaceful Haven Elder Care",
    registrationNumber: "REG/2026/OAH-4829",
    yearEstablished: "2015",
    organizationType: "Trust",
    organizationTypeOther: "",
    address: "88 Green Valley Road, Kothrud",
    city: "Pune",
    state: "Maharashtra",
    pinCode: "411038",
    website: "",
    contactPersonName: "Meena Kulkarni",
    designation: "Trust Secretary",
    mobileNumber: "9765432189",
    emailAddress: "info@peacefulhaven.example.com",
    totalCapacity: "40",
    currentResidents: "29",
    activeResidents: "24",
    bedRiddenResidents: "5",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: false,
      dementiaCare: false,
      palliativeCare: true,
      dayCareServices: false,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "12000", to: "18000" },
      independentLiving: { from: "", to: "" },
      dementiaCare: { from: "", to: "" },
      palliativeCare: { from: "18000", to: "25000" },
      homeHospital: { from: "3000", to: "6000" },
      dayCareServices: { from: "", to: "" },
      meals: { from: "2000", to: "3500" },
      recreationalActivities: { from: "500", to: "1500" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-02",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-319754",
    createdAt: new Date("2026-09-03T08:45:00.000Z"),
    homeName: "Silver Oak Assisted Living",
    registrationNumber: "REG/2026/OAH-3197",
    yearEstablished: "2020",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "21 Riverside Avenue, Baner",
    city: "Pune",
    state: "Maharashtra",
    pinCode: "411045",
    website: "https://silveroak.example.com",
    contactPersonName: "Amit Joshi",
    designation: "Operations Manager",
    mobileNumber: "9898981234",
    emailAddress: "admin@silveroak.example.com",
    totalCapacity: "70",
    currentResidents: "52",
    activeResidents: "44",
    bedRiddenResidents: "8",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: true,
      otherDetails: "Telemedicine support"
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "18000", to: "26000" },
      independentLiving: { from: "22000", to: "32000" },
      dementiaCare: { from: "25000", to: "38000" },
      palliativeCare: { from: "28000", to: "40000" },
      homeHospital: { from: "4000", to: "9000" },
      dayCareServices: { from: "4000", to: "7000" },
      meals: { from: "3000", to: "5000" },
      recreationalActivities: { from: "1000", to: "3000" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-03",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-847362",
    createdAt: new Date("2026-09-03T10:20:00.000Z"),
    homeName: "CareNest Senior Residence",
    registrationNumber: "REG/2026/OAH-8473",
    yearEstablished: "2019",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "15 Palm Grove Road, Aundh",
    city: "Pune",
    state: "Maharashtra",
    pinCode: "411007",
    website: "",
    contactPersonName: "Neha Patil",
    designation: "Facility Manager",
    mobileNumber: "9812345670",
    emailAddress: "contact@carenest.example.com",
    totalCapacity: "45",
    currentResidents: "31",
    activeResidents: "27",
    bedRiddenResidents: "4",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: false,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: false,
      palliativeCare: false,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "14000", to: "20000" },
      independentLiving: { from: "18000", to: "24000" },
      dementiaCare: { from: "", to: "" },
      palliativeCare: { from: "", to: "" },
      homeHospital: { from: "3000", to: "6000" },
      dayCareServices: { from: "2500", to: "5000" },
      meals: { from: "2000", to: "3500" },
      recreationalActivities: { from: "500", to: "1500" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-03",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-526481",
    createdAt: new Date("2026-09-04T07:50:00.000Z"),
    homeName: "Tranquil Life Senior Home",
    registrationNumber: "REG/2026/OAH-5264",
    yearEstablished: "2017",
    organizationType: "NGO",
    organizationTypeOther: "",
    address: "9 Heritage Lane, Nashik Road",
    city: "Nashik",
    state: "Maharashtra",
    pinCode: "422101",
    website: "",
    contactPersonName: "Sanjay More",
    designation: "Trustee",
    mobileNumber: "9753124680",
    emailAddress: "admin@tranquillife.example.com",
    totalCapacity: "35",
    currentResidents: "27",
    activeResidents: "22",
    bedRiddenResidents: "5",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: false,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: false,
      dementiaCare: false,
      palliativeCare: true,
      dayCareServices: false,
      meals: true,
      recreationalActivities: true,
      other: true,
      otherDetails: "Community outings"
    },

    facilityPricing: {
      assistedLiving: { from: "10000", to: "16000" },
      independentLiving: { from: "", to: "" },
      dementiaCare: { from: "", to: "" },
      palliativeCare: { from: "15000", to: "22000" },
      homeHospital: { from: "2500", to: "5000" },
      dayCareServices: { from: "", to: "" },
      meals: { from: "1500", to: "3000" },
      recreationalActivities: { from: "500", to: "1200" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-04",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-913527",
    createdAt: new Date("2026-09-04T12:10:00.000Z"),
    homeName: "Evergreen Elder Care",
    registrationNumber: "REG/2026/OAH-9135",
    yearEstablished: "2021",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "18 Garden City Road, Thane West",
    city: "Thane",
    state: "Maharashtra",
    pinCode: "400601",
    website: "https://evergreeneldercare.example.com",
    contactPersonName: "Priya Nair",
    designation: "Director",
    mobileNumber: "9867012345",
    emailAddress: "info@evergreeneldercare.example.com",
    totalCapacity: "55",
    currentResidents: "41",
    activeResidents: "34",
    bedRiddenResidents: "7",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: false,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "17000", to: "24000" },
      independentLiving: { from: "20000", to: "28000" },
      dementiaCare: { from: "24000", to: "34000" },
      palliativeCare: { from: "", to: "" },
      homeHospital: { from: "3500", to: "7500" },
      dayCareServices: { from: "3000", to: "5500" },
      meals: { from: "2500", to: "4500" },
      recreationalActivities: { from: "1000", to: "2500" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-04",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-284619",
    createdAt: new Date("2026-09-05T08:30:00.000Z"),
    homeName: "Serene Hearts Old Age Home",
    registrationNumber: "REG/2026/OAH-2846",
    yearEstablished: "2014",
    organizationType: "Trust",
    organizationTypeOther: "",
    address: "7 Temple Road, Viman Nagar",
    city: "Pune",
    state: "Maharashtra",
    pinCode: "411014",
    website: "",
    contactPersonName: "Vijay Deshpande",
    designation: "Trustee",
    mobileNumber: "9797974545",
    emailAddress: "office@serenehearts.example.com",
    totalCapacity: "30",
    currentResidents: "22",
    activeResidents: "18",
    bedRiddenResidents: "4",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: false,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: false,
      dementiaCare: false,
      palliativeCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "11000", to: "17000" },
      independentLiving: { from: "", to: "" },
      dementiaCare: { from: "", to: "" },
      palliativeCare: { from: "16000", to: "23000" },
      homeHospital: { from: "2500", to: "5000" },
      dayCareServices: { from: "2000", to: "4000" },
      meals: { from: "1500", to: "2800" },
      recreationalActivities: { from: "500", to: "1200" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-05",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-671845",
    createdAt: new Date("2026-09-05T10:00:00.000Z"),
    homeName: "Harmony Senior Residence",
    registrationNumber: "REG/2026/OAH-6718",
    yearEstablished: "2022",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "55 Hill View Road, Nagpur",
    city: "Nagpur",
    state: "Maharashtra",
    pinCode: "440010",
    website: "",
    contactPersonName: "Rohit Verma",
    designation: "General Manager",
    mobileNumber: "9887654321",
    emailAddress: "hello@harmonyresidence.example.com",
    totalCapacity: "65",
    currentResidents: "48",
    activeResidents: "40",
    bedRiddenResidents: "8",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: true,
      otherDetails: "Nutritionist consultation"
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "18000", to: "27000" },
      independentLiving: { from: "22000", to: "32000" },
      dementiaCare: { from: "26000", to: "38000" },
      palliativeCare: { from: "30000", to: "42000" },
      homeHospital: { from: "4000", to: "9000" },
      dayCareServices: { from: "3500", to: "7000" },
      meals: { from: "3000", to: "5000" },
      recreationalActivities: { from: "1000", to: "3000" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-05",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-458231",
    createdAt: new Date("2026-09-05T13:40:00.000Z"),
    homeName: "Blessed Care Assisted Living",
    registrationNumber: "REG/2026/OAH-4582",
    yearEstablished: "2019",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "33 Station Road, Kolhapur",
    city: "Kolhapur",
    state: "Maharashtra",
    pinCode: "416003",
    website: "",
    contactPersonName: "Sunita Pawar",
    designation: "Administrator",
    mobileNumber: "9834567120",
    emailAddress: "admin@blessedcare.example.com",
    totalCapacity: "40",
    currentResidents: "26",
    activeResidents: "21",
    bedRiddenResidents: "5",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: false,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: false,
      palliativeCare: false,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "13000", to: "19000" },
      independentLiving: { from: "17000", to: "23000" },
      dementiaCare: { from: "", to: "" },
      palliativeCare: { from: "", to: "" },
      homeHospital: { from: "2500", to: "5000" },
      dayCareServices: { from: "2500", to: "4500" },
      meals: { from: "2000", to: "3500" },
      recreationalActivities: { from: "500", to: "1500" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-05",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-392716",
    createdAt: new Date("2026-09-06T09:25:00.000Z"),
    homeName: "Aarogyam Senior Care",
    registrationNumber: "REG/2026/OAH-3927",
    yearEstablished: "2020",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "10 Wellness Park, Aurangabad",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    pinCode: "431001",
    website: "",
    contactPersonName: "Kiran Shinde",
    designation: "Director",
    mobileNumber: "9871234560",
    emailAddress: "info@aarogyamcare.example.com",
    totalCapacity: "50",
    currentResidents: "35",
    activeResidents: "29",
    bedRiddenResidents: "6",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: false,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: true,
      otherDetails: "Ayurvedic wellness sessions"
    },

    facilityPricing: {
      assistedLiving: { from: "15000", to: "22000" },
      independentLiving: { from: "19000", to: "28000" },
      dementiaCare: { from: "23000", to: "33000" },
      palliativeCare: { from: "", to: "" },
      homeHospital: { from: "3000", to: "7000" },
      dayCareServices: { from: "3000", to: "5500" },
      meals: { from: "2200", to: "4000" },
      recreationalActivities: { from: "800", to: "2000" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-06",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-815463",
    createdAt: new Date("2026-09-06T11:15:00.000Z"),
    homeName: "Comfort Age Care Center",
    registrationNumber: "REG/2026/OAH-8154",
    yearEstablished: "2013",
    organizationType: "Trust",
    organizationTypeOther: "",
    address: "24 Central Avenue, Satara",
    city: "Satara",
    state: "Maharashtra",
    pinCode: "415001",
    website: "",
    contactPersonName: "Mahesh Jadhav",
    designation: "Trust Secretary",
    mobileNumber: "9768123456",
    emailAddress: "office@comfortage.example.com",
    totalCapacity: "32",
    currentResidents: "24",
    activeResidents: "19",
    bedRiddenResidents: "5",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: false,
      physiotherapy: true,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: false,
      dementiaCare: false,
      palliativeCare: true,
      dayCareServices: false,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "10000", to: "15000" },
      independentLiving: { from: "", to: "" },
      dementiaCare: { from: "", to: "" },
      palliativeCare: { from: "14000", to: "20000" },
      homeHospital: { from: "2000", to: "4500" },
      dayCareServices: { from: "", to: "" },
      meals: { from: "1500", to: "2800" },
      recreationalActivities: { from: "500", to: "1000" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-06",
    status: "submitted"
  },

  {
    referenceId: "MB-OAH-604928",
    createdAt: new Date("2026-09-06T14:30:00.000Z"),
    homeName: "Green Meadows Elder Living",
    registrationNumber: "REG/2026/OAH-6049",
    yearEstablished: "2021",
    organizationType: "Private",
    organizationTypeOther: "",
    address: "41 Meadows Road, Mira Road",
    city: "Thane",
    state: "Maharashtra",
    pinCode: "401107",
    website: "",
    contactPersonName: "Deepa Iyer",
    designation: "Managing Partner",
    mobileNumber: "9822012345",
    emailAddress: "contact@greenmeadows.example.com",
    totalCapacity: "58",
    currentResidents: "42",
    activeResidents: "35",
    bedRiddenResidents: "7",

    medicalFacilities: {
      doctorVisits: true,
      nursingCare: true,
      emergencyCare: true,
      physiotherapy: true,
      other: true,
      otherDetails: "Dietitian services"
    },

    servicesOffered: {
      assistedLiving: true,
      independentLiving: true,
      dementiaCare: true,
      palliativeCare: true,
      dayCareServices: true,
      meals: true,
      recreationalActivities: true,
      other: false,
      otherDetails: ""
    },

    facilityPricing: {
      assistedLiving: { from: "17000", to: "25000" },
      independentLiving: { from: "21000", to: "30000" },
      dementiaCare: { from: "25000", to: "36000" },
      palliativeCare: { from: "28000", to: "40000" },
      homeHospital: { from: "3500", to: "8000" },
      dayCareServices: { from: "3000", to: "6000" },
      meals: { from: "2500", to: "4500" },
      recreationalActivities: { from: "1000", to: "2500" }
    },

    documents: {
      registrationCertificate: null,
      panCard: null,
      gstCertificate: null,
      addressProof: null,
      representativeIdProof: null,
      bankAccountDetails: null,
      facilityPhotographs: [],
      facilityVideo: null,
      licensesCertificates: []
    },

    commercialAgreed: true,
    declarationAgreed: true,
    submissionDate: "2026-09-06",
    status: "submitted"
  }
];

async function seedRegistrations() {
  try {
    await client.connect();

    const db = client.db("merabetta");

    const collection = db.collection(
      "old age home registration"
    );

    console.log(
      `Preparing to insert ${registrations.length} registrations...`
    );

    const existingReferences = await collection
      .find(
        {
          referenceId: {
            $in: registrations.map(
              (registration) => registration.referenceId
            )
          }
        },
        {
          projection: {
            referenceId: 1
          }
        }
      )
      .toArray();

    const existingIds = new Set(
      existingReferences.map(
        (registration) => registration.referenceId
      )
    );

    const newRegistrations = registrations.filter(
      (registration) =>
        !existingIds.has(registration.referenceId)
    );

    if (newRegistrations.length === 0) {
      console.log(
        "All seed registrations already exist. Nothing to insert."
      );
      return;
    }

    const result = await collection.insertMany(
      newRegistrations
    );

    console.log(
      `Successfully inserted ${result.insertedCount} registrations.`
    );

    console.log(
      "Reference IDs:"
    );

    newRegistrations.forEach((registration) => {
      console.log(
        `- ${registration.referenceId} | ${registration.homeName}`
      );
    });
  } catch (error) {
    console.error(
      "Seed failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedRegistrations();