"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, Trash2, X, MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import EmbeddedMap from "@/components/EmbeddedMap"
import MultiDatePicker from "@/components/MultiDatePicker"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"


interface Category {
  id: string;
  name: string;
  slug: string;
}

interface TourImage {
  id: string
  url: string
  path: string
  name: string
}

interface AgeCategory {
  label: string
  min: number | null
  max: number | null
  price: number
}

interface ItineraryStep {
  title: string
  description: string
  duration: string
  day: number
}

interface PackageOptionStartEndTime {
  start_time: string
  end_time: string
  capacity: number
}

interface PackageOption {
  name: string
  description: string
  meeting_point_address: string
  meeting_point_lat: number
  meeting_point_lng: number
  meeting_point_details: string
  start_end_times: PackageOptionStartEndTime[]
  unavailable_dates: string[]
  unavailable_days: number[]
  age_categories: AgeCategory[]
  additional_info: string
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryStep[]
}

export default function NewTourPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 2,
    location: "",
    city: "",
    country: "",
    category: "",
    images: [] as TourImage[],
    packageOptions: [{
      name: "Standard",
      description: "",
      meeting_point_address: "",
      meeting_point_lat: 0,
      meeting_point_lng: 0,
      meeting_point_details: "",
      start_end_times: [
        {
          start_time: "09:00",
          end_time: "18:00",
          capacity: 10
        }
      ],
      unavailable_dates: [],
      unavailable_days: [],
      age_categories: [
        { label: "Adult", min: 13, max: null, price: 0 },
        { label: "Child", min: 4, max: 12, price: 0 },
        { label: "Infant", min: 0, max: 3, price: 0 },
      ],
      additional_info: "",
      inclusions: [""],
      exclusions: [""],
      itinerary: [{
        title: "",
        description: "",
        duration: "2 hours",
        day: 1
      }]
    }] as PackageOption[]
  })
  const [images, setImages] = useState<TourImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const [businessProfile, setBusinessProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  // Load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('categories').select('id, name, slug').order('name')
        if (error) throw error
        setCategories(data as Category[])
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    })()
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/business/login")
          return
        }

        // Fetch business profile
        const { data: profileData, error: profileError } = await supabase
          .from("business_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        setBusinessProfile(profileData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load business profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    checkAuth()
  }, [router, supabase, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Package handlers
  const handlePackageChange = (pkgIndex: number, field: keyof PackageOption, value: any) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions]
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        [field]: value,
      }
      return { ...prev, packageOptions: updatedPackages }
    })
  }

  // Unavailable days toggle
  const toggleUnavailableDay = (pkgIndex: number, dayIndex: number) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions]
      const days = new Set(updatedPackages[pkgIndex].unavailable_days)
      if (days.has(dayIndex)) {
        days.delete(dayIndex)
      } else {
        days.add(dayIndex)
      }
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        unavailable_days: Array.from(days),
      }
      return { ...prev, packageOptions: updatedPackages }
    })
  }


  // Age category handlers
  const handleAgeCategoryChange = (pkgIndex: number, catIndex: number, field: keyof AgeCategory, value: any) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const updatedCategories = [...updatedPackages[pkgIndex].age_categories];
      updatedCategories[catIndex] = { ...updatedCategories[catIndex], [field]: value };
      updatedPackages[pkgIndex] = { ...updatedPackages[pkgIndex], age_categories: updatedCategories };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  // Itinerary handlers
  const handleItineraryChange = (pkgIndex: number, stepIndex: number, field: keyof ItineraryStep, value: string) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const updatedItinerary = [...updatedPackages[pkgIndex].itinerary];
      updatedItinerary[stepIndex] = {
        ...updatedItinerary[stepIndex],
        [field]: value
      };
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        itinerary: updatedItinerary
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  const handleItineraryInputChange = (pkgIndex: number, stepIndex: number, field: keyof ItineraryStep) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleItineraryChange(pkgIndex, stepIndex, field, e.target.value);
    };

  // Start/End time handlers
  const handleStartEndTimeChange = (pkgIndex: number, timeIndex: number, field: keyof PackageOptionStartEndTime, value: string | number) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const updatedTimes = [...updatedPackages[pkgIndex].start_end_times];
      updatedTimes[timeIndex] = { ...updatedTimes[timeIndex], [field]: value };
      updatedPackages[pkgIndex] = { ...updatedPackages[pkgIndex], start_end_times: updatedTimes };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  const addStartEndTime = (pkgIndex: number) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        start_end_times: [
          ...updatedPackages[pkgIndex].start_end_times,
          { start_time: "09:00", end_time: "18:00", capacity: 10 }
        ]
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  const removeStartEndTime = (pkgIndex: number, timeIndex: number) => {
    if (formData.packageOptions[pkgIndex].start_end_times.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one time slot.",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        start_end_times: updatedPackages[pkgIndex].start_end_times.filter((_, i) => i !== timeIndex)
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  // Add a new package option
  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packageOptions: [
        ...prev.packageOptions,
        {
          name: `Package ${prev.packageOptions.length + 1}`,
          description: "",
          meeting_point_address: "",
          meeting_point_lat: 0,
          meeting_point_lng: 0,
          meeting_point_details: "",
          start_end_times: [
            {
              start_time: "09:00",
              end_time: "18:00",
              capacity: 10
            }
          ],
          unavailable_dates: [],
          unavailable_days: [],
          age_categories: [
            { label: "Adult", min: 13, max: null, price: 0 },
            { label: "Child", min: 4, max: 12, price: 0 },
            { label: "Infant", min: 0, max: 3, price: 0 },
          ],
          additional_info: "",
          inclusions: [""],
          exclusions: [""],
          itinerary: [{
            title: "",
            description: "",
            duration: "2 hours",
            day: 1
          }]
        }
      ]
    }));
  };

  // Remove a package option
  const removePackage = (index: number) => {
    if (formData.packageOptions.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one package option",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      packageOptions: prev.packageOptions.filter((_, i) => i !== index)
    }));
  };

  const handleInclusionChange = (pkgIndex: number, index: number, value: string) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const updatedInclusions = [...updatedPackages[pkgIndex].inclusions];
      updatedInclusions[index] = value;
      updatedPackages[pkgIndex] = { ...updatedPackages[pkgIndex], inclusions: updatedInclusions };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  const handleExclusionChange = (pkgIndex: number, index: number, value: string) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const updatedExclusions = [...updatedPackages[pkgIndex].exclusions];
      updatedExclusions[index] = value;
      updatedPackages[pkgIndex] = { ...updatedPackages[pkgIndex], exclusions: updatedExclusions };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = originalName.split(".").pop()
    return `${timestamp}-${randomString}.${fileExtension}`
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const files = Array.from(e.target.files)
    setIsUploadingImage(true)

    try {
      // Use the tour-images bucket we created
      const bucketName = "tour-images"

      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not a valid image file`)
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`)
        }

        const fileName = generateUniqueFileName(file.name)

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage.from(bucketName).upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.error("Upload error details:", uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName)

        return {
          id: Math.random().toString(36).substring(2, 15),
          url: urlData.publicUrl,
          path: fileName,
          name: file.name,
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedImages])

      toast({
        title: "Images uploaded successfully",
        description: `${uploadedImages.length} image(s) have been uploaded.`,
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const removeImage = async (imageToRemove: TourImage) => {
    try {
      const bucketName = "tour-images"

      // Remove from Supabase Storage
      const { error } = await supabase.storage.from(bucketName).remove([imageToRemove.path])

      if (error) {
        console.error("Error removing image from storage:", error)
      }

      // Remove from local state
      setImages((prev) => prev.filter((img) => img.id !== imageToRemove.id))

      toast({
        title: "Image removed",
        description: "Image has been successfully removed.",
      })
    } catch (error: any) {
      console.error("Error removing image:", error)
      toast({
        title: "Error",
        description: "Failed to remove image.",
        variant: "destructive",
      })
    }
  }

  const validateAgeCategories = (categories: AgeCategory[]): { valid: boolean; message?: string } => {
    for (const cat of categories) {
      const minStr = String(cat.min);
      const maxStr = cat.max === null ? "" : String(cat.max);
      const priceStr = String(cat.price);
      
      if (!cat.label || minStr === "" || priceStr === "") {
        return { valid: false, message: "Please fill in all fields for each age category." };
      }
      
      const min = Number(minStr);
      const max = maxStr === "" ? null : Number(maxStr);
      const price = Number(priceStr);
      
      if (isNaN(min) || min < 0) {
        return { valid: false, message: `Min age must be a non-negative number for ${cat.label}.` };
      }
      
      if (maxStr !== '' && typeof max === 'number' && !isNaN(max) && max <= min) {
        return { valid: false, message: `Max age must be greater than min age for ${cat.label}.` };
      }
      
      if (isNaN(price) || price < 0) {
        return { valid: false, message: `Price must be a non-negative number for ${cat.label}.` };
    }
    return { valid: true };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    
    try {
      // Validate all package options
      for (const pkg of formData.packageOptions) {
        const validation = validateAgeCategories(pkg.age_categories);
        if (!validation.valid) {
          toast({ 
            title: "Validation Error", 
            description: validation.message, 
            variant: "destructive" 
          });
          setIsLoading(false);
          return;
        }

        if (!pkg.name.trim()) {
          toast({ 
            title: "Validation Error", 
            description: "Please provide a name for each package option.", 
            variant: "destructive" 
          });
          setIsLoading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to create an experience")

      // Prepare location data
      const locationParts = formData.location.split(",").map((part) => part.trim())
      const city = formData.city || locationParts[0] || ""
      const country = formData.country || locationParts[locationParts.length - 1] || ""

      // 1. Create the experience
      const { data: experience, error: expError } = await supabase
        .from("experiences")
        .insert({
          business_id: user.id,
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          location: formData.location,
          city: city,
          country: country,
          category: formData.category,
          rating: 0,
          reviews_count: 0,
          image_url: images[0]?.url || null,
          images: images.map(img => img.url),
          latitude: 0, // TODO: Add geocoding
          longitude: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (expError) throw expError

      // 2. Create package options
      for (const pkg of formData.packageOptions) {
        const { data: packageOption, error: pkgError } = await supabase
          .from('package_options')
          .insert({
            experience_id: experience.id,
            name: pkg.name,
            description: pkg.description,
            meeting_point_address: pkg.meeting_point_address,
            meeting_point_lat: pkg.meeting_point_lat,
            meeting_point_lng: pkg.meeting_point_lng,
            meeting_point_details: pkg.meeting_point_details,
            unavailable_dates: pkg.unavailable_dates,
            unavailable_days: pkg.unavailable_days,
            age_categories: pkg.age_categories.map(cat => ({
              ...cat,
              min: cat.min === null ? null : Number(cat.min),
              max: cat.max === null ? null : Number(cat.max),
              price: Number(cat.price) || 0
            })),
            additional_info: pkg.additional_info,
            inclusions: pkg.inclusions.filter(Boolean),
            exclusions: pkg.exclusions.filter(Boolean),
          })
          .select()
          .single()

        if (pkgError) throw pkgError

        // 2.1. Create start/end times for this package
        if (pkg.start_end_times?.length) {
          const { error: timesError } = await supabase
            .from('package_option_start_end_times')
            .insert(pkg.start_end_times.map(time => ({
              package_option_id: packageOption.id,
              start_time: time.start_time,
              end_time: time.end_time,
              capacity: Number(time.capacity) || 10
            })))

          if (timesError) throw timesError
        }

        // 3. Create itinerary steps
        if (pkg.itinerary?.length) {
          const { error: stepsError } = await supabase
            .from('package_itinerary_steps')
            .insert(pkg.itinerary
              .filter(step => step.title.trim() || step.description.trim())
              .map((step, idx) => ({
                package_option_id: packageOption.id,
                title: step.title,
                description: step.description,
                duration: step.duration,
                day: step.day || 1,
                order_index: idx
              }))
            )

          if (stepsError) throw stepsError
        }
      }

      toast({
        title: "Experience created successfully!",
        description: "Your experience is now available for booking.",
      })

      router.push("/business/dashboard/tours")
    } catch (error: any) {
      console.error("Error creating experience:", error)
      toast({
        title: "Error creating experience",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new age category to a package
  const addAgeCategory = (pkgIndex: number) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        age_categories: [
          ...updatedPackages[pkgIndex].age_categories,
          { label: "", min: 0, max: null, price: 0 }
        ]
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  // Remove an age category from a package
  const removeAgeCategory = (pkgIndex: number, catIndex: number) => {
    if (formData.packageOptions[pkgIndex].age_categories.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one age category.",
        variant: "destructive"
      });
      return;
    }
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        age_categories: updatedPackages[pkgIndex].age_categories.filter((_, i) => i !== catIndex)
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  // Add a new itinerary step to a package
  const addItineraryStep = (pkgIndex: number) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const lastDay = updatedPackages[pkgIndex].itinerary.reduce(
        (max, step) => Math.max(max, step.day || 1), 1
      );
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        itinerary: [
          ...updatedPackages[pkgIndex].itinerary,
          { title: "", description: "", duration: "2 hours", day: lastDay }
        ]
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  // Remove an itinerary step from a package
  const removeItineraryStep = (pkgIndex: number, stepIndex: number) => {
    setFormData(prev => {
      const updatedPackages = [...prev.packageOptions];
      const updatedItinerary = [...updatedPackages[pkgIndex].itinerary];
      updatedItinerary.splice(stepIndex, 1);
      updatedPackages[pkgIndex] = {
        ...updatedPackages[pkgIndex],
        itinerary: updatedItinerary.length ? updatedItinerary : [{ title: "", description: "", duration: "2 hours", day: 1 }]
      };
      return { ...prev, packageOptions: updatedPackages };
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!businessProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You need a business account to access this page.</p>
        <Button asChild>
          <Link href="/business/register">Register a Business Account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/business/dashboard/tours">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tours
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Experience</CardTitle>
          <CardDescription>Fill in the details to create a new experience listing</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Experience Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Tashkent City Tour with Local Guide"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Experience Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of your experience..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 8"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Tashkent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., Uzbekistan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => handleSelectChange("category", value)} value={formData.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">No categories available</div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Package Options</Label>
              <div className="space-y-4">
                {formData.packageOptions.map((pkg, pkgIndex) => (
                  <Card key={pkgIndex} className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{pkg.name}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePackage(pkgIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Package Name</Label>
                        <Input
                          value={pkg.name}
                          onChange={(e) =>
                            handlePackageChange(pkgIndex, 'name', e.target.value)
                          }
                          placeholder="e.g., Standard, Premium, VIP"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={pkg.description}
                          onChange={(e) =>
                            handlePackageChange(pkgIndex, 'description', e.target.value)
                          }
                          placeholder="Brief description of this package"
                        />
                      </div>
                    </div>

                    {/* Age Categories */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Age Categories & Pricing</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAgeCategory(pkgIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Age Category
                        </Button>
                      </div>

                      {pkg.age_categories.map((category, catIndex) => (
                        <div key={catIndex} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-3">
                            <Label>Label</Label>
                            <Input
                              value={category.label}
                              onChange={(e) =>
                                handleAgeCategoryChange(pkgIndex, catIndex, 'label', e.target.value)
                              }
                              placeholder="e.g., Adult"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Min Age</Label>
                            <Input
                              type="number"
                              min="0"
                              value={category.min ?? ''}
                              onChange={(e) =>
                                handleAgeCategoryChange(
                                  pkgIndex,
                                  catIndex,
                                  'min',
                                  e.target.value === '' ? null : parseInt(e.target.value)
                                )
                              }
                              placeholder="Min"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Max Age</Label>
                            <Input
                              type="number"
                              min="0"
                              value={category.max ?? ''}
                              onChange={(e) =>
                                handleAgeCategoryChange(
                                  pkgIndex,
                                  catIndex,
                                  'max',
                                  e.target.value === '' ? null : parseInt(e.target.value)
                                )
                              }
                              placeholder="Max"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label>Price (USD)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={category.price}
                              onChange={(e) =>
                                handleAgeCategoryChange(
                                  pkgIndex,
                                  catIndex,
                                  'price',
                                  parseFloat(e.target.value)
                                )
                              }
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div className="col-span-2 flex items-end h-8">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAgeCategory(pkgIndex, catIndex)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Included in this package</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newInclusions = [...pkg.inclusions, ''];
                            handlePackageChange(pkgIndex, 'inclusions', newInclusions);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Inclusion
                        </Button>
                      </div>

                      {pkg.inclusions.map((inclusion, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={inclusion}
                            onChange={(e) =>
                              handleInclusionChange(pkgIndex, index, e.target.value)
                            }
                            placeholder="e.g., Professional guide"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newInclusions = pkg.inclusions.filter((_, i) => i !== index);
                              handlePackageChange(
                                pkgIndex,
                                'inclusions',
                                newInclusions.length ? newInclusions : ['']
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Exclusions */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Not included in this package</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newExclusions = [...pkg.exclusions, ''];
                            handlePackageChange(pkgIndex, 'exclusions', newExclusions);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Exclusion
                        </Button>
                      </div>

                      {pkg.exclusions.map((exclusion, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={exclusion}
                            onChange={(e) =>
                              handleExclusionChange(pkgIndex, index, e.target.value)
                            }
                            placeholder="e.g., Meals"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newExclusions = pkg.exclusions.filter((_, i) => i !== index);
                              handlePackageChange(
                                pkgIndex,
                                'exclusions',
                                newExclusions.length ? newExclusions : ['']
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Itinerary */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Itinerary</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addItineraryStep(pkgIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Itinerary Step
                        </Button>
                      </div>

                      {pkg.itinerary.map((step, index) => (
                        <Card key={index} className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">Step {index + 1}</h5>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItineraryStep(pkgIndex, index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={step.title}
                                onChange={(e) =>
                                  handleItineraryChange(pkgIndex, index, 'title', e.target.value)
                                }
                                placeholder="e.g., Morning Tour"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Input
                                value={step.duration}
                                onChange={(e) =>
                                  handleItineraryChange(pkgIndex, index, 'duration', e.target.value)
                                }
                                placeholder="e.g., 2 hours"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={step.description}
                              onChange={(e) =>
                                handleItineraryChange(pkgIndex, index, 'description', e.target.value)
                              }
                              placeholder="Detailed description of this step"
                              rows={3}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Meeting Point */}
                    <div className="space-y-4">
                      <h5 className="font-medium">Meeting Point</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input
                            value={pkg.meeting_point_address}
                            onChange={(e) =>
                              handlePackageChange(pkgIndex, 'meeting_point_address', e.target.value)
                            }
                            placeholder="Full address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Details</Label>
                          <Input
                            value={pkg.meeting_point_details}
                            onChange={(e) =>
                              handlePackageChange(pkgIndex, 'meeting_point_details', e.target.value)
                            }
                            placeholder="e.g., Meet at the main entrance"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location on Map</Label>
                          <EmbeddedMap
                            address={pkg.meeting_point_address}
                            city={formData.city}
                            country={formData.country}
                            lat={pkg.meeting_point_lat}
                            lng={pkg.meeting_point_lng}
                            onLocationChange={(lat, lng) => {
                              handlePackageChange(pkgIndex, 'meeting_point_lat', lat)
                              handlePackageChange(pkgIndex, 'meeting_point_lng', lng)
                            }}
                          />
                          <div className="text-sm text-muted-foreground">
                            Coordinates: {pkg.meeting_point_lat.toFixed(6)}, {pkg.meeting_point_lng.toFixed(6)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Available Time Slots</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addStartEndTime(pkgIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Time Slot
                          </Button>
                        </div>
                        {pkg.start_end_times.map((timeSlot, timeIndex) => (
                          <div key={timeIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={timeSlot.start_time}
                                onChange={(e) =>
                                  handleStartEndTimeChange(pkgIndex, timeIndex, 'start_time', e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={timeSlot.end_time}
                                onChange={(e) =>
                                  handleStartEndTimeChange(pkgIndex, timeIndex, 'end_time', e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Capacity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={timeSlot.capacity}
                                onChange={(e) =>
                                  handleStartEndTimeChange(pkgIndex, timeIndex, 'capacity', parseInt(e.target.value) || 1)
                                }
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeStartEndTime(pkgIndex, timeIndex)}
                                disabled={pkg.start_end_times.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Availability */}
                      <div className="space-y-4 pt-4 border-t">
                        <h5 className="font-medium">Availability</h5>
                        <div className="space-y-2">
                          <Label>Unavailable Days of Week</Label>
                          <div className="flex flex-wrap gap-2">
                            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day, dayIndex) => (
                              <Button
                                key={day}
                                type="button"
                                variant={pkg.unavailable_days.includes(dayIndex) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleUnavailableDay(pkgIndex, dayIndex)}
                              >
                                {day}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Information</Label>
                        <Textarea
                          value={pkg.additional_info}
                          onChange={(e) =>
                            handlePackageChange(pkgIndex, 'additional_info', e.target.value)
                          }
                          placeholder="Any additional information about this package"
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    addPackage();
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Another Package Option
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="rounded-md object-cover w-full h-32"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed rounded-md flex items-center justify-center h-32">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
            <div className="flex justify-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                {isLoading ? "Creating Tour..." : "Create Tour"}
              </Button>
            </div>
            </div>
          </CardContent>
            
          </form>
      </Card>
    </div>
  )
}
