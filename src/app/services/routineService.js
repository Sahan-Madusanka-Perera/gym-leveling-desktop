//import { supabase } from "../../lib/supabase";
import { headers } from "next/headers";
//const { Pool } = require('pg');
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server"

export async function insertRoutine({ title, exercises }) {
  const owner = "user";
  //  console.log("inside insert routine user:", exercises)
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

  const userId = user.id;
  // console.log(exercises)
  // Insert the routine
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

    return setsArray.map((set, index) => ({
      sets: index + 1,
      weight: exercise.weights && exercise.weights[index] ? parseInt(exercise.weights[index], 10) : null, // Allow null if no weight
      reps: exercise.reps && exercise.reps[index] ? parseInt(exercise.reps[index], 10) : null, // Allow null if no reps
      exercise_id_fk: exercise.id,
      routine_id_fk: routine_id,
    }));
  });

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


// export async function insertRoutine({title,exercises}) {
//     const owner = "user"


//     const authHeader = headers().get('Authorization');
//     const token = authHeader.split(' ')[1];
//     //console.log(token)
//     const { data: { user }, error } = await supabase.auth.getUser(token);
//    // console.log(user)
//     const userId = user.id;
//     console.log({userId})


//     // const { data:routine, error:routineError } = await supabase
//     //   .from('routines')
//     //   .insert({title:{title},owner:"user",user_id_fk:userId}) //id:'c228ade7-5246-469b-939b-fe0470421b55'
//     //    .select()
//     //    .single()


//     //   if (routineError) {
//     //     throw new Error(`Error inserting routine: ${routineError.message}`);
//     //   }



//     //  console.log({exercises})

//     //   // const exerciseEntries = exercises.map((exercise) => ({
//     //   //      sets : exercise.sets,
//     //   //      weight : exercise.weight,
//     //   //      reps : exercise.reps,  
//     //   //     exercise_id_fk : exercise.id,
//     //   //      routine_id_fk : routine_id,

//     //   // }))


//        //function for rpc
//       const exerciseEntries = exercises.flatMap((exercise) => {
//         const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];
//         const numberOfSets = exercise.sets.length;

//        return setsArray.map((set, index) => ({
//           sets: numberOfSets,
//           weight: parseInt(exercise.weights[index], 10) || 0, 
//           reps: parseInt(exercise.reps[index], 10) || 0,  
//           exercise_id_fk: exercise.id,
//         //  routine_id_fk: routine_id,
//         }))
//      });



//   //   const formattedExercises = exercises.flatMap((exercise) =>{
//   //     const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];
//   //       return setsArray.map((set, index) => ({
//   //         exercise_id_fk: exercise.id,
//   //         sets: exercise.sets.length,
//   //         weight: exercise.weights[index] || '',
//   //         reps: exercise.reps[index] || '',
//   //     }))
//   //  });


//     console.log('Formatted Exercises:', exercises);

//     //   const { data: routineExercises, error: exercisesError } = await supabase
//     //   .from('routine_exercises')
//     //   .insert(exerciseEntries)
//     //   .select();

//     // if (exercisesError) {
//     //   throw new Error(`Error inserting routine exercises: ${exercisesError.message}`);
//     // } 


//     // return {
//     //   routine,
//     //   routineExercises,
//     // };


//     const { error: rpcError } = await supabase.rpc("insert_routine_and_exercises", {
//       _title: title,
//       _owner: owner,
//       _user_id: userId,
//       _exercises: exerciseEntries,//exercises, 
//     });

//     if (rpcError) {
//       throw new Error(`Error inserting routine and exercises: ${rpcError.message}`);
//     }

//     return {
//       message: "Routine and exercises inserted successfully!",
//     };


//   }








//pg transaction
// const pool = new Pool({
//   connectionString: process.env.DB_URL,  // get this from Supabase settings
//   // user: process.env.DB_USER,
//   // host: process.env.DB_HOST,
//   // database: process.env.DB_NAME,
//   // password: process.env.DB_PASSWORD,
//   // port: process.env.DB_PORT,

// });       



// export async function insertRoutine({title,exercises}) {
//   const client = await pool.connect();  // Get a client from the pool
//   const owner = "user" 
//   const authHeader = headers().get('Authorization');
//       const token = authHeader.split(' ')[1];
//       //console.log(token)
//       const { data: { user }, error } = await supabase.auth.getUser(token);
//      // console.log(user)
//        const userId = user.id;
//        const exerciseEntries = exercises.flatMap((exercise) => {
//                 const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];
//                 const numberOfSets = exercise.sets.length;

//                return setsArray.map((set, index) => ({
//                   sets: numberOfSets,
//                   weight: parseInt(exercise.weights[index], 10) || 0, 
//                   reps: parseInt(exercise.reps[index], 10) || 0,  
//                   exercise_id_fk: exercise.id,
//                 //  routine_id_fk: routine_id,
//                 }))
//              });



//   try {
//     // Start the transaction
//     await client.query('BEGIN');

//     // Insert into 'routines' table
//     const routineResult = await client.query(`
//       INSERT INTO routines (title, owner, user_id_fk)
//       VALUES ($1, $2, $3)
//       RETURNING id
//     `, [title, owner, userId]);

//     const routineId = routineResult.rows[0].id;

//     // Insert into 'routine_exercises' table
//     const exerciseEntriesValues = exerciseEntries.map(entry => (`${routineId}`, '${entry.exercise}')).join(',');
//     await client.query(`
//       INSERT INTO routine_exercises (routine_id_fk, exercise_id_fk,sets,weights,reps)
//       VALUES ${exerciseEntriesValues}
//     `);

//     // Commit the transaction
//     await client.query('COMMIT');

//     console.log('Transaction committed successfully');
//   } catch (error) {
//     // Rollback the transaction in case of an error
//     await client.query('ROLLBACK');
//     console.error('Transaction failed, rolled back:', error.message);
//   } finally {
//     client.release();  // Release the client back to the pool
//   }
// }


//fetch saved routines
export async function getSavedRoutinesByUser() {
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


    const { data: savedRoutines, error: savedRoutinesError } = await supabase
      .from('saved_routines')
      .select('routine_id_fk')
      .eq('user_id_fk', userId); // Filter by user ID

    // console.log(savedRoutines)

    if (savedRoutinesError) {
      throw new Error(`Error fetching saved routines: ${savedRoutinesError.message}`);
    }

    const routineIds = savedRoutines.map(routine => routine.routine_id_fk);
    // console.log(routineIds)

    // if (routineIds.length === 0) {
    //   return []; // If the user hasn't saved any routines, return an empty array
    // }

    // Fetch the details of the routines along with associated exercises
    const { data: routines, error: routinesError } = await supabase
      .from('routines')
      .select(`
        id,
        title,
        routine_exercises (exercise_id_fk, sets, weight, reps)
      `)
      .in('id', routineIds); // Filter by the list of routine IDs

    //console.log(JSON.stringify(routines, null, 2))

    if (routinesError) {
      throw new Error(`Error fetching routine details: ${routinesError.message}`);
    }

    // console.log(routines)

    return routines; // Return the fetched routines and associated exercises

  } catch (error) {
    console.error('Error processing request:', error.message);
    throw new Error(`Error processing request: ${error.message}`);
  }
}

// delete routine
export async function deleteRoutine({ routineId }) {


  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()

  console.log(routineId);
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', routineId);

  if (error) {
    return NextResponse.json(
      { message: 'Failed to delete routine', error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Routine deleted successfully' },
    { status: 200 }
  );
}





export async function logExercises({ routineId, newexercises }) {
  // const authHeader = headers().get('Authorization');
  // const token = authHeader.split(' ')[1];


  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()




  // console.log(routineId)
  // console.log(newexercises)

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error(`Error fetching user: ${userError?.message || 'User not found'}`);
  }

  const userId = user.id;
  //console.log("exercise before insert:", newexercises)

  // Prepare exercise entries, allowing empty weights and reps
  const exerciseEntries = newexercises.flatMap((exercise) => {
    const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];
    const numberOfSets = setsArray.length;
    console.log("exercise during insert:", exercise)
    return setsArray.map((set, index) => ({
      sets: index + 1,
      weight: exercise.weights && exercise.weights[index] ? parseInt(exercise.weights[index], 10) : null, // Allow null if no weight
      reps: exercise.reps && exercise.reps[index] ? parseInt(exercise.reps[index], 10) : null, // Allow null if no reps
      exercise_id_fk: exercise.exerciseId,
      routine_id_fk: routineId,
      user_id_fk: userId
    }));
  });

  // Insert the exercises

  const { data: loggedexercises, error: loggedexercisesError } = await supabase
    .from('loggedExercises')
    .insert(exerciseEntries)
    .select();

  if (loggedexercisesError) {
    throw new Error(`Error inserting logged exercise  ${loggedexercisesError.message}`);
  }
  return {
    loggedexercises
  };
}

// export async function updateRoutines({ routineId, newexercises }) {
//   // Step 1: Fetch existing exercises for the given routine
//   const { data: existingExercises, error: fetchError } = await supabase
//     .from('routine_exercises')
//     .select('*')
//     .eq('routine_id_fk', routineId);

//   if (fetchError) {
//     throw new Error(`Error fetching existing exercises: ${fetchError.message}`);
//   }

//   // Step 2: Prepare updates for each set in each exercise
//   const updatePromises = newexercises.flatMap((exercise) => {
//     const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];

//     return setsArray.map(async (set, index) => {
//       const existingEntry = existingExercises.find(
//         (entry) =>
//           entry.exercise_id_fk === exercise.id && entry.set_number === index + 1
//       );

//       const updatedData = {
//         sets: index + 1,
//         weight: exercise.weights && exercise.weights[index] ? parseInt(exercise.weights[index], 10) : null,
//         reps: exercise.reps && exercise.reps[index] ? parseInt(exercise.reps[index], 10) : null,
//         exercise_id_fk: exercise.id,
//         routine_id_fk: routineId,
//         set_number: index + 1,  // Adding set_number for precise updates
//       };

//       if (existingEntry) {
//         // Update the entry if it exists
//         const { error: updateError } = await supabase
//           .from('routine_exercises')
//           .update(updatedData)
//           .eq('id', existingEntry.id);

//         if (updateError) {
//           throw new Error(`Error updating exercise ${exercise.id} set ${index + 1}: ${updateError.message}`);
//         }
//       } else {
//         // Insert a new entry if it doesn't exist
//         const { error: insertError } = await supabase
//           .from('routine_exercises')
//           .insert(updatedData);

//         if (insertError) {
//           throw new Error(`Error inserting new exercise ${exercise.id} set ${index + 1}: ${insertError.message}`);
//         }
//       }
//     });
//   });

//   // Step 3: Execute all updates
//   await Promise.all(updatePromises);

//   return { message: 'Routine exercises updated successfully' };
// }









export async function updateRoutines({ routineId, newexercises }) {

  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('Authorization');
  const token = authHeader.split(' ')[1];
  const supabase = await createClient()

  // Step 1: Fetch existing exercises for the given routine
  const { data: existingExercises, error: fetchError } = await supabase
    .from('routine_exercises')
    .select('*')
    .eq('routine_id_fk', routineId);

  if (fetchError) {
    throw new Error(`Error fetching existing exercises: ${fetchError.message}`);
  }

  // Step 2: Create a Set of new exercise keys: "exercise_id_fk|set_number"
  const newExerciseKeys = new Set();
  newexercises.forEach((exercise) => {
    const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];
    setsArray.forEach((_, index) => {
      newExerciseKeys.add(`${exercise.id}|${index + 1}`);
    });
  });

  // Step 3: Find and delete removed rows
  const toDelete = existingExercises.filter((entry) => {
    const key = `${entry.exercise_id_fk}|${entry.set_number}`;
    return !newExerciseKeys.has(key);
  });

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .in('id', toDelete.map((entry) => entry.id));

    if (deleteError) {
      throw new Error(`Error deleting old exercises: ${deleteError.message}`);
    }
  }

  // Step 4: Prepare updates/inserts
  const updatePromises = newexercises.flatMap((exercise) => {
    const setsArray = Array.isArray(exercise.sets) ? exercise.sets : [];

    return setsArray.map(async (set, index) => {
      const existingEntry = existingExercises.find(
        (entry) =>
          entry.exercise_id_fk === exercise.id &&
          entry.set_number === index + 1
      );

      const updatedData = {
        sets: index + 1,
        weight: exercise.weights?.[index] ? parseInt(exercise.weights[index], 10) : null,
        reps: exercise.reps?.[index] ? parseInt(exercise.reps[index], 10) : null,
        exercise_id_fk: exercise.id,
        routine_id_fk: routineId,
        set_number: index + 1,
      };

      if (existingEntry) {
        const { error: updateError } = await supabase
          .from('routine_exercises')
          .update(updatedData)
          .eq('id', existingEntry.id);

        if (updateError) {
          throw new Error(`Error updating exercise ${exercise.id} set ${index + 1}: ${updateError.message}`);
        }
      } else {
        const { error: insertError } = await supabase
          .from('routine_exercises')
          .insert(updatedData);

        if (insertError) {
          throw new Error(`Error inserting new exercise ${exercise.id} set ${index + 1}: ${insertError.message}`);
        }
      }
    });
  });

  // Step 5: Execute all updates/inserts
  await Promise.all(updatePromises);

  return { message: 'Routine exercises updated successfully' };
}



















export async function getLoggedExercises({ dateRange, exercise }) {
  try {

    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()



    //console.log(token)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    // console.log(user)
    const userId = user.id;
    // const startDate = dateRange.start
    // const endDate = dateRange.to

    const startDate = new Date(dateRange.start).toISOString();

    const end = new Date(dateRange.to);
    end.setUTCHours(23, 59, 59, 999);
    const endDate = end.toISOString();
    console.log("startdate", startDate)
    console.log("enddate", endDate)
    console.log("userid", userId)

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

    // let query = supabase
    //   .from('loggedExercises')
    //   .select('*')
    //   .eq('user_id_fk', userId)
    //   .lte('created_at', endDate)
    //   .gte('created_at', startDate)
    //   .order('created_at', { ascending: false });


    // const { data: loggedExercises, error: logError } = await query;

    const { data: loggedExercises, error: logError } = await supabase
      .from('loggedExercises')
      .select('*')
      .eq('user_id_fk', userId)
      .lte('created_at', endDate)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    console.log("logged exerc in service func", loggedExercises)

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







//for each exercise in summary

export async function getEachLoggedExercises({ dateRange, exercise }) {
  try {
    const requestHeaders = await headers()
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader.split(' ')[1];
    const supabase = await createClient()
    //console.log(token)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    // console.log(user)
    const userId = user.id;
    const startDate = dateRange.start
    const endDate = dateRange.to
    // console.log(startDate)
    // console.log(endDate)

    //  console.log("exercise id", exercise)
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
      .eq('exercise_id_fk', exercise)
      .lte('created_at', endDate)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    // Conditionally add the exercise filter if `exercise` is not null
    // if (exercise !== null) {
    //   query = query.eq('exercise_id_fk', exercise);
    // }
    // console.log("query", query)
    // // Execute the query
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