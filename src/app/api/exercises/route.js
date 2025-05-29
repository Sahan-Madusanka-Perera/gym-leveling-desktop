import { NextResponse } from 'next/server';
import { getSavedRoutinesByUser, insertRoutine, deleteRoutine } from '../../services/routineService'
// import {supabase}  from "../../../lib/supabase";
import { headers } from 'next/headers';
import { createClient } from "@supabase/supabase-js";


export async function GET() {
  try {

    const result = await getSavedRoutinesByUser();
    //const {id,title,routine_exercises} = result
    const separatedRoutines = result.map((routine) => [routine]);
    // console.log(JSON.stringify(separatedRoutines, null, 2))


    return NextResponse.json(result, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    // console.log("inside post")
    const { title, exercises } = await req.json();
    // console.log(exercises)
    const result = await insertRoutine({
      title,
      exercises,
    });
    return NextResponse.json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}


export async function DELETE(req) {

  try {
    const { routineId } = await req.json();
    // console.log(routineId)
    const result = await deleteRoutine({
      routineId,
    });
    return NextResponse.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }

}