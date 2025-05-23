import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  console.log("CHECK-RLS API: Checking RLS permissions");
  
  try {
    const supabase = await createClient();
    
    // Get current auth status
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error("CHECK-RLS API: Auth error:", authError);
      return NextResponse.json({
        success: false,
        error: authError,
        message: "Failed to check authentication"
      }, { status: 500 });
    }
    
    console.log("CHECK-RLS API: Auth data:", JSON.stringify(authData, null, 2));
    
    // Try to run a basic query to check permissions
    const { data: testData, error: testError } = await supabase
      .from("Trainer")
      .select("count(*)")
      .single();
      
    if (testError) {
      console.error("CHECK-RLS API: Test query error:", testError);
      return NextResponse.json({
        success: false,
        error: testError,
        message: "Failed to run test query",
        auth: authData
      }, { status: 500 });
    }
    
    // Try to get the current role using system function
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_my_claims')
      .single();
      
    const roleInfo = roleError ? { error: roleError.message } : roleData;
    
    // Run direct SQL to check policies
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('list_policies_for_table', { table_name: 'Trainer' });
      
    const policies = policiesError ? { error: policiesError.message } : policiesData;
    
    return NextResponse.json({
      success: true,
      message: "RLS permission check complete",
      auth: authData,
      testQuery: testData,
      role: roleInfo,
      policies: policies
    });
    
  } catch (error) {
    console.error("CHECK-RLS API: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 