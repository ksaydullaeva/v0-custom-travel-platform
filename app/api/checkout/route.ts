import { NextResponse } from "next/server"
// import Stripe from "stripe" // Comment out Stripe import
// import { getSupabaseServerClient } from "@/lib/supabase/server" // Comment out Supabase server import

// Initialize Stripe with the secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16",
// })

// export async function POST(request: Request) { // Comment out the main POST function
//   try {
//     const supabase = await getSupabaseServerClient()

//     // Get auth session to verify the user
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()

//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Parse the request body
//     const body = await request.json()
//     const {
//       experienceId,
//       experienceTitle,
//       experienceImageUrl,
//       price,
//       participants,
//       totalAmount,
//       bookingDate,
//       contactEmail,
//       contactPhone,
//       specialRequests,
//     } = body

//     // Create a Checkout Session
//     const checkoutSession = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: experienceTitle,
//               description: `${participants} participant(s) on ${bookingDate}`,
//               images: experienceImageUrl ? [experienceImageUrl] : undefined,
//             },
//             unit_amount: Math.round(price * 100), // Stripe expects amount in cents
//           },
//           quantity: participants,
//         },
//       ],
//       metadata: {
//         userId: session.user.id,
//         experienceId,
//         participants,
//         bookingDate,
//         contactEmail,
//         contactPhone,
//         specialRequests: specialRequests || "",
//       },
//       mode: "payment",
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/experiences/${experienceId}?payment_cancelled=true`,
//     })

//     // Return the checkout session URL
//     return NextResponse.json({ url: checkoutSession.url })
//   } catch (error) {
//     console.error("Error creating checkout session:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// Add a placeholder POST function that returns an error or a dummy response
export async function POST(request: Request) {
  console.log("Stripe checkout logic is disabled.")
  return NextResponse.json({ error: "Stripe checkout is currently disabled." }, { status: 503 })
}
