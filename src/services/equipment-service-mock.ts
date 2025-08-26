import { Equipment, equipmentCategories } from "@/app/equipments/types";

// Mock equipment data that can later be replaced with Supabase
const mockEquipments: Equipment[] = [
  {
    id: "e001",
    name: "Treadmill",
    description: "Commercial grade treadmill with speed up to 20km/h and 15% incline",
    category: "Cardio",
    quantity: 5,
    status: "available",
    purchaseDate: "2023-01-15",
    lastMaintenanceDate: "2023-06-20",
    nextMaintenanceDate: "2023-12-20",
    price: 3599.99,
    manufacturer: "LifeFitness",
    model: "Platinum Club Series",
    serialNumber: "LF-TM-2023-0001",
    image: "/images/equipment/treadmill.jpg",
    location: "Cardio Area - Main Floor",
    notes: "Regular maintenance required every 6 months"
  },
  {
    id: "e002",
    name: "Olympic Barbell",
    description: "20kg Olympic barbell - chrome finish",
    category: "Free Weights",
    quantity: 10,
    status: "available",
    purchaseDate: "2023-02-05",
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    price: 299.99,
    manufacturer: "Rogue Fitness",
    model: "Ohio Bar",
    serialNumber: "RF-OB-2023-0025",
    image: "/images/equipment/barbell.jpg",
    location: "Free Weights Area",
    notes: "Inspect for bending or damage regularly"
  },
  {
    id: "e003",
    name: "Adjustable Bench",
    description: "Adjustable workout bench with multiple positions from decline to 85° incline",
    category: "Strength",
    quantity: 8,
    status: "available",
    purchaseDate: "2023-01-10",
    lastMaintenanceDate: "2023-07-15",
    nextMaintenanceDate: "2024-01-15",
    price: 499.99,
    manufacturer: "Hammer Strength",
    model: "Multi-Adjustable Bench",
    serialNumber: "HS-AB-2023-0008",
    image: "/images/equipment/bench.jpg",
    location: "Free Weights Area",
    notes: "Check cushion and adjustment mechanism monthly"
  },
  {
    id: "e004",
    name: "Exercise Bike",
    description: "Upright stationary bike with digital display and heart rate monitor",
    category: "Cardio",
    quantity: 6,
    status: "in-use",
    purchaseDate: "2023-03-20",
    lastMaintenanceDate: "2023-08-10",
    nextMaintenanceDate: "2024-02-10",
    price: 1899.99,
    manufacturer: "Precor",
    model: "UBK 885",
    serialNumber: "PC-EB-2023-0006",
    image: "/images/equipment/exercise-bike.jpg",
    location: "Cardio Area - Main Floor",
    notes: "Popular during morning hours"
  },
  {
    id: "e005",
    name: "Dumbbell Set",
    description: "Complete set of rubber hex dumbbells from 5kg to 50kg in 2.5kg increments",
    category: "Free Weights",
    quantity: 2,
    status: "available",
    purchaseDate: "2023-01-05",
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    price: 4999.99,
    manufacturer: "Eleiko",
    model: "Hex Dumbbell Set",
    serialNumber: "EL-DS-2023-0002",
    image: "/images/equipment/dumbbell-set.jpg",
    location: "Free Weights Area",
    notes: "Ensure dumbbells are returned to proper positions"
  },
  {
    id: "e006",
    name: "Leg Press Machine",
    description: "45-degree leg press machine with weight capacity up to 400kg",
    category: "Machine",
    quantity: 2,
    status: "maintenance",
    purchaseDate: "2022-11-15",
    lastMaintenanceDate: "2023-09-01",
    nextMaintenanceDate: "2023-11-01",
    price: 3299.99,
    manufacturer: "Cybex",
    model: "Eagle Leg Press",
    serialNumber: "CY-LP-2022-0012",
    image: "/images/equipment/leg-press.jpg",
    location: "Strength Area - Back Section",
    notes: "Currently undergoing maintenance for hydraulic system repair"
  },
  {
    id: "e007",
    name: "Rowing Machine",
    description: "Air resistance rowing machine with performance monitor",
    category: "Cardio",
    quantity: 4,
    status: "available",
    purchaseDate: "2023-04-10",
    lastMaintenanceDate: "2023-08-22",
    nextMaintenanceDate: "2024-02-22",
    price: 1299.99,
    manufacturer: "Concept2",
    model: "Model D",
    serialNumber: "C2-RM-2023-0004",
    image: "/images/equipment/rowing-machine.jpg",
    location: "Cardio Area - Main Floor",
    notes: "Clean after each use with provided wipes"
  },
  {
    id: "e008",
    name: "Foam Roller",
    description: "Firm density foam roller for myofascial release",
    category: "Recovery",
    quantity: 15,
    status: "available",
    purchaseDate: "2023-05-20",
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    price: 39.99,
    manufacturer: "TriggerPoint",
    model: "GRID Foam Roller",
    serialNumber: undefined,
    image: "/images/equipment/foam-roller.jpg",
    location: "Recovery Area",
    notes: "Clean regularly with disinfectant"
  }
];

// Get all equipment items
export async function getAllEquipments(): Promise<Equipment[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEquipments);
    }, 500); // Simulate network delay
  });
}

// Get equipment by ID
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const equipment = mockEquipments.find(item => item.id === id);
      resolve(equipment || null);
    }, 300);
  });
}

// Add new equipment
export async function addEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
  return new Promise((resolve) => {
    // Generate a new ID
    const newId = `e${(mockEquipments.length + 1).toString().padStart(3, '0')}`;
    
    const newEquipment: Equipment = {
      id: newId,
      ...data
    };
    
    // In a real app, we would add to database here
    mockEquipments.push(newEquipment);
    
    setTimeout(() => {
      resolve(newEquipment);
    }, 500);
  });
}

// Update equipment
export async function updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
  return new Promise((resolve) => {
    const index = mockEquipments.findIndex(item => item.id === id);
    
    if (index !== -1) {
      mockEquipments[index] = { ...mockEquipments[index], ...data };
      setTimeout(() => {
        resolve(mockEquipments[index]);
      }, 500);
    } else {
      setTimeout(() => {
        resolve(null);
      }, 500);
    }
  });
}

// Delete equipment
export async function deleteEquipment(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    const index = mockEquipments.findIndex(item => item.id === id);
    
    if (index !== -1) {
      mockEquipments.splice(index, 1);
      setTimeout(() => {
        resolve(true);
      }, 500);
    } else {
      setTimeout(() => {
        resolve(false);
      }, 500);
    }
  });
}

// Get unique categories
export async function getUniqueCategories(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(equipmentCategories);
    }, 300);
  });
}

// Filter equipment
export async function filterEquipments(filters: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<Equipment[]> {
  return new Promise((resolve) => {
    let filtered = [...mockEquipments];
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.manufacturer.toLowerCase().includes(searchTerm) ||
        item.model.toLowerCase().includes(searchTerm)
      );
    }
    
    setTimeout(() => {
      resolve(filtered);
    }, 500);
  });
} 