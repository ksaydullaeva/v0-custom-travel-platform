import { getSupabaseClient } from "@/lib/supabase/client"

export async function createWishlistTable() {
  const supabase = getSupabaseClient()

  // Execute the SQL to create the wishlists table
  const { error } = await supabase.rpc("execute_sql", {
    sql_query: `
      CREATE TABLE IF NOT EXISTS wishlists (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, experience_id)
      );
      
      -- Add RLS policies if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_policies 
          WHERE tablename = 'wishlists' AND policyname = 'Users can view their own wishlists'
        ) THEN
          ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own wishlists" 
            ON wishlists FOR SELECT 
            USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert into their own wishlists" 
            ON wishlists FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can delete from their own wishlists" 
            ON wishlists FOR DELETE 
            USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `,
  })

  if (error) {
    console.error("Error creating wishlist table:", error)
    throw error
  }

  return { success: true }
}

export async function getUserWishlist(userId: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      id,
      experience_id,
      created_at,
      experiences:experience_id (
        id,
        title,
        description,
        price,
        image_url,
        city,
        country,
        rating,
        duration,
        category
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching wishlist:", error)
    throw error
  }

  return data
}

export async function addToWishlist(userId: string, experienceId: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("wishlists").insert({
    user_id: userId,
    experience_id: experienceId,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error adding to wishlist:", error)
    throw error
  }

  return { success: true }
}

export async function removeFromWishlist(userId: string, experienceId: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("wishlists").delete().eq("user_id", userId).eq("experience_id", experienceId)

  if (error) {
    console.error("Error removing from wishlist:", error)
    throw error
  }

  return { success: true }
}

export async function isInWishlist(userId: string, experienceId: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("experience_id", experienceId)
    .maybeSingle()

  if (error) {
    console.error("Error checking wishlist:", error)
    throw error
  }

  return !!data
}
