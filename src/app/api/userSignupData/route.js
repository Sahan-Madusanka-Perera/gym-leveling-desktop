import { NextResponse } from 'next/server';
import { saveSignupData } from '../../services/signupDataService'

export async function POST(req) {
  try {
    console.log("inside post")
    const { userInfo } = await req.json();
    // console.log(exercises)
    const result = await saveSignupData({
      userInfo
    });
    return NextResponse.json({ message: 'Data received successfully', receivedData: result });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}
