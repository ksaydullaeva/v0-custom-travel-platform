import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServerClient()

    // Get auth session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const {
      experienceId,
      experienceTitle,
      experienceImageUrl,
      price,
      participants,
      totalAmount,
      bookingDate,
      contactEmail,
      contactPhone,
      specialRequests,
    } = body

    // Create a Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: experienceTitle,
              description: `${participants} participant(s) on ${bookingDate}`,
              images: experienceImageUrl ? [experienceImageUrl] : undefined,
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
          },
          quantity: participants,
        },
      ],
      metadata: {
        userId: session.user.id,
        experienceId,
        participants,
        bookingDate,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || "",
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/experiences/${experienceId}?payment_cancelled=true`,
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}
