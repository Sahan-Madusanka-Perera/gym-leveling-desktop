export interface Equipment {
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