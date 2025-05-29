//import { supabase } from "../../lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server"


export async function getLevels() {
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


        const { data: levels, error: levelsError } = await supabase
            .from('levels')
            .select('xp,level')
            .eq('user_id_fk', userId); // Filter by user ID

        if (levelsError) {
            throw new Error(`Error fetching routine details: ${levelsError.message}`);
        }


        return levels;

    } catch (error) {
        console.error('Error processing request inside catch:', error.message);
        throw new Error(`Error processing request inside catch1: ${error.message}`);
    }
}



export async function updateLevels({ newXP, newLevel }) {
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
        console.log("inside levels")

        // const { data: levels, error: levelsError } = await supabase
        //     .from('levels')
        //     .select('xp,level')
        //     .eq('user_id_fk', userId); // Filter by user ID
        console.log("level", newLevel);
        console.log("level", newXP);
        const { data: levels, error: updateError } = await supabase
            .from('levels')
            .update({ xp: newXP, level: newLevel })
            .eq('user_id_fk', userId)
            .select();

        console.log("return levels", levels)

        if (updateError) {
            throw new Error(`Error fetching routine details: ${updateError.message}`);
        }


        return levels;

    } catch (error) {
        console.error('Error processing request inside catch:', error.message);
        throw new Error(`Error processing request inside catch1: ${error.message}`);
    }
}



export async function getStreak() {
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


        const { data: streak, error: streakError } = await supabase
            .from("levels")
            .select("streak_count, last_workout_date")
            .eq('user_id_fk', userId)
            .single();


        if (streakError) {
            throw new Error(`Error fetching routine details: ${streakError.message}`);
        }

        let last_workout_date = streak.last_workout_date
        console.log("last date", last_workout_date);

        const today = new Date().toISOString().split("T")[0];

        if (last_workout_date) {
            const lastWorkout = new Date(last_workout_date);
            const diffDays = (new Date(today) - lastWorkout) / (1000 * 60 * 60 * 24);

            if (diffDays > 1) {

                streak.streak_count = 0;


                await supabase
                    .from("levels")
                    .update({ streak_count: 0 })
                    .eq('user_id_fk', userId);
            }
        }



        console.log("streak end", streak)

        return streak;

    } catch (error) {
        console.error('Error processing request inside catch:', error.message);
        throw new Error(`Error processing request inside catch1: ${error.message}`);
    }
}



export async function updateStreak({ streak_count, last_workout_date }) {
    try {
        console.log("input", streak_count)
        console.log("last date workout", last_workout_date)
        // const authHeader = headers().get('Authorization');
        // const token = authHeader.split(' ')[1];

        const requestHeaders = await headers()
        const authHeader = requestHeaders.get('Authorization');
        const token = authHeader.split(' ')[1];
        const supabase = await createClient()



        const today = new Date().toISOString().split("T")[0];
        //console.log(token)
        const { data: { user }, error } = await supabase.auth.getUser(token);
        // console.log(user)
        const userId = user.id;

        let newStreak = streak_count;
        const lastDate = last_workout_date;



        if (!lastDate) {
            newStreak = 1; // First workout
        } else {
            const lastWorkout = new Date(lastDate);
            const diffDays = (new Date(today) - lastWorkout) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                newStreak += 1; // Increase streak if workout was done yesterday
            } else if (diffDays > 1) {
                newStreak = 1; // Reset streak if missed a day
            }
        }

        // Update Supabase and Zustand store
        const { data: streak, error: updateError } = await supabase
            .from("levels")
            .update({ streak_count: newStreak, last_workout_date: today })
            .eq('user_id_fk', userId)
            .select();

        if (updateError) {
            console.error("Error updating streak:", updateError.message);
            return;
        }

        console.log("updatestreak", streak)
        return {
            streak_count: streak[0].streak_count,
            last_workout_date: streak[0].last_workout_date
        };


    } catch (error) {
        console.error('Error processing request inside catch:', error.message);
        throw new Error(`Error processing request inside catch1: ${error.message}`);
    }
}



export async function setLevelsignup({ newXP, newLevel }) {
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
        console.log("inside levels")

        // const { data: levels, error: levelsError } = await supabase
        //     .from('levels')
        //     .select('xp,level')
        //     .eq('user_id_fk', userId); // Filter by user ID
        console.log("level", newLevel);
        console.log("level", newXP);
        const { data: levels, error: insertError } = await supabase
            .from('levels')
            .insert({ xp: newXP, level: newLevel })
            .select()
            .single();

        console.log("return levels", levels)

        if (insertError) {
            throw new Error(`Error fetching routine details: ${updateError.message}`);
        }


    } catch (error) {
        console.error('Error processing request inside catch:', error.message);
        throw new Error(`Error processing request inside catch1: ${error.message}`);
    }
}
