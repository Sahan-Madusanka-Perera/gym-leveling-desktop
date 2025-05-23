import { NextResponse } from 'next/server';
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  console.log("DEBUG-TRAINER-UPDATE: Received debug request");
  
  try {
    const supabase = await createServiceClient();
    const body = await req.json();
    const { trainerId, updateData } = body;
    
    console.log("DEBUG-TRAINER-UPDATE: Request details:", { trainerId, updateData });
    
    // Parameter validation
    if (!trainerId || typeof trainerId !== 'number' || isNaN(trainerId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid trainer ID",
        message: "Please provide a valid numeric trainer ID"
      }, { status: 400 });
    }
    
    if (!updateData || typeof updateData !== 'object') {
      return NextResponse.json({
        success: false,
        error: "Invalid update data",
        message: "Please provide valid update data object"
      }, { status: 400 });
    }
    
    // First fetch the trainer to confirm it exists
    console.log("DEBUG-TRAINER-UPDATE: Fetching trainer with ID:", trainerId);
    const { data: existingTrainer, error: fetchError } = await supabase
      .from("Trainer")
      .select("*")
      .eq("trainer_id", trainerId)
      .maybeSingle();
    
    if (fetchError) {
      console.error("DEBUG-TRAINER-UPDATE: Error fetching trainer:", fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError,
        message: "Failed to fetch trainer"
      }, { status: 500 });
    }
    
    if (!existingTrainer) {
      console.error("DEBUG-TRAINER-UPDATE: No trainer found with ID:", trainerId);
      return NextResponse.json({
        success: false,
        message: "No trainer found with the provided ID"
      }, { status: 404 });
    }
    
    console.log("DEBUG-TRAINER-UPDATE: Found existing trainer:", existingTrainer);
    
    // Attempt to update the trainer
    console.log("DEBUG-TRAINER-UPDATE: Updating trainer with payload:", updateData);
    
    // Check if the update would actually change anything
    const needsUpdate = Object.entries(updateData).some(([key, value]) => {
      return existingTrainer[key] !== value;
    });
    
    if (!needsUpdate) {
      console.log("DEBUG-TRAINER-UPDATE: No changes detected, returning existing trainer");
      return NextResponse.json({
        success: true,
        data: existingTrainer,
        message: "No changes needed - data already matches requested values",
        updatedFields: []
      });
    }
    
    // Perform the update
    const { data: updatedTrainer, error: updateError } = await supabase
      .from("Trainer")
      .update(updateData)
      .eq("trainer_id", trainerId)
      .select()
      .maybeSingle();  // Use maybeSingle instead of single to handle possible empty results
    
    if (updateError) {
      console.error("DEBUG-TRAINER-UPDATE: Error updating trainer:", updateError);
      return NextResponse.json({
        success: false,
        error: updateError,
        message: "Failed to update trainer"
      }, { status: 500 });
    }
    
    if (!updatedTrainer) {
      console.warn("DEBUG-TRAINER-UPDATE: Update succeeded but no rows were returned");
      
      // Re-fetch to get the current state
      const { data: refetchedTrainer, error: refetchError } = await supabase
        .from("Trainer")
        .select("*")
        .eq("trainer_id", trainerId)
        .maybeSingle();
        
      if (refetchError || !refetchedTrainer) {
        console.error("DEBUG-TRAINER-UPDATE: Failed to refetch trainer after update");
        return NextResponse.json({
          success: false,
          error: refetchError || "Failed to refetch trainer",
          message: "Update may have occurred but verification failed"
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        data: refetchedTrainer,
        message: "Trainer updated (verified by refetch)",
        wasRefetched: true
      });
    }
    
    console.log("DEBUG-TRAINER-UPDATE: Update successful:", updatedTrainer);
    
    return NextResponse.json({
      success: true,
      data: updatedTrainer,
      message: "Trainer updated successfully"
    });
    
  } catch (error) {
    console.error("DEBUG-TRAINER-UPDATE: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "An unexpected error occurred"
    }, { status: 500 });
  }
} 