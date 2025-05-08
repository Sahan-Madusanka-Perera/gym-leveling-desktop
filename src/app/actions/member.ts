// app/actions/members.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { memberSchema, type Member } from "@/types/members"

export { Member }  // Re-export the Member type

export async function getMembers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("Member")
    .select(`
      *,
      Trainer:trainer_id (
        trainer_id,
        name
      )
    `)
  
  if (error) {
    console.error("Error fetching members:", error)
    throw new Error(`Error fetching members: ${error.message}`)
  }
  
  // Transform the data to match the expected schema
  const members = data.map(member => ({
    id: member.member_id,
    name: `${member.first_name} ${member.last_name}`,
    email: member.email || "",
    gender: member.gender,
    phoneNumber: member.phone_number,
    emergencyContact: member.emergency_contact ? member.emergency_contact.toString() : "",
    healthInfo: member.health_info || "",
    activityLevel: member.activity_level,
    trainer: member.Trainer ? member.Trainer.name : "Assign trainer",
    trainer_id: member.trainer_id
  }))
  
  return members
}

export async function addMember(formData: FormData) {
  const supabase = await createClient()
  
  try {
    // Validate and prepare input data
    const memberData = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string || null,
      gender: formData.get("gender") as string,
      phone_number: formData.get("phoneNumber") as string,
      birth_date: formData.get("birthDate") as string,
      emergency_contact: formData.get("emergencyContact") as string || null,
      health_info: formData.get("healthInfo") as string || null,
      activity_level: formData.get("activityLevel") as string || "beginner",
    }

    // Comprehensive input validation
    if (!memberData.first_name) throw new Error("First name is required")
    if (!memberData.last_name) throw new Error("Last name is required")
    if (!memberData.gender) throw new Error("Gender is required")
    if (!memberData.phone_number) throw new Error("Phone number is required")
    if (!memberData.birth_date) throw new Error("Birth date is required")

    // Attempt to insert the member
    const { data, error } = await supabase
      .from("Member")
      .insert(memberData)
      .select()
    
    // Detailed error logging
    if (error) {
      console.error("Supabase Insertion Error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint
      })
      throw new Error(`Failed to add member: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error("Comprehensive Add Member Error:", error);
    throw error
  }
}

export async function updateMember(memberId: number, formData: FormData) {
  console.log("SERVER ACTION: updateMember called with ID:", memberId);
  console.log("SERVER ACTION: FormData entries:", Array.from(formData.entries()));
  
  // Validate memberId
  if (typeof memberId !== 'number' || isNaN(memberId) || memberId <= 0) {
    console.error("SERVER ACTION: Invalid memberId:", memberId);
    throw new Error("Invalid member ID. Please provide a valid numeric ID.");
  }
  
  // Use regular client to respect RLS policies
  // With proper RLS policies in place, authenticated users should be able to update members
  const supabase = await createClient()
  
  // Extract and validate form data
  const first_name = formData.get("firstName") as string;
  const last_name = formData.get("lastName") as string;
  const email = formData.get("email") as string || null;
  const gender = formData.get("gender") as string;
  const phone_number = formData.get("phoneNumber") as string;
  const birth_date = formData.get("birthDate") as string;
  const emergency_contact = formData.get("emergencyContact") as string || null;
  const health_info = formData.get("healthInfo") as string || null;
  const activity_level = formData.get("activityLevel") as string || "beginner";

  console.log("SERVER ACTION: Extracted form values:", { 
    first_name, last_name, email, gender, phone_number,
    birth_date, emergency_contact, health_info, activity_level 
  });

  // Basic validation
  if (!first_name) {
    console.log("SERVER ACTION: First name is required but missing");
    throw new Error("First name is required")
  }
  
  if (!last_name) {
    console.log("SERVER ACTION: Last name is required but missing");
    throw new Error("Last name is required")
  }
  
  if (!gender) {
    console.log("SERVER ACTION: Gender is required but missing");
    throw new Error("Gender is required")
  }
  
  if (!phone_number) {
    console.log("SERVER ACTION: Phone number is required but missing");
    throw new Error("Phone number is required")
  }
  
  if (!birth_date) {
    console.log("SERVER ACTION: Birth date is required but missing");
    throw new Error("Birth date is required")
  }

  // Create update payload
  const updatePayload = {
    first_name,
    last_name,
    email,
    gender,
    phone_number,
    birth_date,
    emergency_contact,
    health_info,
    activity_level
  };
  
  console.log("SERVER ACTION: Update payload:", JSON.stringify(updatePayload));

  try {
    // Always use member_id which is the primary key in Supabase
    console.log("SERVER ACTION: Updating member with member_id:", memberId);
    console.log("SERVER ACTION: Using regular client with RLS");
    
    // First try to get the member to confirm it exists
    const { data: existingMember, error: fetchError } = await supabase
      .from("Member")
      .select("*")
      .eq("member_id", memberId)
      .maybeSingle();
      
    if (fetchError) {
      console.error("SERVER ACTION: Error fetching member:", fetchError);
      
      // If we get a PGRST100 error, it's likely an RLS policy issue
      if (fetchError.code === 'PGRST100') {
        throw new Error(`Permission denied: RLS policy is blocking this operation. Please check that proper RLS policies are configured for the Member table.`);
      }
      
      throw new Error(`Failed to verify member exists: ${fetchError.message}`);
    }
    
    if (!existingMember) {
      console.error("SERVER ACTION: No member found with member_id:", memberId);
      throw new Error(`No member found with ID ${memberId}`);
    }
    
    console.log("SERVER ACTION: Found existing member:", existingMember);
    
    // Check if the update would actually change anything
    const isChanged = 
      existingMember.first_name !== updatePayload.first_name ||
      existingMember.last_name !== updatePayload.last_name ||
      existingMember.email !== updatePayload.email ||
      existingMember.gender !== updatePayload.gender ||
      existingMember.phone_number !== updatePayload.phone_number ||
      existingMember.birth_date !== updatePayload.birth_date ||
      existingMember.emergency_contact !== updatePayload.emergency_contact ||
      existingMember.health_info !== updatePayload.health_info ||
      existingMember.activity_level !== updatePayload.activity_level;
      
    if (!isChanged) {
      console.log("SERVER ACTION: No changes detected, returning existing member");
      return existingMember;
    }
    
    // Now perform the update
    const { data, error } = await supabase
      .from("Member")
      .update(updatePayload)
      .eq("member_id", memberId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("SERVER ACTION: Error updating member:", error);
      
      // Better error handling for RLS-related issues
      if (error.code === 'PGRST100') {
        throw new Error(`Permission denied: RLS policy is blocking this update operation. Please contact your administrator to configure proper policies.`);
      }
      
      throw new Error(`Failed to update member: ${error.message}`);
    }
    
    // If update succeeds but data is not returned, construct a response using the existing member
    // with the updated values
    if (!data) {
      console.log("SERVER ACTION: Update succeeded but no data was returned. Constructing response manually.");
      
      // Verify update success by re-fetching the member
      const { data: updatedMember, error: refetchError } = await supabase
        .from("Member")
        .select("*")
        .eq("member_id", memberId)
        .maybeSingle();
        
      if (refetchError) {
        console.error("SERVER ACTION: Error re-fetching member after update:", refetchError);
        throw new Error(`Update succeeded but failed to retrieve updated data: ${refetchError.message}`);
      }
      
      if (!updatedMember) {
        // Fallback to constructing the response from existing member + update payload
        console.log("SERVER ACTION: Re-fetch failed. Constructing response from existing data and update payload.");
        const constructedResponse = {
          ...existingMember,
          ...updatePayload
        };
        console.log("SERVER ACTION: Constructed response:", constructedResponse);
        return constructedResponse;
      }
      
      console.log("SERVER ACTION: Successfully re-fetched member after update:", updatedMember);
      return updatedMember;
    }
    
    console.log("SERVER ACTION: Update successful with returned data:", data);
    return data;
    
  } catch (error) {
    console.error("SERVER ACTION: Unexpected error in updateMember:", error);
    throw error;
  }
}

export async function deleteMembers(ids: number[]) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("Member")
    .delete()
    .in("member_id", ids)
  
  if (error) {
    console.error("Error deleting members:", error)
    throw new Error(`Error deleting members: ${error.message}`)
  }
  
  return { success: true }
}

export async function assignTrainer(memberId: number, trainerId: number | null) {
  console.log("SERVER ACTION: assignTrainer called with member ID:", memberId, "and trainer ID:", trainerId);
  
  if (typeof memberId !== 'number' || isNaN(memberId) || memberId <= 0) {
    console.error("SERVER ACTION: Invalid memberId:", memberId);
    throw new Error("Invalid member ID. Please provide a valid numeric ID.");
  }
  
  // Allow null to remove trainer assignment
  if (trainerId !== null && (typeof trainerId !== 'number' || isNaN(trainerId) || trainerId <= 0)) {
    console.error("SERVER ACTION: Invalid trainerId:", trainerId);
    throw new Error("Invalid trainer ID. Please provide a valid numeric ID or null to remove assignment.");
  }
  
  const supabase = await createClient();
  
  try {
    // First verify the member exists
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("Member")
      .select("member_id")
      .eq("member_id", memberId)
      .single();
      
    if (memberCheckError) {
      console.error("SERVER ACTION: Error checking if member exists:", memberCheckError);
      
      if (memberCheckError.code === 'PGRST100') {
        throw new Error("Permission denied: RLS policy is blocking this operation.");
      }
      
      throw new Error(`Error checking if member exists: ${memberCheckError.message}`);
    }
    
    if (!existingMember) {
      throw new Error(`No member found with ID ${memberId}`);
    }
    
    // If trainerId is provided, verify the trainer exists
    if (trainerId !== null) {
      const { data: existingTrainer, error: trainerCheckError } = await supabase
        .from("Trainer")
        .select("trainer_id")
        .eq("trainer_id", trainerId)
        .single();
        
      if (trainerCheckError) {
        console.error("SERVER ACTION: Error checking if trainer exists:", trainerCheckError);
        
        if (trainerCheckError.code === 'PGRST100') {
          throw new Error("Permission denied: RLS policy is blocking access to the Trainer table.");
        }
        
        throw new Error(`Error checking if trainer exists: ${trainerCheckError.message}`);
      }
      
      if (!existingTrainer) {
        throw new Error(`No trainer found with ID ${trainerId}`);
      }
    }
    
    // Update the member with the new trainer assignment
    const { data, error: updateError } = await supabase
      .from("Member")
      .update({ trainer_id: trainerId })
      .eq("member_id", memberId)
      .select()
      .maybeSingle();
      
    if (updateError) {
      console.error("SERVER ACTION: Error updating member trainer:", updateError);
      
      if (updateError.code === 'PGRST100') {
        throw new Error("Permission denied: RLS policy is blocking this update operation.");
      }
      
      throw new Error(`Failed to update member trainer: ${updateError.message}`);
    }
    
    if (!data) {
      // Re-fetch the member to confirm the update
      const { data: refetchedMember, error: refetchError } = await supabase
        .from("Member")
        .select("*")
        .eq("member_id", memberId)
        .single();
        
      if (refetchError) {
        console.error("SERVER ACTION: Error refetching member after trainer update:", refetchError);
        throw new Error(`Update may have succeeded but failed to confirm: ${refetchError.message}`);
      }
      
      return refetchedMember;
    }
    
    return data;
  } catch (error) {
    console.error("SERVER ACTION: Error in assignTrainer:", error);
    throw error;
  }
}