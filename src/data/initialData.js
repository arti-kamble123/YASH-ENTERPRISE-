/**
 * YASH ENTERPRISE - Initial Seed Data
 * Rich realistic baseline records for Masters, Weighbridge Slips, and Delivery Notes
 */

export const initialCompanySettings = {
  companyName: "YASH ENTERPRISE",
  tagline: "Wholesale Grain, Fertilizer & Industrial Material Suppliers",
  address: "Plot No. 42, Industrial Area, Phase-II, Market Yard, Pune - 411037, Maharashtra",
  phone: "+91 98765 43210 / +91 94220 11223",
  email: "contact@yashenterprise.in",
  gstin: "27ABCDE1234F1Z5",
  weighbridgePrefix: "WB-2026-",
  deliveryNotePrefix: "DN-2026-",
  termsAndConditions: "1. Goods once sold will not be taken back.\n2. Weight measured on electronic weighbridge is final and binding.\n3. Subject to Pune jurisdiction only.",
  defaultA5Layout: "portrait"
};

export const initialMaterials = [
  {
    id: "mat-1",
    materialName: "RAJLAXMI 40 KG WHITE",
    bagWeightKg: 40,
    unit: "Bags",
    status: "Active",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z"
  },
  {
    id: "mat-2",
    materialName: "MAHALAXMI 50 KG PREMIUM",
    bagWeightKg: 50,
    unit: "Bags",
    status: "Active",
    createdAt: "2026-09-01T09:15:00.000Z",
    updatedAt: "2026-09-01T09:15:00.000Z"
  },
  {
    id: "mat-3",
    materialName: "ULTRA CEMENT 25 KG",
    bagWeightKg: 25,
    unit: "Bags",
    status: "Active",
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-09-02T10:00:00.000Z"
  },
  {
    id: "mat-4",
    materialName: "AGRO FEED 20 KG SPECIAL",
    bagWeightKg: 20,
    unit: "Bags",
    status: "Active",
    createdAt: "2026-09-02T11:00:00.000Z",
    updatedAt: "2026-09-02T11:00:00.000Z"
  },
  {
    id: "mat-5",
    materialName: "ORGANIC FERTILIZER 22.5 KG",
    bagWeightKg: 22.5,
    unit: "Bags",
    status: "Active",
    createdAt: "2026-09-03T14:30:00.000Z",
    updatedAt: "2026-09-03T14:30:00.000Z"
  },
  {
    id: "mat-6",
    materialName: "GOLDEN WHEAT 50 KG",
    bagWeightKg: 50,
    unit: "Bags",
    status: "Active",
    createdAt: "2026-09-05T08:45:00.000Z",
    updatedAt: "2026-09-05T08:45:00.000Z"
  }
];

export const initialParties = [
  {
    id: "pty-1",
    partyName: "Shree Ram Traders",
    contactNumber: "+91 98221 55443",
    address: "Shop 12, APMC Market Yard, Kolhapur - 416005",
    status: "Active",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z"
  },
  {
    id: "pty-2",
    partyName: "Mahalaxmi Agro & Feeds",
    contactNumber: "+91 94230 66778",
    address: "Gat No. 84, MIDC Shiroli, Sangli - 416416",
    status: "Active",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "pty-3",
    partyName: "Om Sai Industrial Logistics",
    contactNumber: "+91 97654 11229",
    address: "Sector 7, Chakan Industrial Park, Pune - 410501",
    status: "Active",
    createdAt: "2026-09-02T11:20:00.000Z",
    updatedAt: "2026-09-02T11:20:00.000Z"
  },
  {
    id: "pty-4",
    partyName: "Venkateshwara Trading Co.",
    contactNumber: "+91 98900 88776",
    address: "Near Old RTO, Station Road, Solapur - 413001",
    status: "Active",
    createdAt: "2026-09-03T12:00:00.000Z",
    updatedAt: "2026-09-03T12:00:00.000Z"
  },
  {
    id: "pty-5",
    partyName: "Kisan Agro Services",
    contactNumber: "+91 91580 33445",
    address: "Plot 19, Goods Shed Road, Nashik - 422001",
    status: "Active",
    createdAt: "2026-09-04T15:30:00.000Z",
    updatedAt: "2026-09-04T15:30:00.000Z"
  }
];

export const initialVehicles = [
  {
    id: "veh-1",
    vehicleNumber: "MH-12-RN-4589",
    driverName: "Ramesh Pawar",
    driverPhone: "+91 98220 77112",
    status: "Active",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z"
  },
  {
    id: "veh-2",
    vehicleNumber: "MH-14-GH-8821",
    driverName: "Sanjay Shinde",
    driverPhone: "+91 97631 88443",
    status: "Active",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "veh-3",
    vehicleNumber: "MH-09-CV-3145",
    driverName: "Prakash Jadhav",
    driverPhone: "+91 94211 99220",
    status: "Active",
    createdAt: "2026-09-02T11:00:00.000Z",
    updatedAt: "2026-09-02T11:00:00.000Z"
  },
  {
    id: "veh-4",
    vehicleNumber: "MH-20-EQ-6204",
    driverName: "Vijay More",
    driverPhone: "+91 98500 44331",
    status: "Active",
    createdAt: "2026-09-03T14:00:00.000Z",
    updatedAt: "2026-09-03T14:00:00.000Z"
  },
  {
    id: "veh-5",
    vehicleNumber: "MH-12-TK-9080",
    driverName: "Anil Kadam",
    driverPhone: "+91 99701 55667",
    status: "Active",
    createdAt: "2026-09-04T16:00:00.000Z",
    updatedAt: "2026-09-04T16:00:00.000Z"
  }
];

export const initialWeighbridgeEntries = [
  {
    id: "wb-001",
    slipNumber: "WB-2026-0001",
    date: "2026-10-01T09:30",
    partyId: "pty-1",
    partyName: "Shree Ram Traders",
    vehicleId: "veh-1",
    vehicleNumber: "MH-12-RN-4589",
    materialId: "mat-1",
    materialName: "RAJLAXMI 40 KG WHITE",
    bagWeightKg: 40,
    quantityBags: 500,
    quantityUnit: "Bags",
    tons: 20.0,
    grossWeightKg: 26500,
    tareWeightKg: 6500,
    netWeightKg: 20000,
    remarks: "Standard dispatch batch #01",
    createdAt: "2026-10-01T09:30:00.000Z",
    updatedAt: "2026-10-01T09:30:00.000Z"
  },
  {
    id: "wb-002",
    slipNumber: "WB-2026-0002",
    date: "2026-10-02T11:15",
    partyId: "pty-2",
    partyName: "Mahalaxmi Agro & Feeds",
    vehicleId: "veh-2",
    vehicleNumber: "MH-14-GH-8821",
    materialId: "mat-2",
    materialName: "MAHALAXMI 50 KG PREMIUM",
    bagWeightKg: 50,
    quantityBags: 400,
    quantityUnit: "Bags",
    tons: 20.0,
    grossWeightKg: 27200,
    tareWeightKg: 7200,
    netWeightKg: 20000,
    remarks: "Direct delivery to warehouse",
    createdAt: "2026-10-02T11:15:00.000Z",
    updatedAt: "2026-10-02T11:15:00.000Z"
  },
  {
    id: "wb-003",
    slipNumber: "WB-2026-0003",
    date: "2026-10-03T14:45",
    partyId: "pty-3",
    partyName: "Om Sai Industrial Logistics",
    vehicleId: "veh-3",
    vehicleNumber: "MH-09-CV-3145",
    materialId: "mat-3",
    materialName: "ULTRA CEMENT 25 KG",
    bagWeightKg: 25,
    quantityBags: 600,
    quantityUnit: "Bags",
    tons: 15.0,
    grossWeightKg: 21800,
    tareWeightKg: 6800,
    netWeightKg: 15000,
    remarks: "High strength cement consignment",
    createdAt: "2026-10-03T14:45:00.000Z",
    updatedAt: "2026-10-03T14:45:00.000Z"
  },
  {
    id: "wb-004",
    slipNumber: "WB-2026-0004",
    date: "2026-10-04T10:00",
    partyId: "pty-4",
    partyName: "Venkateshwara Trading Co.",
    vehicleId: "veh-4",
    vehicleNumber: "MH-20-EQ-6204",
    materialId: "mat-4",
    materialName: "AGRO FEED 20 KG SPECIAL",
    bagWeightKg: 20,
    quantityBags: 1000,
    quantityUnit: "Bags",
    tons: 20.0,
    grossWeightKg: 26800,
    tareWeightKg: 6800,
    netWeightKg: 20000,
    remarks: "Urgent shipment for livestock farm",
    createdAt: "2026-10-04T10:00:00.000Z",
    updatedAt: "2026-10-04T10:00:00.000Z"
  },
  {
    id: "wb-005",
    slipNumber: "WB-2026-0005",
    date: "2026-10-05T16:20",
    partyId: "pty-1",
    partyName: "Shree Ram Traders",
    vehicleId: "veh-5",
    vehicleNumber: "MH-12-TK-9080",
    materialId: "mat-6",
    materialName: "GOLDEN WHEAT 50 KG",
    bagWeightKg: 50,
    quantityBags: 300,
    quantityUnit: "Bags",
    tons: 15.0,
    grossWeightKg: 21400,
    tareWeightKg: 6400,
    netWeightKg: 15000,
    remarks: "Good moisture quality verified",
    createdAt: "2026-10-05T16:20:00.000Z",
    updatedAt: "2026-10-05T16:20:00.000Z"
  }
];

export const initialDeliveryNotes = [
  {
    id: "dn-001",
    deliveryNoteNumber: "DN-2026-0001",
    date: "2026-10-01",
    partyId: "pty-1",
    partyName: "Shree Ram Traders",
    vehicleId: "veh-1",
    vehicleNumber: "MH-12-RN-4589",
    driverPhone: "+91 98220 77112",
    freight: "To Pay (₹ 4,500)",
    deliveryLocation: "APMC Godown #4, Kolhapur",
    products: [
      {
        id: "p-1",
        particular: "RAJLAXMI 40 KG WHITE",
        bagWeightKg: 40,
        quantityBags: 500,
        unit: "Bags",
        totalWeightKg: 20000,
        tons: 20.0,
        remarks: "Fresh stock"
      }
    ],
    totalBags: 500,
    totalTons: 20.0,
    totalWeightKg: 20000,
    remarks: "Received in good condition with seal intact.",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z"
  },
  {
    id: "dn-002",
    deliveryNoteNumber: "DN-2026-0002",
    date: "2026-10-02",
    partyId: "pty-2",
    partyName: "Mahalaxmi Agro & Feeds",
    vehicleId: "veh-2",
    vehicleNumber: "MH-14-GH-8821",
    driverPhone: "+91 97631 88443",
    freight: "Paid",
    deliveryLocation: "MIDC Plant Gate 2, Sangli",
    products: [
      {
        id: "p-1",
        particular: "MAHALAXMI 50 KG PREMIUM",
        bagWeightKg: 50,
        quantityBags: 400,
        unit: "Bags",
        totalWeightKg: 20000,
        tons: 20.0,
        remarks: "Moisture tested"
      }
    ],
    totalBags: 400,
    totalTons: 20.0,
    totalWeightKg: 20000,
    remarks: "Priority industrial supply delivery",
    createdAt: "2026-10-02T12:00:00.000Z",
    updatedAt: "2026-10-02T12:00:00.000Z"
  },
  {
    id: "dn-003",
    deliveryNoteNumber: "DN-2026-0003",
    date: "2026-10-04",
    partyId: "pty-4",
    partyName: "Venkateshwara Trading Co.",
    vehicleId: "veh-4",
    vehicleNumber: "MH-20-EQ-6204",
    driverPhone: "+91 98500 44331",
    freight: "To Pay (₹ 6,200)",
    deliveryLocation: "Station Road Branch, Solapur",
    products: [
      {
        id: "p-1",
        particular: "AGRO FEED 20 KG SPECIAL",
        bagWeightKg: 20,
        quantityBags: 600,
        unit: "Bags",
        totalWeightKg: 12000,
        tons: 12.0,
        remarks: "Grade A"
      },
      {
        id: "p-2",
        particular: "ULTRA CEMENT 25 KG",
        bagWeightKg: 25,
        quantityBags: 320,
        unit: "Bags",
        totalWeightKg: 8000,
        tons: 8.0,
        remarks: "Batch #C4"
      }
    ],
    totalBags: 920,
    totalTons: 20.0,
    totalWeightKg: 20000,
    remarks: "Multi-product consolidated shipment",
    createdAt: "2026-10-04T11:00:00.000Z",
    updatedAt: "2026-10-04T11:00:00.000Z"
  }
];
