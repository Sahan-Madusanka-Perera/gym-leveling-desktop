import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status } = body;
    const bookingId = params.id;

    if (!status || !['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      return NextResponse.json({ 
        error: 'Valid status is required' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('session_bookings')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
