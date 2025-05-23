import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  console.log("POLICY API: Checking policy definition");
  
  try {
    const supabase = await createClient();
    
    // Query the system tables to get policy information
    const { data: policyData, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'Trainer');
    
    if (policyError) {
      console.error("POLICY API: Error querying policies:", policyError);
      
      // Try using RPC if direct query fails
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_policies',
        { table_name: 'Trainer' }
      );
      
      if (rpcError) {
        console.error("POLICY API: RPC error:", rpcError);
        return NextResponse.json({
          success: false,
          directError: policyError,
          rpcError: rpcError,
          message: "Failed to get policy information"
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        source: "rpc",
        policies: rpcData
      });
    }
    
    // Get all tables to check schema
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    // Get columns for the Trainer table
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'Trainer')
      .eq('table_schema', 'public');
    
    return NextResponse.json({
      success: true,
      policies: policyData,
      tables: tablesError ? { error: tablesError.message } : tablesData,
      columns: columnsError ? { error: columnsError.message } : columnsData
    });
    
  } catch (error) {
    console.error("POLICY API: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 