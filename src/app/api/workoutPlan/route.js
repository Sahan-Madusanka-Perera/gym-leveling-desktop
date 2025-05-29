import { NextResponse } from 'next/server';
import { saveWorkoutPlan } from '../../services/trainerUiData';

export async function POST(req) {
    try {
      
        const { title, exercises, userId  } = await req.json(); 
        const result = await saveWorkoutPlan({
            title, exercises, userId
        });
       console.log("memberid",userId);
        console.log(JSON.stringify(result, null, 2))

      return NextResponse.json({ message: 'Data received successfully'});
    } catch (error) {
      console.error('Error processing request:', error.message);
      return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
  }
