import { NextResponse } from 'next/server';
import { saveNutrtionPlan } from '../../services/trainerUiData';

export async function POST(req) {
  try {
    console.log("inside post")
    const { title, breakfast, lunch, dinner, startdate, enddate } = await req.json();
    const result = await saveNutrtionPlan({
      title, breakfast, lunch, dinner, startdate, enddate
    });
    console.log(JSON.stringify(result, null, 2))

    return NextResponse.json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}
