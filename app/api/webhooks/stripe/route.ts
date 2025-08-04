import { NextResponse } from "next/server"
// import Stripe from "stripe"
// import { getSupabaseServerClient } from "@/lib/supabase/server"

// Initialize Stripe with the secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16",
// })

// This is your Stripe webhook secret for testing your endpoint locally
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// export async function POST(request: Request) {
//   const payload = await request.text()
//   const sig = request.headers.get("stripe-signature") as string

//   let event

//   try {
//     event = stripe.webhooks.constructEvent(payload, sig, endpointSecret!)
//   } catch (err: any) {
//     console.error(`Webhook Error: ${err.message}`)
//     return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
//   }

//   // Handle the checkout.session.completed event
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session

//     // Retrieve the session metadata
//     const { userId, experienceId, participants, bookingDate, contactEmail, contactPhone, specialRequests } =
//       session.metadata!

//     try {
//       const supabase = await getSupabaseServerClient()

//       // Create a new booking in the database
//       const { data: booking, error } = await supabase
//         .from("bookings")
//         .insert({
//           user_id: userId,
//           experience_id: experienceId,
//           booking_date: bookingDate,
//           participants: Number.parseInt(participants),
//           total_price: session.amount_total! / 100, // Convert from cents back to dollars
//           status: "confirmed",
//           contact_email: contactEmail,
//           contact_phone: contactPhone,
//           special_requests: specialRequests,
//           payment_id: session.payment_intent as string,
//           payment_status: "paid",
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         })
//         .select()
//         .single()

//       if (error) {
//         console.error("Error creating booking:", error)
//         return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
//       }

//       // Return a success response
//       return NextResponse.json({ success: true, booking })
//     } catch (error) {
//       console.error("Error processing webhook:", error)
//       return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//     }
//   }

//   // Return a response to acknowledge receipt of the event
//   return NextResponse.json({ received: true })
// }

// Placeholder POST function when Stripe webhook is disabled
export async function POST(request: Request) {
  console.log("Stripe webhook logic is disabled.");
  // Respond with a 200 status to acknowledge receipt, even if not processed
  return NextResponse.json({ received: true, message: "Stripe webhook is currently disabled." }, { status: 200 });
}

export const config = {
  api: {
    bodyParser: false,
  },
}
