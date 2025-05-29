//import { supabase } from "../../lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server"

export async function saveProgress({ weight, fileName }) {

  // const authHeader = headers().get('Authorization');
  // const token = authHeader.split(' ')[1];


  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()



  // Get the user information from the token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error(`Error fetching user: ${userError?.message || 'User not found'}`);
  }

  const userId = user.id;
  console.log("filename", fileName);
  const { data: progress, error: progressError } = await supabase
    .from('Progress')
    .insert({ user_id: userId, weight: weight, fileName: fileName })
    .select()
    .single();

  if (progressError) {
    throw new Error(`Error inserting booking: ${bookingError.message}`);
  }

  return {
    progress,
  };
}




export async function getProgress() {
  try {

    // const authHeader = headers().get('Authorization');
    // const token = authHeader.split(' ')[1];

    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()



    //console.log(token)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    // console.log(user)
    const userId = user.id;


    const { data: progress, error: getProgressError } = await supabase
      .from('Progress')
      .select('*')
      .eq('user_id', userId); // Filter by user ID

    if (getProgressError) {
      throw new Error(`Error fetching routine details: ${getProgressError.message}`);
    }


    return progress;

  } catch (error) {
    console.error('Error processing request:', error.message);
    throw new Error(`Error processing request: ${error.message}`);
  }
}
