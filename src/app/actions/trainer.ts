"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type Trainer } from "@/types/trainer"

export async function getTrainers() {
  const supabase = await createClient()
  
  console.log("GETTRAINERS: Fetching trainers")
  
  const { data, error } = await supabase
    .from("Trainer")
    .select("*")
    .order("name")

  if (error) {
    console.error("GETTRAINERS: Error fetching trainers:", error)
    throw new Error("Failed to fetch trainers")
  }

  // Debug the raw data returned from Supabase
  console.log("GETTRAINERS: Raw data from Supabase:", JSON.stringify(data, null, 2));
  
  // Check if trainer_id exists in the returned data
  if (data && data.length > 0) {
    console.log("GETTRAINERS: First record fields:", Object.keys(data[0]));
    console.log("GETTRAINERS: First record trainer_id:", data[0].trainer_id);
    console.log("GETTRAINERS: First record id:", data[0].id);
  } else {
    console.log("GETTRAINERS: No trainers returned from Supabase");
  }

  return data as Trainer[]
}

export async function addTrainer(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const specialization = formData.get("specialization") as string
  const contact = formData.get("contact") as string

  if (!name) {
    throw new Error("Name is required")
  }

  const { data, error } = await supabase
    .from("Trainer")
    .insert([
      {
        name,
        specialization: specialization || null,
        contact: contact || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error adding trainer:", error)
    throw new Error("Failed to add trainer")
  }

  return data as Trainer
}

export async function updateTrainer(trainerId: number, formData: FormData) {
  console.log("SERVER ACTION: updateTrainer called with ID:", trainerId);
  console.log("SERVER ACTION: FormData entries:", Array.from(formData.entries()));
  
  // Validate trainerId
  if (typeof trainerId !== 'number' || isNaN(trainerId) || trainerId <= 0) {
    console.error("SERVER ACTION: Invalid trainerId:", trainerId);
    throw new Error("Invalid trainer ID. Please provide a valid numeric ID.");
  }
  
  // Use regular client to respect RLS policies
  // With proper RLS policies in place, authenticated users should be able to update trainers
  // This is more secure than bypassing RLS with service client
  const supabase = await createClient()
  const name = formData.get("name") as string
  const specialization = formData.get("specialization") as string
  const contact = formData.get("contact") as string

  console.log("SERVER ACTION: Extracted form values:", { name, specialization, contact });

  if (!name) {
    console.log("SERVER ACTION: Name is required but missing");
    throw new Error("Name is required")
  }

  // Create update payload
  const updatePayload = {
    name,
    specialization: specialization || null,
    contact: contact || null,
  };
  
  console.log("SERVER ACTION: Update payload:", JSON.stringify(updatePayload));

  try {
    // Always use trainer_id which is the actual primary key in Supabase
    console.log("SERVER ACTION: Updating trainer with trainer_id:", trainerId);
    console.log("SERVER ACTION: Using regular client with RLS");
    
    // First try to get the trainer to confirm it exists
    const { data: existingTrainer, error: fetchError } = await supabase
      .from("Trainer")
      .select("*")
      .eq("trainer_id", trainerId)
      .maybeSingle();
      
    if (fetchError) {
      console.error("SERVER ACTION: Error fetching trainer:", fetchError);
      
      // If we get a PGRST100 error, it's likely an RLS policy issue
      if (fetchError.code === 'PGRST100') {
        throw new Error(`Permission denied: RLS policy is blocking this operation. Please check that proper RLS policies are configured for the Trainer table.`);
      }
      
      throw new Error(`Failed to verify trainer exists: ${fetchError.message}`);
    }
    
    if (!existingTrainer) {
      console.error("SERVER ACTION: No trainer found with trainer_id:", trainerId);
      throw new Error(`No trainer found with ID ${trainerId}`);
    }
    
    console.log("SERVER ACTION: Found existing trainer:", existingTrainer);
    
    // Check if the update would actually change anything
    const isChanged = 
      existingTrainer.name !== updatePayload.name ||
      existingTrainer.specialization !== updatePayload.specialization ||
      existingTrainer.contact !== updatePayload.contact;
      
    if (!isChanged) {
      console.log("SERVER ACTION: No changes detected, returning existing trainer");
      return existingTrainer as Trainer;
    }
    
    // Now perform the update
    const { data, error } = await supabase
      .from("Trainer")
      .update(updatePayload)
      .eq("trainer_id", trainerId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("SERVER ACTION: Error updating trainer:", error);
      
      // Better error handling for RLS-related issues
      if (error.code === 'PGRST100') {
        throw new Error(`Permission denied: RLS policy is blocking this update operation. Please use the "Setup RLS Policy" button to configure proper policies.`);
      }
      
      throw new Error(`Failed to update trainer: ${error.message}`);
    }
    
    // If update succeeds but data is not returned, construct a response using the existing trainer
    // with the updated values
    if (!data) {
      console.log("SERVER ACTION: Update succeeded but no data was returned. Constructing response manually.");
      
      // Verify update success by re-fetching the trainer
      const { data: updatedTrainer, error: refetchError } = await supabase
        .from("Trainer")
        .select("*")
        .eq("trainer_id", trainerId)
        .maybeSingle();
        
      if (refetchError) {
        console.error("SERVER ACTION: Error re-fetching trainer after update:", refetchError);
        throw new Error(`Update succeeded but failed to retrieve updated data: ${refetchError.message}`);
      }
      
      if (!updatedTrainer) {
        // Fallback to constructing the response from existing trainer + update payload
        console.log("SERVER ACTION: Re-fetch failed. Constructing response from existing data and update payload.");
        const constructedResponse = {
          ...existingTrainer,
          ...updatePayload
        };
        console.log("SERVER ACTION: Constructed response:", constructedResponse);
        return constructedResponse as Trainer;
      }
      
      console.log("SERVER ACTION: Successfully re-fetched trainer after update:", updatedTrainer);
      return updatedTrainer as Trainer;
    }
    
    console.log("SERVER ACTION: Update successful with returned data:", data);
    return data as Trainer;
    
  } catch (error) {
    console.error("SERVER ACTION: Unexpected error in updateTrainer:", error);
    throw error;
  }
}

export async function deleteTrainers(ids: number[]) {
  // Use service client to bypass RLS
  const supabase = await createServiceClient()
  
  console.log("SERVER ACTION: Attempting to delete trainers with IDs:", ids)
  console.log("SERVER ACTION: Using service role client to bypass RLS");
  
  // Handle each trainer deletion individually to properly handle member associations
  const results = [];
  
  for (const id of ids) {
    try {
      const result = await deleteTrainer(id);
      results.push({ id, success: true });
    } catch (error) {
      console.error(`SERVER ACTION: Error deleting trainer ID ${id}:`, error);
      results.push({ id, success: false, error });
    }
  }
  
  // Check if any deletions failed
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    throw new Error(`Failed to delete ${failures.length} out of ${ids.length} trainers`);
  }
  
  return { success: true }
}

export async function deleteTrainer(id: number) {
  console.log("SERVER ACTION: deleteTrainer called with ID:", id);
  const supabase = await createClient()
  
  try {
    // First check if any members are assigned to this trainer
    const { data: members, error: memberCheckError } = await supabase
      .from("Member")
      .select("member_id")
      .eq("trainer_id", id);
      
    if (memberCheckError) {
      console.error("SERVER ACTION: Error checking members with trainer:", memberCheckError);
      throw new Error(`Error checking for members with trainer: ${memberCheckError.message}`);
    }
    
    if (members && members.length > 0) {
      // Remove the trainer assignment from all members
      const { error: updateError } = await supabase
        .from("Member")
        .update({ trainer_id: null })
        .eq("trainer_id", id);
        
      if (updateError) {
        console.error("SERVER ACTION: Error removing trainer from members:", updateError);
        throw new Error(`Error removing trainer from members: ${updateError.message}`);
      }
      
      console.log(`SERVER ACTION: Removed trainer assignment from ${members.length} members`);
    }
    
    // Now delete the trainer
    const { error } = await supabase
      .from("Trainer")
      .delete()
      .eq("trainer_id", id)
    
    if (error) {
      console.error("SERVER ACTION: Error deleting trainer:", error);
      throw new Error(`Error deleting trainer: ${error.message}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("SERVER ACTION: Unexpected error in deleteTrainer:", error);
    throw error;
  }
}

export async function getTrainersForDropdown() {
  console.log("SERVER ACTION: getTrainersForDropdown called");
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("Trainer")
    .select("trainer_id, name")
    .order("name");
    
  if (error) {
    console.error("Error fetching trainers for dropdown:", error);
    throw new Error(`Error fetching trainers: ${error.message}`);
  }
  
  return data;
} 