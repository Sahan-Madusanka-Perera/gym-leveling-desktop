export interface Equipment {
  equipment_id: number;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-order';
  purchase_date?: string;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  price?: number;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  image_url?: string;
  location?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// For backward compatibility with existing UI components
export interface EquipmentUI {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-order';
  purchaseDate: string;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  price: number;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  image?: string;
  location: string;
  notes?: string;
}

export const equipmentCategories = [
  'Cardio',
  'Strength',
  'Free Weights',
  'Machine',
  'Functional Training',
  'Recovery',
  'Accessories',
  'Other'
];

export const equipmentStatuses = [
  'available',
  'in-use',
  'maintenance',
  'out-of-order'
]; 