import { NextResponse } from 'next/server';
import { getUsersLoggedExercises} from '../../services/trainerUiData';

export async function POST(req) {
    try {
      const {  dateRange,exercise,userId } = await req.json(); 
      const result = await getUsersLoggedExercises({
        dateRange,exercise,userId
      });
      console.log(JSON.stringify(result, null, 2))
    //  const dataArray =  res.json({result});
      
      return  NextResponse.json(result, {status: 200,});
    } catch (error) {
      
      //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
      return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
    }