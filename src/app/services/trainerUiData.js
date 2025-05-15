//import { supabase } from "../../lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
//import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server"
import { GoogleGenAI } from '@google/genai'

export async function getUsers() {
  try {

    // const authHeader = headers().get('Authorization');
    // const token = authHeader.split(' ')[1];

    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()




    //console.log(token)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    // console.log(user)
    const userId = user.id;
    const role = "Member"

    const { data: members, error: getUsersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', role); // Filter by user ID

    if (getUsersError) {
      throw new Error(`Error fetching routine details: ${getUsersError.message}`);
    }


    return members;

  } catch (error) {
    console.error('Error processing request:', error.message);
    throw new Error(`Error processing request: ${error.message}`);
  }
}




export async function saveNutrtionPlan({ title, breakfast, lunch, dinner, startdate, enddate }) {

  // const authHeader = headers().get('Authorization');
  // const token = authHeader.split(' ')[1];

  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()





  // Get the user information from the token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error(`Error fetching user: ${userError?.message || 'User not found'}`);
  }


  // const getRandomBigInt64 = () => {
  //   const max = 2n ** 63n - 1n; // Max signed 64-bit int
  //   const rand = BigInt.asIntN(64, BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  //   return rand;
  // }

  const getRandomBigInt64 = () => {
    // Max safe integer in JS: 2^53 - 1
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    return BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  }

  const member_id = getRandomBigInt64().toString();

  const trainerId = getRandomBigInt64().toString();


  const userId = user.id;

  const { data: dietplan, error: dietplanError } = await supabase
    .from('DietPlan')
    .insert({ details: title, user_id_fk: userId, breakfast: breakfast, lunch: lunch, dinner: dinner, start_date: startdate, end_date: enddate, })
    .select()
    .single();

  if (dietplanError) {
    throw new Error(`Error inserting nutritionPlan: ${dietplanError.message}`);
  }

  return {
    dietplan,
  };
}





export async function saveWorkoutPlan({ title, exercises, userId }) {
  const owner = "trainer";
  console.log("memberid", userId);
  console.log("exercises in api", exercises);
  // const authHeader = headers().get('Authorization');
  // const token = authHeader.split(' ')[1];


  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()




  // Get the user information from the token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error(`Error fetching user: ${userError?.message || 'User not found'}`);
  }

  const trainerId = user.id;

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ title: title, owner: owner, user_id_fk: userId })
    .select()
    .single();

  if (routineError) {
    throw new Error(`Error inserting routine: ${routineError.message}`);
  }

  const routine_id = routine.id; // Get the inserted routine ID

  // Check if there is at least one exercise ID
  const hasValidExerciseId = exercises.some(exercise => exercise.id);

  if (!hasValidExerciseId) {
    // Rollback the routine insert if there are no valid exercise IDs
    await supabase
      .from('routines')
      .delete()
      .eq('id', routine_id);

    throw new Error('No valid exercise IDs provided, transaction aborted. Routine has been deleted.');
  }

  // Prepare exercise entries, allowing empty weights and reps
  const exerciseEntries = exercises.flatMap((exercise) => {
    const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];
    const numberOfSets = setsArray.length;
    console.log("number of sets", numberOfSets)

    return setsArray.map((set, index) => ({
      sets: index + 1,
      weight: exercise.weights && exercise.weights[index] ? parseInt(exercise.weights[index], 10) : null, // Allow null if no weight
      reps: exercise.reps && exercise.reps[index] ? parseInt(exercise.reps[index], 10) : null, // Allow null if no reps
      exercise_id_fk: exercise.id,
      routine_id_fk: routine_id,
    }));
  });
  console.log("exerciseentries", exerciseEntries)
  // Insert the exercises
  const { data: routineExercises, error: exercisesError } = await supabase
    .from('routine_exercises')
    .insert(exerciseEntries)
    .select();

  const { data: savedroutines, error: savedroutinesError } = await supabase
    .from('saved_routines')
    .insert({ user_id_fk: userId, routine_id_fk: routine_id })
    .select();

  if (exercisesError) {
    // Rollback the routine insert if exercises insert fails
    await supabase
      .from('routines')
      .delete()
      .eq('id', routine_id);

    await supabase
      .from('saved_routines')
      .delete()
      .eq('routine_id_fk', routine_id);

    throw new Error(`Error inserting routine exercises: ${exercisesError.message}`);
  }

  return {
    routine,
    routineExercises,
    savedroutines
  };
}




// chcek after installing gemini

// export async function geminiChat({ history, message }) {
//   if (!history || !message) {
//     throw new Error("History and message are required");
//   }

//   //  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);


//   try {

//     // Initialize the chat
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: "You are a personal trainer in a body building gym. Your answers to questions related to health and fitness should be pointwise. If a question is not related to health and fitness,working out in gym, the response should be, That is beyond my knowledge." });
//     const chat = model.startChat({ history });

//     // Send the message
//     const result = await chat.sendMessage(message);

//     // Return the response
//     return {
//       response: result.response.text(),
//     };
//   } catch (error) {
//     console.error("Error calling Gemini API:", error);
//     throw new Error("Error communicating with Gemini API");
//   }
// }





// export async function geminiChat({ history, message }) {

//   const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//   if (!history || !message) {
//     throw new Error("History and message are required");
//   }

//   try {
//     const chat = genAI.chats.create({
//       model: "gemini-2.0-flash",
//       systemInstruction:
//         "You are a personal trainer in a bodybuilding gym. You answers to questions related to health and fitness.Keep all responses concise and pointwise. If a question is not related to health and fitness or working out in a gym, the response should be: 'That is beyond my knowledge.'",
//       config: {
//         maxOutputTokens: 500,
//         temperature: 0.1,
//       },
//       history: history.map((entry) => ({
//         role: entry.role,
//         parts: [{ text: entry.content }],
//       })),
//     });

//     const response = await chat.sendMessage({ message });

//     return {
//       response: response.text,
//     };
//   } catch (error) {
//     console.error("Error calling Gemini API:", error);
//     throw new Error("Error communicating with Gemini API");
//   }
// }






//const { GoogleGenAI } = require("@google/genai");

export async function geminiChat({ history, message }) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    // Create chat session with history
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: history.map(entry => ({
        role: entry.role,
        parts: entry.parts
      })),
      config: {
        maxOutputTokens: 300,
        temperature: 0.1,
      },
      // System instruction as part of the chat configuration
      systemInstruction: {
        role: "system",
        parts: [{
          text: "You are a personal trainer in a bodybuilding gym. You answer questions related to health and fitness. Keep responses concise and pointwise.Limit answers to 4-5 short bullet points unless more are necessary. If a question is unrelated to health/fitness, respond: 'That is beyond my knowledge.'"
        }]
      }
    });

    // Send message and get response
    const response = await chat.sendMessage({
      message: message
    });

    console.log("response in geimin", response.text);
    return {
      response: response.text,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Error communicating with Gemini API");
  }
}


































export async function getUsersLoggedExercises({ dateRange, exercise, userId }) {
  try {
    // const authHeader = headers().get('Authorization');
    // const token = authHeader.split(' ')[1];

    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()




    //console.log(token)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    // console.log(user)
    const trainerId = user.id;
    const startDate = dateRange.start
    const endDate = dateRange.to
    console.log(startDate)
    console.log(endDate)


    // const thirtyDaysAgo = new Date();
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // console.log(thirtyDaysAgo)
    //   const { data:loggedexercises, error:logerror1 } = await supabase
    //   .from('loggedExercises')
    //   .select('*')
    //   .eq('user_id_fk', userId)
    //  .lte("created_at", endDate)
    //   .gte("created_at", startDate)

    //   if (exercise !== null) {
    //     query = loggedexercises.eq('exercise_id_fk', exercise);
    //     const { data:loggedexercises1, logerror2 } = await query;
    //     if (logerror2) {
    //       throw new Error(`Error fetching existing exercises: ${logerror2.message}`);
    //     }
    //     return loggedexercises1
    //   }

    let query = supabase
      .from('loggedExercises')
      .select('*')
      .eq('user_id_fk', userId)
      .lte('created_at', endDate)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    // Conditionally add the exercise filter if `exercise` is not null
    if (exercise !== null) {
      query = query.eq('exercise_id_fk', exercise);
    }

    // Execute the query
    const { data: loggedExercises, error: logError } = await query;

    if (logError) {
      throw new Error(` ${logError.message}`);
    }

    return {
      loggedExercises
    }


  } catch (error) {
    console.error('Error processing request:', error.message);
    throw new Error(`Error processing request: ${error.message}`);
  }

}