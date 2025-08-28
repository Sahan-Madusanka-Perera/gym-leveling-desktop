import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test if payment_id column exists in session_bookings
    const { data: bookingCols, error: bookingError } = await supabase
      .from('session_bookings')
      .select('*')
      .limit(1);

    // Test if price column exists in sessions
    const { data: sessionCols, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    // Test Payments table structure
    const { data: paymentCols, error: paymentError } = await supabase
      .from('Payments')
      .select('*')
      .limit(1);

    return NextResponse.json({
      status: 'success',
      tables: {
        session_bookings: {
          error: bookingError?.message,
          sample: bookingCols?.[0] || null,
          columns: bookingCols?.[0] ? Object.keys(bookingCols[0]) : []
        },
        sessions: {
          error: sessionError?.message,
          sample: sessionCols?.[0] || null,
          columns: sessionCols?.[0] ? Object.keys(sessionCols[0]) : []
        },
        Payments: {
          error: paymentError?.message,
          sample: paymentCols?.[0] || null,
          columns: paymentCols?.[0] ? Object.keys(paymentCols[0]) : []
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}
