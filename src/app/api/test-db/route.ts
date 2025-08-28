import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test basic connection with existing tables
    const { data: members, error: memberError } = await supabase
      .from('Member')
      .select('member_id, first_name')
      .limit(1);

    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('id, title')
      .limit(1);

    return NextResponse.json({
      database_connection: 'success',
      tests: {
        member_table: {
          success: !memberError,
          error: memberError?.message,
          count: members?.length || 0
        },
        sessions_table: {
          success: !sessionError, 
          error: sessionError?.message,
          count: sessions?.length || 0
        }
      }
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      database_connection: 'failed',
      error: error.message
    }, { status: 500 });
  }
}
