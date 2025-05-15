import { NextResponse } from 'next/server';
import { saveProgress, getProgress } from '../../services/progressService'
// import {supabase}  from "../../../lib/supabase";
import { headers } from 'next/headers';
import { createClient } from "@supabase/supabase-js";




export async function POST(req) {
  try {
    const { weight, fileName } = await req.json();
    //  console.log(exercises)
    const result = await saveProgress({
      weight,
      fileName
    });
    return NextResponse.json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}


export async function GET() {
  try {

    const result = await getProgress();

    return NextResponse.json(result, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}