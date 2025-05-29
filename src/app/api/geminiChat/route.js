//import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from '@google/genai'
import { geminiChat } from '../../services/trainerUiData';
import { NextResponse } from 'next/server';
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY); // Use an environment variable for the API key

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const { history, message } = req.body;

//   if (!history || !message) {
//     return res.status(400).json({ error: "History and message are required" });
//   }

//   try {
//     // Initialize chat
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const chat = model.startChat({ history });

//     // Send the message
//     const result = await chat.sendMessage(message);

//     // Send the response back to the frontend
//     res.status(200).json({ response: result.response.text() });
//   } catch (error) {
//     console.error("Error calling Gemini API:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }





// export async function POST(req) {
//     try {

//         const {  history, message } = await req.json(); 
//         const result = await geminiChat({
//             history, message
//         });
//        console.log("gemini",result);
//         console.log(JSON.stringify(result, null, 2))

//       return NextResponse.json({  message: result.response.text() });
//     } catch (error) {
//       console.error('Error processing request:', error.message);
//       return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
//     }
//   }




export async function POST(req) {
  try {
    const { history, message } = await req.json();

    if (!history || !message) {
      return NextResponse.json(
        { error: "History and message are required" },
        { status: 400 }
      );
    }

    const result = await geminiChat({ history, message });

    // console.log("Gemini Response:", result);

    return NextResponse.json({ response: result.response });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return NextResponse.json(
      { error: "Error processing request", details: error.message },
      { status: 500 }
    );
  }
}
