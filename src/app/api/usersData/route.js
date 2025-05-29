import { getUsers} from '../../services/trainerUiData'
import { NextResponse } from 'next/server';
export async function GET() {
    try {
      
      const result = await getUsers();
      console.log(JSON.stringify(result, null, 2))
       
      
      return  NextResponse.json(result, {status: 200,});
    } catch (error) {
      return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
    }