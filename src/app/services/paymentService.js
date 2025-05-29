import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server"
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function stripePayment({ amount }) {

    try {

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        return {
            clientSecret: paymentIntent.client_secret
        }

    } catch (error) {
        console.error('Stripe Error:', err.message);
    }








}