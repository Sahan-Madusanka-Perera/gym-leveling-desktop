// app/actions/members.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { memberSchema, type Member } from "@/types/members"

export { Member }  // Re-export the Member type

export async function getMembers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("Member")
    .select("*")
  
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
    trainer: "Assign trainer",
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