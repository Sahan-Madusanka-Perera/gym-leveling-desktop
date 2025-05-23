import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  console.log("SUPABASE-TEST API: Received test request");
  
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id } = body;
    
    console.log("SUPABASE-TEST API: Attempting to test trainer updates with ID:", id);
    
    // Check if we have a valid numeric ID
    const numericId = typeof id === 'number' ? id : 
                     (typeof id === 'string' && !id.startsWith('temp-')) ? parseInt(id, 10) : null;
    
    if (numericId === null || isNaN(numericId)) {
      console.error("SUPABASE-TEST API: Invalid ID format. Expected numeric ID, got:", id);
      return NextResponse.json({
        success: false,
        error: {
          message: `Invalid ID format: ${id}. Cannot convert to numeric ID.`
        },
        message: "Cannot test with non-numeric ID"
      }, { status: 400 });
    }
    
    // First get the trainer to see if it exists - using trainer_id which is the correct primary key
    const { data: getResult, error: getError } = await supabase
      .from("Trainer")
      .select("*")
      .eq("trainer_id", numericId)
      .maybeSingle();
      
    if (getError) {
      console.error("SUPABASE-TEST API: Error fetching trainer by trainer_id:", getError);
      return NextResponse.json({
        success: false,
        error: getError,
        message: "Failed to get trainer with trainer_id"
      }, { status: 500 });
    }
    
    if (!getResult) {
      return NextResponse.json({
        success: false,
        message: "Trainer not found with trainer_id",
        searchedId: numericId
      }, { status: 404 });
    }
    
    console.log("SUPABASE-TEST API: Found trainer with trainer_id:", getResult);
    
    // Try a no-op update to test update permissions
    const { data: updateResult, error: updateError } = await supabase
      .from("Trainer")
      .update({ name: getResult.name }) // No-op update to test permission
      .eq("trainer_id", numericId)
      .select()
      .maybeSingle();
      
    if (updateError) {
      console.error("SUPABASE-TEST API: Error updating trainer by trainer_id:", updateError);
      return NextResponse.json({
        success: false,
        error: updateError,
        message: "Failed to update trainer with trainer_id"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Successfully updated trainer with trainer_id",
      result: updateResult,
      foundWith: "trainer_id"
    });
    
  } catch (error) {
    console.error("SUPABASE-TEST API: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 