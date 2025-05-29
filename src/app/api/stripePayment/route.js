import Stripe from 'stripe';
import { stripePayment } from '../../services/paymentService';
import { NextResponse } from 'next/server';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use your secret key from .env

// export default async function handler(req, res) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ error: 'Method Not Allowed' });
//     }

//     const { amount } = req.body;

//     if (!amount) {
//         return res.status(400).json({ error: 'Amount is required' });
//     }

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency: 'usd',
//         });

//         res.status(200).json({ clientSecret: paymentIntent.client_secret });
//     } catch (err) {
//         console.error('Stripe Error:', err.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }



export async function POST(req) {
    try {
        // console.log("inside post")
        const { amount } = await req.json();
        const result = await stripePayment({
            amount
        });
        console.log(JSON.stringify(result, null, 2))

        return NextResponse.json({ clientSecret: result.clientSecret });
    } catch (error) {
        console.error('Error processing request:', error.message);
        return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 400 });
    }
}