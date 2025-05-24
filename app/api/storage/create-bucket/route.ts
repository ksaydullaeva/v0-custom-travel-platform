import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    // Log existing buckets
    console.log("Existing buckets:", buckets)

    const bucketExists = buckets?.some((bucket) => bucket.name === "tour-images")

    if (bucketExists) {
      return NextResponse.json({ message: "Bucket already exists", buckets }, { status: 200 })
    }

    // Create the bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket("tour-images", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create policies
    // Note: Policies are typically created via SQL, but we'll return success anyway

    return NextResponse.json(
      {
        message: "Bucket created successfully",
        data,
        allBuckets: await supabase.storage.listBuckets(),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
