import { getSupabaseClient } from "@/lib/supabase/client"

export interface AgeCategory {
  label: string;
  min: number;
  max: number | null;
}

export interface CancellationRule {
  hours_before: number; // cancel at least this many hours before start
  refund_percent: number; // percent refund
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews_count: number;
  duration: number;
  image_url: string;
  category: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  age_categories?: AgeCategory[]; // Array of age category objects
  additional_info?: string | null; // optional bullet-point info (newline separated)
  cancellation_policy?: CancellationRule[]; // array of cancellation rules
}

export interface ExperienceFilters {
  category?: string
  city?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  minDuration?: number
  maxDuration?: number
  search?: string
}

// Add interface for PackageOption
export interface StartEndTime {
  id: string;
  package_option_id: string;
  start_time: string; // HH:MM:SS
  end_time: string | null;
}

export interface PackageOption {
  id: string;
  experience_id: string;
  name: string;
  description: string;
  inclusions: string[];
  age_categories?: AgeCategory[];
  exclusions: string[];
  meeting_point_address?: string;
  meeting_point_lat?: number;
  meeting_point_lng?: number;
  meeting_point_details?: string;
  meeting_point_start_time?: string;
  meeting_point_end_time?: string;
  created_at: string;
}

// Function to get experiences with client-side Supabase client
export async function getExperiences(
  filters: ExperienceFilters = {},
  limit = 20,
  offset = 0,
  sortBy = "rating",
  sortOrder = "desc",
): Promise<Experience[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("experiences").select("*").eq("status", "active")

  // Apply filters
  if (filters.category) {
    query = query.eq("category", filters.category)
  }

  if (filters.city) {
    query = query.eq("city", filters.city)
  }

  if (filters.country) {
    query = query.eq("country", filters.country)
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,country.ilike.%${filters.search}%`,
    )
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters.minDuration !== undefined) {
    query = query.gte("duration", filters.minDuration)
  }

  if (filters.maxDuration !== undefined) {
    query = query.lte("duration", filters.maxDuration)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching experiences:", error)
    throw new Error("Failed to fetch experiences")
  }

  return data as Experience[]
}

// Function to get a single experience by ID
export async function getExperienceById(id: string): Promise<Experience | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("experiences").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching experience:", error)
    return null
  }

  if (!data) return null;

  // Parse JSONB fields if necessary
  let cancellation_policy: CancellationRule[] | undefined = undefined;
  if (data.cancellation_policy) {
    cancellation_policy = Array.isArray(data.cancellation_policy)
      ? data.cancellation_policy
      : JSON.parse(data.cancellation_policy);
  }

  return {
    ...(data as any),
    cancellation_policy,
  } as Experience
}

// Function to get experiences by city
export async function getExperiencesByCity(city: string, limit = 20, offset = 0): Promise<Experience[]> {
  return getExperiences({ city }, limit, offset)
}

// Function to get experiences by category
export async function getExperiencesByCategory(category: string, limit = 20, offset = 0): Promise<Experience[]> {
  return getExperiences({ category }, limit, offset)
}

// Function to get categories
export async function getCategories(): Promise<string[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("experiences")
    .select("category")
    .not("category", "is", null)
    .order("category")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  // Extract unique categories
  const categories = [...new Set(data.map((item) => item.category))]
  return categories.filter(Boolean) as string[]
}

// Fetch package options for a given experience
export async function getStartEndTimesForPackageOption(packageOptionId: string): Promise<StartEndTime[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('package_option_start_end_times')
    .select('*')
    .eq('package_option_id', packageOptionId);
  if (error) {
    console.error('Error fetching start/end times:', error);
    return [];
  }
  return data as StartEndTime[];
}

export async function getPackageOptionsForExperience(experienceId: string): Promise<PackageOption[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('package_options')
    .select('*')
    .eq('experience_id', experienceId);

  if (error) {
    console.error('Error fetching package options:', error);
    return [];
  }

  // Parse inclusions/exclusions JSONB if needed
  return (data || []).map((pkg: any) => ({
    ...pkg,
    inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : (pkg.inclusions ? JSON.parse(pkg.inclusions) : []),
    exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : (pkg.exclusions ? JSON.parse(pkg.exclusions) : []),
  })) as PackageOption[];
}

// Reviews interface and fetch function
export interface ExperienceReview {
  id: string;
  experience_id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

export async function getReviewsForExperience(experienceId: string): Promise<ExperienceReview[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('experience_id', experienceId);

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data as ExperienceReview[];
}

export interface PackageItineraryStep {
  id: string;
  package_option_id: string;
  day: number;
  title: string;
  description: string;
  duration: string;
  order_index: number;
}

export async function getPackageItinerarySteps(packageOptionId: string): Promise<PackageItineraryStep[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('package_itinerary_steps')
    .select('*')
    .eq('package_option_id', packageOptionId)
    .order('day', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching package itinerary steps:', error);
    return [];
  }
  return data as PackageItineraryStep[];
}
