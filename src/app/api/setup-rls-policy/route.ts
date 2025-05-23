/**
 * Supabase Row Level Security (RLS) Policy Setup
 * 
 * This file creates proper RLS policies for the Trainer and Member tables to fix the "no rollback" issue
 * that occurs when updates fail due to permission problems.
 * 
 * ## What is RLS?
 * Row Level Security is a PostgreSQL feature that Supabase uses to control access to table rows.
 * When RLS is enabled on a table, all access is denied by default unless explicitly allowed
 * through policies.
 * 
 * ## The "No Rollback" Problem
 * The form submission was failing because:
 * 1. RLS was enabled on the tables
 * 2. No policy existed to allow authenticated users to update records
 * 3. The client sends the update, Supabase rejects it due to RLS
 * 4. The UI shows "Update succeeded but returned no data" error
 * 
 * ## Solution
 * We create the following policies to fix the issue:
 * 1. `allow_[table]_updates_to_authenticated_users` - Allows authenticated users to update records
 * 2. `allow_[table]_select_to_authenticated_users` - Allows authenticated users to view records
 * 3. `allow_[table]_insert_to_authenticated_users` - Allows authenticated users to create records
 * 
 * With these policies in place, the updates will succeed without needing to bypass RLS using the 
 * service role client, which is more secure.
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  console.log("SETUP-RLS-POLICY: Setting up correct RLS policies for tables");
  
  try {
    // Use service client to bypass any existing RLS
    const supabase = await createServiceClient();
    
    // First check existing policies for Trainer table
    const { data: existingTrainerPolicies, error: trainerPoliciesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'Trainer');
      
    if (trainerPoliciesError) {
      console.error("SETUP-RLS-POLICY: Error checking existing Trainer policies:", trainerPoliciesError);
      return NextResponse.json({
        success: false,
        error: trainerPoliciesError,
        message: "Failed to check existing Trainer policies"
      }, { status: 500 });
    }
    
    // Check existing policies for Member table
    const { data: existingMemberPolicies, error: memberPoliciesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'Member');
      
    if (memberPoliciesError) {
      console.error("SETUP-RLS-POLICY: Error checking existing Member policies:", memberPoliciesError);
      return NextResponse.json({
        success: false,
        error: memberPoliciesError,
        message: "Failed to check existing Member policies"
      }, { status: 500 });
    }
    
    console.log("SETUP-RLS-POLICY: Existing Trainer policies:", existingTrainerPolicies);
    console.log("SETUP-RLS-POLICY: Existing Member policies:", existingMemberPolicies);
    
    // Create policies for both tables
    const { data: policyResult, error: policyError } = await supabase.rpc(
      'execute_sql',
      { 
        sql: `
          -- First ensure RLS is enabled on the Trainer table
          ALTER TABLE "public"."Trainer" ENABLE ROW LEVEL SECURITY;
          
          -- Create a policy for updating trainers for authenticated users
          CREATE POLICY IF NOT EXISTS "allow_trainer_updates_to_authenticated_users"
          ON "public"."Trainer"
          AS PERMISSIVE
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);
          
          -- Create a policy for selecting trainers for authenticated users
          CREATE POLICY IF NOT EXISTS "allow_trainer_select_to_authenticated_users"
          ON "public"."Trainer"
          AS PERMISSIVE
          FOR SELECT
          TO authenticated
          USING (true);
          
          -- Create a policy for inserting trainers for authenticated users
          CREATE POLICY IF NOT EXISTS "allow_trainer_insert_to_authenticated_users"
          ON "public"."Trainer"
          AS PERMISSIVE
          FOR INSERT
          TO authenticated
          WITH CHECK (true);
          
          -- Now ensure RLS is enabled on the Member table
          ALTER TABLE "public"."Member" ENABLE ROW LEVEL SECURITY;
          
          -- Create a policy for updating members for authenticated users
          CREATE POLICY IF NOT EXISTS "allow_member_updates_to_authenticated_users"
          ON "public"."Member"
          AS PERMISSIVE
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);
          
          -- Create a policy for selecting members for authenticated users
          CREATE POLICY IF NOT EXISTS "allow_member_select_to_authenticated_users"
          ON "public"."Member"
          AS PERMISSIVE
          FOR SELECT
          TO authenticated
          USING (true);
          
          -- Create a policy for inserting members for authenticated users
          CREATE POLICY IF NOT EXISTS "allow_member_insert_to_authenticated_users"
          ON "public"."Member"
          AS PERMISSIVE
          FOR INSERT
          TO authenticated
          WITH CHECK (true);
          
          -- Create a specific policy for updating trainer_id in the Member table
          CREATE POLICY IF NOT EXISTS "allow_trainer_assignment_to_authenticated_users"
          ON "public"."Member"
          AS PERMISSIVE
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (
            -- Allow setting trainer_id to NULL
            (trainer_id IS NULL) OR 
            -- Or ensure the trainer exists (using EXISTS instead of JOIN for better performance)
            EXISTS (
              SELECT 1 FROM "public"."Trainer" 
              WHERE "Trainer"."trainer_id" = "Member"."trainer_id"
            )
          );
        `
      }
    );
    
    if (policyError) {
      console.error("SETUP-RLS-POLICY: Error creating policies:", policyError);
      return NextResponse.json({
        success: false,
        error: policyError,
        message: "Failed to create RLS policies"
      }, { status: 500 });
    }
    
    // Verify the Trainer policies were created
    const { data: updatedTrainerPolicies, error: verifyTrainerError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'Trainer');
      
    if (verifyTrainerError) {
      console.error("SETUP-RLS-POLICY: Error verifying Trainer policies:", verifyTrainerError);
      return NextResponse.json({
        success: false,
        error: verifyTrainerError,
        message: "Failed to verify Trainer policy creation"
      }, { status: 500 });
    }
    
    // Verify the Member policies were created
    const { data: updatedMemberPolicies, error: verifyMemberError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'Member');
      
    if (verifyMemberError) {
      console.error("SETUP-RLS-POLICY: Error verifying Member policies:", verifyMemberError);
      return NextResponse.json({
        success: false,
        error: verifyMemberError,
        message: "Failed to verify Member policy creation"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "RLS policies for tables successfully set up",
      trainer: {
        previousPolicies: existingTrainerPolicies,
        currentPolicies: updatedTrainerPolicies
      },
      member: {
        previousPolicies: existingMemberPolicies,
        currentPolicies: updatedMemberPolicies
      }
    });
    
  } catch (error) {
    console.error("SETUP-RLS-POLICY: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 