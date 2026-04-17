import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (Client SDK for seeding is easiest here)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const deals = [
  {
    address: "123 Maple Ave, Indianapolis, IN 46202",
    price: 145000,
    arv: 235000,
    rehab: 45000,
    rent: 1650,
    sqft: 1850,
    bedrooms: 3,
    bathrooms: 2,
    dealScore: 88,
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200"],
    createdAt: Timestamp.now(),
    publishedAt: Timestamp.now(),
    adminVerificationStatus: "approved",
    aiAnalysis: {
        gemini: {
            summary: "Strong BRRRR candidate in rapid-appreciating Fountain Square. Mechanicals updated 2020.",
            strengths: ["New Roof", "Walking distance to cultural trail"],
            risks: ["Foundation settling - minor"]
        }
    }
  },
  {
    address: "890 Elm St, Cincinnati, OH 45202",
    price: 85000,
    arv: 175000,
    rehab: 55000,
    rent: 1400,
    sqft: 1400,
    bedrooms: 2,
    bathrooms: 1,
    dealScore: 92,
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200"],
    createdAt: Timestamp.now(),
    publishedAt: Timestamp.now(),
    adminVerificationStatus: "approved",
    aiAnalysis: {
        gemini: {
            summary: "Deep discount flip. Needs cosmetic overhaul but bones are good.",
            strengths: ["Priced at 48% of ARV", "Corner Lot"],
            risks: ["Complete rewire needed"]
        }
    }
  },
  {
    address: "4501 Broadway, Indianapolis, IN 46205",
    price: 210000,
    arv: 315000,
    rehab: 35000,
    rent: 2100,
    sqft: 2200,
    bedrooms: 4,
    bathrooms: 2.5,
    dealScore: 78, // VIP Threshold > 75
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1600596542815-2250c385e311?auto=format&fit=crop&q=80&w=1200"],
    createdAt: Timestamp.now(),
    publishedAt: Timestamp.now(),
    adminVerificationStatus: "approved",
    aiAnalysis: {
        gemini: {
            summary: "Turnkey rental or light flip. Currently tenant occupied at $1200 (under market).",
            strengths: ["Cash flow day 1", "Meridian-Kessler adjacent"],
            risks: ["Tenant eviction potential"]
        }
    }
  },
   {
    address: "7720 S Rural St, Indianapolis, IN 46227",
    price: 195000,
    arv: 265000,
    rehab: 20000,
    rent: 1850,
    sqft: 1650,
    bedrooms: 3,
    bathrooms: 2,
    dealScore: 72, 
    status: "New Lead",
    imageUrls: ["https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1200"],
    createdAt: Timestamp.now(),
    publishedAt: Timestamp.now(),
    adminVerificationStatus: "pending", // Should not show in public market unless user is admin
    aiAnalysis: {
        gemini: {
            summary: "Solid suburban ranch. Good school district.",
            strengths: ["Attached Garage", "Quarter acre lot"],
            risks: ["Outdated HVAC"]
        }
    }
  }
];

async function seed() {
    const appId = process.env.VITE_APP_ID || process.env.VITE_FIREBASE_APP_ID;
    console.log(`Seeding deals to LIVE production for App ID: ${appId}`);
    
    const dealsRef = collection(db, 'artifacts', appId, 'deals');
    const publicDealsRef = collection(db, 'artifacts', appId, 'publicDeals');
    
    for (const deal of deals) {
        // Upload to private deals
        const docRef = await addDoc(dealsRef, deal);
        
        // If approved, mirror to public deals
        if (deal.adminVerificationStatus === 'approved') {
             await addDoc(publicDealsRef, {
                 ...deal,
                 originalId: docRef.id
             });
        }
        console.log(`Added: ${deal.address}`);
    }
    console.log("Seeding complete. Press Ctrl+C to exit.");
    process.exit(0);
}

seed().catch(console.error);
