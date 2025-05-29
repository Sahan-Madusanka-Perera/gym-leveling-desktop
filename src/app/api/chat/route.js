import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabase";
import { headers } from "next/headers";

// export default async function handler(req, res) {
//   if (req.method === 'GET') {
//     const { data, error } = await supabase
//       .from('messages')
//       .select('*')
//       .order('created_at', { ascending: true });

//     if (error) return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
//     return NextResponse.json(data, { status: 200, });
//   }

//   if (req.method === 'POST') {
//     const { text, userId, trainerId } = await req.json();
//     const { data, error } = await supabase
//       .from('messages')
//       .insert([{ sender_id: userId, receiver_id: trainerId, content: text }]);
//     if (error) return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
//     return NextResponse.json(data, { status: 200, });
//   }
// }





export async function GET() {

  try {

    // const result = await getStreak();
    // console.log("result", result)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });


    return NextResponse.json(data, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}



export async function POST(req) {
  try {
    // const { streak_count, last_workout_date } = await req.json();
    // const result = await updateStreak({
    //     streak_count, last_workout_date
    // });
    // console.log(JSON.stringify(result, null, 2))
    // //  const dataArray =  res.json({result});

    const { text, userId, trainerId } = await req.json();
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: userId, receiver_id: trainerId, content: text }]);


    return NextResponse.json(data, { status: 200, });
  } catch (error) {

    //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
  }
}
