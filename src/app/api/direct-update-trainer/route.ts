import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  console.log("DIRECT-UPDATE API: Received direct update request");
  
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { trainerId, data } = body;
    
    console.log("DIRECT-UPDATE API: Attempting to update trainer:", {
      trainerId,
      updateData: data
    });
    
    // First let's fetch the trainer to see what fields it has
    const { data: getResult, error: getError } = await supabase
      .from("Trainer")
      .select("*")
      .eq("trainer_id", trainerId)
      .maybeSingle();
      
    if (getError) {
      console.error("DIRECT-UPDATE API: Error fetching trainer:", getError);
      return NextResponse.json({
        success: false,
        error: getError,
        message: "Failed to fetch trainer"
      }, { status: 500 });
    }
    
    if (!getResult) {
      console.error("DIRECT-UPDATE API: No trainer found with ID:", trainerId);
      return NextResponse.json({
        success: false,
        message: "No trainer found with the provided ID",
        trainerId
      }, { status: 404 });
    }
    
    console.log("DIRECT-UPDATE API: Existing trainer record:", getResult);
    console.log("DIRECT-UPDATE API: Trainer fields:", Object.keys(getResult));
    
    // Now try to update it
    const { data: updateResult, error: updateError } = await supabase
      .from("Trainer")
      .update(data)
      .eq("trainer_id", trainerId)
      .select()
      .single();
      
    if (updateError) {
      console.error("DIRECT-UPDATE API: Error updating trainer:", updateError);
      return NextResponse.json({
        success: false,
        error: updateError,
        message: "Failed to update trainer"
      }, { status: 500 });
    }
    
    console.log("DIRECT-UPDATE API: Update successful!", updateResult);
    
    return NextResponse.json({
      success: true,
      message: "Trainer updated successfully",
      trainer: updateResult
    });
    
  } catch (error) {
    console.error("DIRECT-UPDATE API: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 