// Simplified zone types for user input

export interface ZoneType {
  id: string
  name: string
  category: string
  description: string
  permissibleUse: string
  far: number
  coverage: number
  setbacks: {
    front: number
    rear: number
    side1: number
    side2: number
  }
  parkingNorm: number
}

export const zoneTypes: ZoneType[] = [
  {
    id: "res-mixed",
    name: "Residential (Mixed)",
    category: "Residential",
    description: "Mixed residential zone with multi-family housing",
    permissibleUse: "Residential (Mixed)",
    far: 1.75,
    coverage: 50,
    setbacks: { front: 3, rear: 3, side1: 2, side2: 2 },
    parkingNorm: 75,
  },
  {
    id: "res-main",
    name: "Residential (Main)",
    category: "Residential",
    description: "Primary residential zone for single-family homes",
    permissibleUse: "Residential (Main)",
    far: 1.5,
    coverage: 45,
    setbacks: { front: 4, rear: 3, side1: 2.5, side2: 2.5 },
    parkingNorm: 100,
  },
  {
    id: "com-central",
    name: "Commercial (Central)",
    category: "Commercial",
    description: "Central business district with high-rise commercial buildings",
    permissibleUse: "Commercial (Central)",
    far: 3.25,
    coverage: 40,
    setbacks: { front: 6, rear: 6, side1: 4, side2: 4 },
    parkingNorm: 75,
  },
  {
    id: "com-business",
    name: "Commercial (Business)",
    category: "Commercial",
    description: "Business and office complexes",
    permissibleUse: "Commercial (Business)",
    far: 2.5,
    coverage: 50,
    setbacks: { front: 5, rear: 4, side1: 3, side2: 3 },
    parkingNorm: 65,
  },
  {
    id: "com-axes",
    name: "Commercial (Axes)",
    category: "Commercial",
    description: "Linear commercial development along major roads",
    permissibleUse: "Commercial (Axes)",
    far: 2.0,
    coverage: 55,
    setbacks: { front: 4, rear: 3, side1: 2, side2: 2 },
    parkingNorm: 80,
  },
  {
    id: "industrial",
    name: "Industrial",
    category: "Industrial",
    description: "General industrial and manufacturing zone",
    permissibleUse: "Industrial",
    far: 1.5,
    coverage: 50,
    setbacks: { front: 6, rear: 6, side1: 4, side2: 4 },
    parkingNorm: 100,
  },
  {
    id: "high-tech",
    name: "High Tech",
    category: "Industrial",
    description: "High-tech and IT industrial park",
    permissibleUse: "High Tech",
    far: 2.25,
    coverage: 45,
    setbacks: { front: 5, rear: 5, side1: 3, side2: 3 },
    parkingNorm: 75,
  },
  {
    id: "public",
    name: "Public / Semi-public",
    category: "Public/Semi-public",
    description: "Government offices, hospitals, schools, and public institutions",
    permissibleUse: "Public / Semi-public",
    far: 1.5,
    coverage: 40,
    setbacks: { front: 6, rear: 6, side1: 4, side2: 4 },
    parkingNorm: 100,
  },
]
