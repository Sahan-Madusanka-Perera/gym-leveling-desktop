//import { supabase } from "../../lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server"

export async function saveSignupData({ userInfo }) {

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


  const updateData = {};
  if (userInfo.gender !== null) updateData.gender = userInfo.gender;
  if (userInfo.dateOfBirth !== null) updateData.dateofBirth = userInfo.dateOfBirth;
  if (userInfo.experienceLevel !== null) updateData.level = userInfo.experienceLevel

  console.log("uuserinfo from frontend", userInfo);

  console.log("updatedata", updateData);


  const { data: signupdata, error: signupdataError } = await supabase
    .from('users')
    .update(userInfo)
    .eq('userId', userId)



  if (signupdataError) {
    throw new Error(`Error inserting data: ${signupdataError.message}`);
  }


  return {
    signupdata,
  };
}


export async function saveAuthdata({ authData }) {

  // console.log(userInfo)
  // const authHeader = headers().get('Authorization');
  // const token = authHeader.split(' ')[1];

  // Get the user information from the token
  //  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  // if (userError || !user) {
  //   throw new Error(`Error fetching user: ${userError?.message || 'User not found'}`);
  // } 
  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()



  const { data: signupdata, error: signupdataError } = await supabase
    .from('users')
    .insert({ userId: authData.userId, userName: authData.userName, role: authData.role })
    .select()
    .single();


  const { data: leveldata, error: leveldataError } = await supabase
    .from('levels')
    .insert({ user_id_fk: userId, level: 1, xp: 0, streak_count: 0, last_workout_date: null })
    .select()
    .single();




  if (signupdataError) {
    throw new Error(`Error inserting data: ${signupdataError.message}`);
  }

  if (leveldataError) {
    throw new Error(`Error inserting data: ${leveldataError.message}`);
  }

  return {
    signupdata,
    leveldata,
  };
}





export async function getUserRole() {
  try {
    // console.log(userInfo)
    //  const authHeader = await headers().get('Authorization');
    // const token = authHeader.split(' ')[1];

    // const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    // if (userError || !user) {
    //   throw new Error(`Error fetching user: ${userError?.message || 'User not found'}`);
    // }

    // const ismobile = requestHeaders.get("x-isMobile")

    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()


    const { data: { user }, usererror } = await supabase.auth.getUser(token);

    //  console.log("user in api", user);

    if (usererror) {
      throw new Error(`Error fetching user: ${usererror?.message}`);
    }

    const userId = user.id;


    const { data, error } = await supabase
      .from("users")
      .select("role,userName,dateofBirth,gender,level") // Fetch all columns for debugging
      .eq("userId", userId);
    //.select("*")

    console.log("data in getuserole", data);
    console.log("error in getuserole", error);

    const data2 = ["rand"];
    return {
      data
    }
  }
  catch (error) {
    console.error('Error processing request:', error.message);
    throw new Error(`Error processing request: ${error.message}`);
  }
}
