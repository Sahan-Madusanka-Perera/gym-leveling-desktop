import { NextResponse } from 'next/server';
import { getLoggedExercises, logExercises } from '../../services/routineService';

export async function POST(req) {
  try {
    // console.log("inside post")
    const { newexercises, routineId } = await req.json();
    const result = await logExercises({
      newexercises,
      routineId,
    });
    // console.log('----------');
    // console.log(newexercises);
    // console.log(JSON.stringify(result, null, 2))
    // // const result2 = await insertRoutine({
    //   newexercises,
    //   id,
    // });
    return NextResponse.json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}


export async function GET() {
  try {

    const result = await getLoggedExercises();
    //const {id,title,routine_exercises} = result

    // console.log(JSON.stringify(result, null, 2))


    return NextResponse.json(result, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}
