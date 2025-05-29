import { NextResponse } from 'next/server';
import { updateRoutines } from '../../services/routineService';

export async function POST(req) {
    try {
       console.log("inside post")
        const {  newexercises, routineId } = await req.json(); 
        const result = await updateRoutines({
          newexercises,
          routineId,
        });
        console.log(JSON.stringify(result, null, 2))
        // const result2 = await insertRoutine({
        //   newexercises,
        //   id,
        // });
      return NextResponse.json({ message: 'Data received successfully'});
    } catch (error) {
      console.error('Error processing request:', error.message);
      return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
  }
