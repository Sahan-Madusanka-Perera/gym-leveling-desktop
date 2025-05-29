import { NextResponse } from 'next/server';
import { getStreak, updateStreak } from '../../services/levelService';


export async function GET() {

    try {

        const result = await getStreak();
        console.log("result", result)

        return NextResponse.json(result, { status: 200, });
    } catch (error) {

        //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
        return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
}


export async function POST(req) {
    try {
        const { streak_count, last_workout_date } = await req.json();
        const result = await updateStreak({
            streak_count, last_workout_date
        });
        console.log(JSON.stringify(result, null, 2))
        //  const dataArray =  res.json({result});

        return NextResponse.json(result, { status: 200, });
    } catch (error) {

        //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
        return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
}
