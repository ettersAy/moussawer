export interface PhotographerSpec {
  email: string;
  name: string;
  city: string;
  bio: string;
  profileImageUrl: string;
  avatarUrl: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  categorySlugs: string[];
  services: [string, string, number, number, string][];
  images: string[];
}

export const photographerSpecs: PhotographerSpec[] = [
  {
    email: "photographer-one@example.com",
    name: "Amir Haddad",
    city: "Toronto",
    bio: "Editorial wedding and portrait photographer with a calm, cinematic style.",
    profileImageUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=900&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    startingPrice: 320,
    rating: 4.9,
    reviewCount: 18,
    verified: true,
    categorySlugs: ["wedding", "portrait"],
    services: [
      ["Signature Portrait Session", "Two-hour portrait shoot with 20 edited images.", 120, 320, "portrait"],
      ["Wedding Story Package", "Half-day wedding coverage with gallery delivery.", 360, 1450, "wedding"]
    ],
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    email: "photographer-two@example.com",
    name: "Leila Morgan",
    city: "Montreal",
    bio: "Fashion, commercial, and product imagery with polished studio lighting.",
    profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    startingPrice: 450,
    rating: 4.8,
    reviewCount: 14,
    verified: true,
    categorySlugs: ["fashion", "commercial"],
    services: [
      ["Studio Campaign", "Commercial studio session with art-direction support.", 180, 850, "commercial"],
      ["Lookbook Session", "Fashion lookbook coverage for emerging brands.", 240, 980, "fashion"]
    ],
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    email: "photographer-three@example.com",
    name: "Jonas Reed",
    city: "Ottawa",
    bio: "Warm documentary coverage for families, conferences, and community events.",
    profileImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    startingPrice: 240,
    rating: 4.7,
    reviewCount: 11,
    verified: false,
    categorySlugs: ["family", "event"],
    services: [
      ["Family Afternoon", "Relaxed family session with a private digital gallery.", 90, 240, "family"],
      ["Event Essentials", "Coverage for launches, panels, and private celebrations.", 180, 650, "event"]
    ],
    images: [
      "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];
