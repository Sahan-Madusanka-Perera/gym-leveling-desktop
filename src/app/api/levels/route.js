import { NextResponse } from 'next/server';
import { getLevels, updateLevels } from '../../services/levelService';


// export async function GET() {
//     try {

//         const result = await getLevels();
//         console.log("result", result)

//         return NextResponse.json(result, { status: 200, });
//     } catch (error) {

//         //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
//         return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
//     }
// }


export async function GET() {
    try {

        const result = await getLevels();
        console.log("result", result)

        return NextResponse.json(result, { status: 200, });
    } catch (error) {

        //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
        return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
}












export async function POST(req) {
    try {
        console.log("inside level post");
        const { newXP, newLevel } = await req.json();
        const result = await updateLevels({
            newXP, newLevel
        });
        console.log(JSON.stringify(result, null, 2))
        //  const dataArray =  res.json({result});

        return NextResponse.json(result, { status: 200, });
    } catch (error) {

        //return NextResponse(JSON.stringify({ error: error.message }), {status: 500,});
        return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
}
