import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Define types for our results structure
interface TableStatus {
  exists: boolean;
  rls_enabled: boolean;
  policies: any[]; // Using any for policy objects which can vary
  test_select: {
    success: boolean;
    error: any | null;
    data: any | null;
  };
  test_update: {
    success: boolean;
    error: any | null;
  };
}

interface DiagnosticResults {
  authenticated: boolean;
  tables: {
    Trainer: TableStatus;
    Member: TableStatus;
    [key: string]: TableStatus; // Index signature for any string table name
  };
  token: {
    provider?: string;
    role?: string;
    token_expires_at?: number;
  } | null;
  technical_details: Record<string, any>; // For storing various error details
}

export async function POST(req: Request) {
  try {
    // Initialize results with proper typing
    const results: DiagnosticResults = {
      authenticated: false,
      tables: {
        Trainer: {
          exists: false,
          rls_enabled: false,
          policies: [],
          test_select: { success: false, error: null, data: null },
          test_update: { success: false, error: null }
        },
        Member: {
          exists: false,
          rls_enabled: false,
          policies: [],
          test_select: { success: false, error: null, data: null },
          test_update: { success: false, error: null }
        }
      },
      token: null,
      technical_details: {}
    };

    console.log("RLS-DIAGNOSTIC: Starting RLS diagnostics");
    
    // First check if user is authenticated
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("RLS-DIAGNOSTIC: Error getting session:", sessionError);
      results.technical_details["session_error"] = sessionError;
    }
    
    if (session) {
      results.authenticated = true;
      results.token = {
        provider: session.user?.app_metadata?.provider,
        role: session.user?.role,
        token_expires_at: session.expires_at
      };
    } else {
      console.log("RLS-DIAGNOSTIC: No session found, user is not authenticated");
    }
    
    // Use service client to bypass RLS for diagnostics
    const serviceClient = await createServiceClient();
    
    // Check tables and RLS settings for tables
    const { data: tablesData, error: tablesError } = await serviceClient
      .from('pg_tables')
      .select('*')
      .in('tablename', ['Trainer', 'Member']);
      
    if (tablesError) {
      console.error("RLS-DIAGNOSTIC: Error checking tables:", tablesError);
      results.technical_details["tables_error"] = tablesError;
    }
    
    if (tablesData) {
      for (const table of tablesData) {
        if (table.tablename === 'Trainer' || table.tablename === 'Member') {
          results.tables[table.tablename].exists = true;
        }
      }
    }
    
    // Check RLS settings for each table
    const { data: rlsData, error: rlsError } = await serviceClient
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .in('tablename', ['Trainer', 'Member']);
      
    if (rlsError) {
      console.error("RLS-DIAGNOSTIC: Error checking RLS settings:", rlsError);
      results.technical_details["rls_error"] = rlsError;
    }
    
    if (rlsData) {
      for (const table of rlsData) {
        if (table.tablename === 'Trainer' || table.tablename === 'Member') {
          results.tables[table.tablename].rls_enabled = table.rowsecurity;
        }
      }
    }
    
    // Check for RLS policies
    const { data: policiesData, error: policiesError } = await serviceClient
      .from('pg_policies')
      .select('*')
      .in('tablename', ['Trainer', 'Member']);
      
    if (policiesError) {
      console.error("RLS-DIAGNOSTIC: Error checking policies:", policiesError);
      results.technical_details["policies_error"] = policiesError;
    }
    
    if (policiesData) {
      for (const policy of policiesData) {
        if (policy.tablename === 'Trainer') {
          results.tables.Trainer.policies.push(policy);
        } else if (policy.tablename === 'Member') {
          results.tables.Member.policies.push(policy);
        }
      }
    }
    
    // Test operations with regular client (subjected to RLS)
    const tableNames = ['Trainer', 'Member'] as const; // Using const assertion for type safety
    for (const tableName of tableNames) {
      // Test SELECT operation
      try {
        const { data: selectData, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (selectError) {
          console.error(`RLS-DIAGNOSTIC: Error selecting from ${tableName}:`, selectError);
          results.tables[tableName].test_select.error = selectError;
        } else {
          results.tables[tableName].test_select.success = true;
          results.tables[tableName].test_select.data = selectData;
        }
      } catch (error) {
        console.error(`RLS-DIAGNOSTIC: Unexpected error selecting from ${tableName}:`, error);
        results.tables[tableName].test_select.error = error;
      }
      
      // Test UPDATE operation
      // Just attempt a no-op update to test permissions
      try {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', 0); // Using id=0 to avoid affecting real data
          
        if (updateError) {
          console.error(`RLS-DIAGNOSTIC: Error updating ${tableName}:`, updateError);
          results.tables[tableName].test_update.error = updateError;
          
          // If it's an RLS error, note that specifically
          if (updateError.code === 'PGRST100') {
            results.tables[tableName].test_update.error = {
              ...updateError,
              is_rls_error: true
            };
          }
        } else {
          results.tables[tableName].test_update.success = true;
        }
      } catch (error) {
        console.error(`RLS-DIAGNOSTIC: Unexpected error updating ${tableName}:`, error);
        results.tables[tableName].test_update.error = error;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("RLS-DIAGNOSTIC: Unexpected error:", error);
    return NextResponse.json({
      error: "Unexpected error running diagnostics",
      details: error
    }, { status: 500 });
  }
} 