import { NextResponse } from 'next/server';
import { insertBooking, getBookings, deleteBooking, updateBooking } from '../../services/bookingService'

export async function GET() {
  try {

    const result = await getBookings();
    //const {id,title,routine_exercises} = result
    // const separatedRoutines = result.map((routine) => [routine]);
    console.log(JSON.stringify(result, null, 2))


    return NextResponse.json(result, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    console.log("inside post")
    const { timeText, newEvent, selected } = await req.json();
    // console.log(exercises)
    const result = await insertBooking({
      timeText, newEvent, selected
    });

    // console.log('Received body:',timeText);
    // console.log('Received body:',newEvent);
    // console.log('Received body:',selected); 


    return NextResponse.json({ message: 'Data received successfully', receivedData: result });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}


export async function DELETE(req) {
  try {
    const { bookingid } = await req.json();
    //console.log(id)
    const result = await deleteBooking({
      bookingid,
    });
    return NextResponse.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }

}




export async function PUT(req) {
  try {
    // console.log("inside post")
    const { timeText, newEvent, bookingid } = await req.json();
    console.log("inside put time", timeText)
    console.log("inside post eveb", newEvent)
    console.log("inside put id", bookingid)
    const result = await updateBooking({
      timeText, newEvent, bookingid
    });
    console.log("result in backend endpoint", result);
    return NextResponse.json({ message: 'Data received successfully', receivedData: result });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}


