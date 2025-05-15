import { NextResponse } from 'next/server';
import { saveAuthdata, getUserRole } from '../../services/signupDataService'

export async function POST(req) {
  try {
    console.log("inside post")
    const { authData } = await req.json();
    console.log(authData)
    const result = await saveAuthdata({
      authData
    });
    return NextResponse.json({ message: 'Data received successfully', receivedData: result });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}


export async function GET() {
  try {

    const result = await getUserRole();
    //const {id,title,routine_exercises} = result
    // const separatedRoutines = result.map((routine) => [routine]);
    console.log(JSON.stringify(result, null, 2))


    return NextResponse.json(result, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}