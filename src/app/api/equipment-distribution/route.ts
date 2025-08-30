
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Agg = {
  equipmentName: string;
  available: number;
  inUse: number;
  underMaintenance: number;
};

function normalizeStatus(status?: string): 'available' | 'inUse' | 'underMaintenance' {
  const s = (status ?? 'available').toLowerCase().trim().replace(/[_-]/g, ' ');
  if (s.includes('in use') || s.includes('inuse')) return 'inUse';
  if (s.includes('under maintenance') || s.includes('maintenance') || s.includes('maint')) return 'underMaintenance';
  return 'available';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Equipment')
      .select('equipment_id, name, quantity, status')
      .order('equipment_id', { ascending: true });

    if (error) {
      console.error('Error fetching equipment status:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch equipment data' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: [], message: 'No equipment data found' });
    }

    // Convert DB rows → aggregated chart-ready data
    const aggregatedData = data.reduce<Record<number, Agg>>((acc, eq) => {
      const id = Number(eq.equipment_id);
      const name = eq.name ?? `#${id}`;
      const qty = Number(eq.quantity) || 0;
      const statusKey = normalizeStatus(eq.status);

      if (!acc[id]) {
        acc[id] = { equipmentName: name, available: 0, inUse: 0, underMaintenance: 0 };
      }

      if (statusKey === 'available') acc[id].available += qty;
      else if (statusKey === 'inUse') acc[id].inUse += qty;
      else acc[id].underMaintenance += qty;

      return acc;
    }, {});

    // Final sorted array
    const equipmentData = Object.entries(aggregatedData)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([equipmentId, agg]) => ({
        equipmentId: Number(equipmentId),
        equipmentName: agg.equipmentName,
        available: agg.available,
        inUse: agg.inUse,
        underMaintenance: agg.underMaintenance,
      }));

    return NextResponse.json({ success: true, data: equipmentData });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
