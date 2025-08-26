import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test the connection by trying to fetch equipment count
    const { data, error, count } = await supabase
      .from('Equipment')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: 'Failed to connect to Equipment table'
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      equipmentCount: count || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to test Supabase connection'
      }, 
      { status: 500 }
    );
  }
}
