import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('session_bookings')
      .select(`
        *,
        Member:member_id (
          member_id,
          first_name,
          last_name,
          email,
          phone_number
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, member_id, booking_date, notes } = body;

    if (!session_id || !member_id) {
      return NextResponse.json({ 
        error: 'Session ID and Member ID are required' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Check session availability
    const { data: availability } = await supabase
      .from('session_availability')
      .select('*')
      .eq('id', session_id)
      .single();

    if (!availability?.has_availability) {
      return NextResponse.json({ 
        error: 'Session is fully booked' 
      }, { status: 400 });
    }

    // Check for existing booking
    const { data: existingBooking } = await supabase
      .from('session_bookings')
      .select('id')
      .eq('session_id', session_id)
      .eq('member_id', member_id)
      .eq('status', 'confirmed')
      .single();

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'Member already has a booking for this session' 
      }, { status: 400 });
    }

    // Create booking
    const { data, error } = await supabase
      .from('session_bookings')
      .insert([{
        session_id,
        member_id,
        booking_date: booking_date || new Date().toISOString(),
        notes,
        status: 'confirmed'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
