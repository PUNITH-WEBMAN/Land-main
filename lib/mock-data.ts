// Karnataka location data for cascading dropdowns
export const karnatakaData = {
  districts: [
    { id: "bengaluru-urban", name: "BENGALURU" },
    { id: "bengaluru-rural", name: "Bengaluru Rural" },
    { id: "ramanagara", name: "Ramanagara" },
    { id: "mysuru", name: "Mysuru" },
  ],
  taluks: {
    "bengaluru-urban": [
      { id: "yelahanka", name: "Yelahanka" },
      { id: "anekal", name: "Anekal" },
      { id: "bangalore-north", name: "Bangalore North" },
      { id: "bangalore-south", name: "Bangalore South" },
    ],
    "bengaluru-rural": [
      { id: "devanahalli", name: "Devanahalli" },
      { id: "doddaballapura", name: "Doddaballapura" },
      { id: "hosakote", name: "Hosakote" },
      { id: "nelamangala", name: "Nelamangala" },
    ],
    ramanagara: [
      { id: "ramanagara", name: "Ramanagara" },
      { id: "channapatna", name: "Channapatna" },
      { id: "magadi", name: "Magadi" },
      { id: "kanakapura", name: "Kanakapura" },
    ],
    mysuru: [
      { id: "mysuru", name: "Mysuru" },
      { id: "hunsur", name: "Hunsur" },
      { id: "nanjangud", name: "Nanjangud" },
      { id: "t-narasipura", name: "T. Narasipura" },
    ],
  },
  hoblis: {
    yelahanka: [
      { id: "kasaba", name: "Kasaba" },
      { id: "yelahanka", name: "Yelahanka" },
    ],
    anekal: [
      { id: "kasaba-anekal", name: "Kasaba" },
      { id: "sarjapur", name: "Sarjapur" },
      { id: "jigani", name: "Jigani" },
    ],
    "bangalore-north": [
      { id: "varthur", name: "Varthur" },
      { id: "krishnarajapura", name: "Krishnarajapura" },
    ],
    "bangalore-south": [
      { id: "begur", name: "Begur" },
      { id: "uttarahalli", name: "Uttarahalli" },
    ],
    devanahalli: [
      { id: "kasaba-devanahalli", name: "Kasaba" },
      { id: "vijayapura", name: "Vijayapura" },
    ],
    hosakote: [
      { id: "kasaba-hosakote", name: "Kasaba" },
      { id: "anugondanahalli", name: "Anugondanahalli" },
    ],
    ramanagara: [{ id: "kasaba-ramanagara", name: "Kasaba" }],
    channapatna: [{ id: "kasaba-channapatna", name: "Kasaba" }],
    mysuru: [
      { id: "kasaba-mysuru", name: "Kasaba" },
      { id: "jayapura", name: "Jayapura" },
    ],
  },
  villages: {
    kasaba: [
      { id: "allalasandra", name: "Allalasandra" },
      { id: "jakkur", name: "Jakkur" },
      { id: "thanisandra", name: "Thanisandra" },
    ],
    varthur: [
      { id: "gunjur", name: "Gunjur" },
      { id: "bellandur", name: "Bellandur" },
      { id: "varthur", name: "Varthur" },
      { id: "carmelaram", name: "Carmelaram" },
    ],
    sarjapur: [
      { id: "sarjapur", name: "Sarjapur" },
      { id: "dommasandra", name: "Dommasandra" },
      { id: "chandapura", name: "Chandapura" },
    ],
    "kasaba-anekal": [
      { id: "anekal", name: "Anekal" },
      { id: "attibele", name: "Attibele" },
    ],
    jigani: [
      { id: "jigani", name: "Jigani" },
      { id: "bommasandra", name: "Bommasandra" },
    ],
    begur: [
      { id: "begur", name: "Begur" },
      { id: "singasandra", name: "Singasandra" },
    ],
    uttarahalli: [
      { id: "anjanapura", name: "Anjanapura" },
      { id: "alahalli", name: "ALAHALLI" },
    ],
    "kasaba-devanahalli": [{ id: "devanahalli", name: "Devanahalli" }],
    "kasaba-mysuru": [{ id: "mysuru-city", name: "Mysuru City" }],
  },
  areas: [
    { id: "bengaluru", name: "BENGALURU" },
    { id: "bangalore-south", name: "bangalore-South" },
    { id: "uttarahalli-1", name: "UTTARAHALLI -1" },
    { id: "anjanapura", name: "Anjanapura" },
    { id: "alahalli", name: "ALAHALLI" },
  ],
}

// Property data mock
export interface PropertyData {
  surveyNumber: string
  ownerName: string
  fatherName: string
  extent: {
    acres: number
    guntas: number
  }
  soilType: string
  zone: string
  zoneColor: string
  khataNumber: string
  mutationDate: string
  marketValue: number
  isDisputed: boolean
  litigationDetails?: {
    caseNumber: string
    court: string
    reason: string
    filingDate: string
    status: string
    action: string
  }
  coordinates: [number, number][]
  center: [number, number]
  nearbyLandmarks: NearbyLandmark[]
  ownershipHistory: OwnershipRecord[]
  heatMapIntensity: number // 0-100 for property value heat
  roadAccess: string
  waterSource: string
  electricityStatus: string
}

export const getPropertyData = (surveyNumber: string): PropertyData | null => {
  // Clean survey for "45/2"
  if (surveyNumber === "45/2") {
    return {
      surveyNumber: "45/2",
      ownerName: "Ramesh Kumar Gowda",
      fatherName: "Late Krishnappa Gowda",
      extent: {
        acres: 2,
        guntas: 15,
      },
      soilType: "Red Soil (Laterite)",
      zone: "Yellow Zone - Residential",
      zoneColor: "yellow",
      khataNumber: "KHT-2024-78542",
      mutationDate: "15-Mar-2022",
      marketValue: 45000000,
      isDisputed: false,
      coordinates: [
        [12.9698, 77.7499],
        [12.9698, 77.752],
        [12.9675, 77.752],
        [12.9675, 77.7499],
      ],
      center: [12.9686, 77.751],
      nearbyLandmarks: [
        { name: "Kempegowda International Airport", type: "airport", distance: 18.5, direction: "North" },
        { name: "Bellandur Lake", type: "lake", distance: 3.2, direction: "South-West" },
        { name: "Manipal Hospital Whitefield", type: "hospital", distance: 4.1, direction: "West" },
        { name: "Whitefield Railway Station", type: "railway", distance: 5.8, direction: "North-West" },
        { name: "Outer Ring Road", type: "highway", distance: 1.2, direction: "West" },
        { name: "Delhi Public School", type: "school", distance: 2.5, direction: "South" },
        { name: "ISKCON Temple Whitefield", type: "temple", distance: 3.8, direction: "North" },
        { name: "Phoenix Marketcity", type: "market", distance: 6.2, direction: "West" },
      ],
      ownershipHistory: [
        {
          ownerName: "Ramesh Kumar Gowda",
          fatherName: "Late Krishnappa Gowda",
          acquiredDate: "15-Mar-2022",
          transferType: "Sale Deed",
          documentNumber: "BLR-SR-2022-45632",
          fromOwner: "Venkatesh Reddy",
        },
        {
          ownerName: "Venkatesh Reddy",
          fatherName: "Late Narayana Reddy",
          acquiredDate: "08-Jul-2015",
          transferType: "Inheritance",
          documentNumber: "BLR-MUT-2015-12345",
          fromOwner: "Late Narayana Reddy",
        },
        {
          ownerName: "Narayana Reddy",
          fatherName: "Late Subbaiah Reddy",
          acquiredDate: "22-Jan-1998",
          transferType: "Sale Deed",
          documentNumber: "BLR-SR-1998-7823",
          fromOwner: "Karnataka Housing Board",
        },
        {
          ownerName: "Karnataka Housing Board",
          fatherName: "-",
          acquiredDate: "01-Apr-1985",
          transferType: "Government Allotment",
          documentNumber: "KHB-ALLOT-1985-456",
        },
      ],
      heatMapIntensity: 85,
      roadAccess: "30 ft Asphalted Road (BDA Approved)",
      waterSource: "BWSSB Connection + Borewell",
      electricityStatus: "BESCOM - 3 Phase Connected",
    }
  }

  // Disputed land for "99/X"
  if (surveyNumber === "99/X") {
    return {
      surveyNumber: "99/X",
      ownerName: "Disputed - Multiple Claimants",
      fatherName: "Late Venkatappa (Original Holder)",
      extent: {
        acres: 3,
        guntas: 28,
      },
      soilType: "Red Soil (Laterite)",
      zone: "Green Zone - Agricultural",
      zoneColor: "green",
      khataNumber: "KHT-2019-45632",
      mutationDate: "08-Nov-2019",
      marketValue: 62000000,
      isDisputed: true,
      litigationDetails: {
        caseNumber: "OS-2024-892",
        court: "Civil Court, Bangalore Urban",
        reason: "Ancestral Property Claim / Partition Suit Pending",
        filingDate: "12-Jan-2024",
        status: "Stay Order Active",
        action: "Transaction Blocked by Sub-Registrar",
      },
      coordinates: [
        [12.955, 77.765],
        [12.955, 77.768],
        [12.952, 77.768],
        [12.952, 77.765],
      ],
      center: [12.9535, 77.7665],
      nearbyLandmarks: [
        { name: "Kempegowda International Airport", type: "airport", distance: 22.3, direction: "North" },
        { name: "Varthur Lake", type: "lake", distance: 1.8, direction: "East" },
        { name: "Columbia Asia Hospital", type: "hospital", distance: 5.5, direction: "West" },
        { name: "Carmelaram Railway Station", type: "railway", distance: 3.2, direction: "South" },
        { name: "Sarjapur Road", type: "highway", distance: 0.8, direction: "South" },
        { name: "Inventure Academy", type: "school", distance: 2.1, direction: "North" },
        { name: "Ayyappa Temple Varthur", type: "temple", distance: 1.5, direction: "East" },
        { name: "Total Mall Sarjapur", type: "market", distance: 4.8, direction: "South-West" },
      ],
      ownershipHistory: [
        {
          ownerName: "DISPUTED - Partition Pending",
          fatherName: "Late Venkatappa",
          acquiredDate: "08-Nov-2019",
          transferType: "Inheritance",
          documentNumber: "DISPUTED",
          fromOwner: "Late Venkatappa",
        },
        {
          ownerName: "Venkatappa",
          fatherName: "Late Chikkanna",
          acquiredDate: "15-May-1972",
          transferType: "Inheritance",
          documentNumber: "BLR-MUT-1972-3421",
          fromOwner: "Late Chikkanna",
        },
        {
          ownerName: "Chikkanna",
          fatherName: "Late Thimmaiah",
          acquiredDate: "01-Jan-1945",
          transferType: "Government Allotment",
          documentNumber: "MYSORE-INAM-1945-78",
        },
      ],
      heatMapIntensity: 72,
      roadAccess: "20 ft Mud Road (Unapproved)",
      waterSource: "Borewell Only",
      electricityStatus: "BESCOM - Single Phase",
    }
  }

  // Default mock data for any other survey number
  return {
    surveyNumber,
    ownerName: "Property Owner",
    fatherName: "Father's Name",
    extent: {
      acres: 1,
      guntas: 20,
    },
    soilType: "Black Cotton Soil",
    zone: "Yellow Zone - Mixed Use",
    zoneColor: "yellow",
    khataNumber: `KHT-2024-${Math.floor(Math.random() * 90000) + 10000}`,
    mutationDate: "01-Jan-2023",
    marketValue: 25000000,
    isDisputed: false,
    coordinates: [
      [12.9716, 77.5946],
      [12.9716, 77.597],
      [12.9695, 77.597],
      [12.9695, 77.5946],
    ],
    center: [12.9705, 77.5958],
    nearbyLandmarks: [
      { name: "Kempegowda International Airport", type: "airport", distance: 35.0, direction: "North" },
      { name: "Ulsoor Lake", type: "lake", distance: 2.5, direction: "East" },
      { name: "Fortis Hospital", type: "hospital", distance: 3.0, direction: "South" },
      { name: "Bangalore City Railway Station", type: "railway", distance: 4.5, direction: "West" },
    ],
    ownershipHistory: [
      {
        ownerName: "Property Owner",
        fatherName: "Father's Name",
        acquiredDate: "01-Jan-2023",
        transferType: "Sale Deed",
        documentNumber: "BLR-SR-2023-XXXXX",
      },
    ],
    heatMapIntensity: 60,
    roadAccess: "40 ft Main Road",
    waterSource: "BWSSB Connection",
    electricityStatus: "BESCOM Connected",
  }
}

// User mock data
export interface UserData {
  phone: string
  name: string
  aadhar: string
  role: "buyer" | "seller" | "agent"
  watchlist: string[]
  searchHistory: string[]
}

export const mockUser: UserData = {
  phone: "9876543210",
  name: "Test User",
  aadhar: "XXXX-XXXX-4321",
  role: "buyer",
  watchlist: ["45/2", "123/A", "78/B"],
  searchHistory: ["45/2", "99/X", "123/A", "99/X", "78/B"],
}

// Loading steps for terminal loader
export const loadingSteps = [
  { text: "Connecting to Bhoomi Database...", duration: 1200 },
  { text: "Fetching Vector Geometry from Dishank Server...", duration: 1500 },
  { text: "Analyzing Mutation Register...", duration: 1000 },
  { text: "Verifying Encumbrance Status...", duration: 800 },
  { text: "Loading Nearby Infrastructure Data...", duration: 600 },
  { text: "Generating Property Intelligence Report...", duration: 500 },
]

// Nearby landmarks data
export interface NearbyLandmark {
  name: string
  type: "airport" | "lake" | "hospital" | "railway" | "highway" | "school" | "temple" | "market"
  distance: number // in km
  direction: string
}

// Ownership history data
export interface OwnershipRecord {
  ownerName: string
  fatherName: string
  acquiredDate: string
  transferType: "Sale Deed" | "Gift Deed" | "Inheritance" | "Partition" | "Government Allotment"
  documentNumber: string
  fromOwner?: string
}
