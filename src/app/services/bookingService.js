//import { supabase } from "../../lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server"

export async function insertBooking({ newEvent, selected, timeText }) {

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

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({ event: newEvent, booked_date: selected, booked_time: timeText, user_id_fk: userId })
    .select()
    .single();

  if (bookingError) {
    throw new Error(`Error inserting booking: ${bookingError.message}`);
  }

  return {
    booking,
  };
}


export async function getBookings() {
  try {

    // const authHeader = headers().get('Authorization');
    // const token = authHeader.split(' ')[1];
    //console.log(token)

    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()


    const { data: { user }, error } = await supabase.auth.getUser(token);
    // console.log(user)
    const userId = user.id;


    const { data: savedBookings, error: savedBookingsError } = await supabase
      .from('bookings')
      .select('id,event,booked_date,booked_time')
      .eq('user_id_fk', userId); // Filter by user ID

    if (savedBookingsError) {
      throw new Error(`Error fetching routine details: ${savedBookingsError.message}`);
    }


    return savedBookings;

  } catch (error) {
    console.error('Error processing request:', error.message);
    throw new Error(`Error processing request: ${error.message}`);
  }
}


export async function deleteBooking({ bookingid }) {
  console.log(bookingid)
  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingid);

  if (error) {
    return NextResponse.json(
      { message: 'Failed to delete routine', error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Routine deleted successfully' },
    { status: 200 }
  );
}



export async function updateBooking({ timeText, newEvent, bookingid }) {

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

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .update({ event: newEvent, booked_time: timeText, })
    .eq('id', bookingid)
    .select();


  if (bookingError) {
    throw new Error(`Error inserting booking: ${bookingError.message}`);
  }

  return {
    booking,
  };
}
