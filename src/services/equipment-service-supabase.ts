import { createClient } from '@/lib/supabase/client';
import { Equipment, EquipmentUI, equipmentCategories } from "@/app/equipments/types";

const supabase = createClient();

// Helper function to convert Supabase Equipment to UI Equipment
function convertToUIEquipment(equipment: Equipment): EquipmentUI {
  return {
    id: equipment.equipment_id.toString(),
    name: equipment.name,
    description: equipment.description || '',
    category: equipment.category,
    quantity: equipment.quantity,
    status: equipment.status,
    purchaseDate: equipment.purchase_date || '',
    lastMaintenanceDate: equipment.last_maintenance_date || null,
    nextMaintenanceDate: equipment.next_maintenance_date || null,
    price: equipment.price || 0,
    manufacturer: equipment.manufacturer || '',
    model: equipment.model || '',
    serialNumber: equipment.serial_number,
    image: equipment.image_url,
    location: equipment.location || '',
    notes: equipment.notes
  };
}

// Helper function to convert UI Equipment to Supabase Equipment
function convertFromUIEquipment(equipment: Omit<EquipmentUI, 'id'>): Omit<Equipment, 'equipment_id' | 'created_at' | 'updated_at'> {
  return {
    name: equipment.name,
    description: equipment.description,
    category: equipment.category,
    quantity: equipment.quantity,
    status: equipment.status,
    purchase_date: equipment.purchaseDate || undefined,
    last_maintenance_date: equipment.lastMaintenanceDate || undefined,
    next_maintenance_date: equipment.nextMaintenanceDate || undefined,
    price: equipment.price,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    serial_number: equipment.serialNumber,
    image_url: equipment.image,
    location: equipment.location,
    notes: equipment.notes
  };
}

// Get all equipment items
export async function getAllEquipments(): Promise<EquipmentUI[]> {
  try {
    const { data, error } = await supabase
      .from('Equipment')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }

    return data?.map(convertToUIEquipment) || [];
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    throw error;
  }
}

// Get equipment by ID
export async function getEquipmentById(id: string): Promise<EquipmentUI | null> {
  try {
    const { data, error } = await supabase
      .from('Equipment')
      .select('*')
      .eq('equipment_id', parseInt(id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching equipment by ID:', error);
      throw error;
    }

    return data ? convertToUIEquipment(data) : null;
  } catch (error) {
    console.error('Failed to fetch equipment by ID:', error);
    throw error;
  }
}

// Add new equipment
export async function addEquipment(data: Omit<EquipmentUI, 'id'>): Promise<EquipmentUI> {
  try {
    const equipmentData = convertFromUIEquipment(data);
    
    const { data: insertedData, error } = await supabase
      .from('Equipment')
      .insert([equipmentData])
      .select()
      .single();

    if (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }

    return convertToUIEquipment(insertedData);
  } catch (error) {
    console.error('Failed to add equipment:', error);
    throw error;
  }
}

// Update equipment
export async function updateEquipment(id: string, data: Partial<EquipmentUI>): Promise<EquipmentUI | null> {
  try {
    // Convert UI data to Supabase format, excluding the id field
    const { id: _, ...dataWithoutId } = data;
    const equipmentData = convertFromUIEquipment(dataWithoutId as Omit<EquipmentUI, 'id'>);
    
    const { data: updatedData, error } = await supabase
      .from('Equipment')
      .update(equipmentData)
      .eq('equipment_id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }

    return updatedData ? convertToUIEquipment(updatedData) : null;
  } catch (error) {
    console.error('Failed to update equipment:', error);
    throw error;
  }
}

// Delete equipment
export async function deleteEquipment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Equipment')
      .delete()
      .eq('equipment_id', parseInt(id));

    if (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return false;
  }
}

// Get unique categories
export async function getUniqueCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('Equipment')
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      // Fallback to predefined categories
      return equipmentCategories;
    }

    const uniqueCategories = [...new Set(data?.map(item => item.category))];
    
    // Merge with predefined categories to ensure all options are available
    const allCategories = [...new Set([...equipmentCategories, ...uniqueCategories])];
    return allCategories.sort();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return equipmentCategories;
  }
}

// Filter equipment
export async function filterEquipments(filters: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<EquipmentUI[]> {
  try {
    let query = supabase
      .from('Equipment')
      .select('*');

    // Apply category filter
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `manufacturer.ilike.%${searchTerm}%,` +
        `model.ilike.%${searchTerm}%,` +
        `location.ilike.%${searchTerm}%`
      );
    }

    // Order by name
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error filtering equipment:', error);
      throw error;
    }

    return data?.map(convertToUIEquipment) || [];
  } catch (error) {
    console.error('Failed to filter equipment:', error);
    throw error;
  }
}

// Get equipment statistics
export async function getEquipmentStats(): Promise<{
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  outOfOrder: number;
  byCategory: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('Equipment')
      .select('status, category, quantity');

    if (error) {
      console.error('Error fetching equipment stats:', error);
      throw error;
    }

    const stats = {
      total: 0,
      available: 0,
      inUse: 0,
      maintenance: 0,
      outOfOrder: 0,
      byCategory: {} as Record<string, number>
    };

    data?.forEach(item => {
      stats.total += item.quantity;
      
      switch (item.status) {
        case 'available':
          stats.available += item.quantity;
          break;
        case 'in-use':
          stats.inUse += item.quantity;
          break;
        case 'maintenance':
          stats.maintenance += item.quantity;
          break;
        case 'out-of-order':
          stats.outOfOrder += item.quantity;
          break;
      }

      if (stats.byCategory[item.category]) {
        stats.byCategory[item.category] += item.quantity;
      } else {
        stats.byCategory[item.category] = item.quantity;
      }
    });

    return stats;
  } catch (error) {
    console.error('Failed to fetch equipment stats:', error);
    throw error;
  }
}

// Get equipment due for maintenance
export async function getMaintenanceDueEquipment(): Promise<EquipmentUI[]> {
  try {
    const today = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('Equipment')
      .select('*')
      .not('next_maintenance_date', 'is', null)
      .lte('next_maintenance_date', today)
      .order('next_maintenance_date', { ascending: true });

    if (error) {
      console.error('Error fetching maintenance due equipment:', error);
      throw error;
    }

    return data?.map(convertToUIEquipment) || [];
  } catch (error) {
    console.error('Failed to fetch maintenance due equipment:', error);
    throw error;
  }
}

// Update equipment status
export async function updateEquipmentStatus(id: string, status: EquipmentUI['status']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Equipment')
      .update({ status })
      .eq('equipment_id', parseInt(id));

    if (error) {
      console.error('Error updating equipment status:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to update equipment status:', error);
    return false;
  }
}
