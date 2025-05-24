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
import { ArrowLeft, Upload, Plus, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

interface TourImage {
  id: string
  url: string
  path: string
  name: string
}

export default function NewTourPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    location: "",
    city: "",
    country: "",
    category: "",
    maxParticipants: "",
    included: [""],
    notIncluded: [""],
    itinerary: [{ title: "", description: "" }],
  })
  const [images, setImages] = useState<TourImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

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
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIncludedChange = (index: number, value: string) => {
    const newIncluded = [...formData.included]
    newIncluded[index] = value
    setFormData((prev) => ({ ...prev, included: newIncluded }))
  }

  const handleNotIncludedChange = (index: number, value: string) => {
    const newNotIncluded = [...formData.notIncluded]
    newNotIncluded[index] = value
    setFormData((prev) => ({ ...prev, notIncluded: newNotIncluded }))
  }

  const handleItineraryChange = (index: number, field: string, value: string) => {
    const newItinerary = [...formData.itinerary]
    newItinerary[index] = { ...newItinerary[index], [field]: value }
    setFormData((prev) => ({ ...prev, itinerary: newItinerary }))
  }

  const addIncludedItem = () => {
    setFormData((prev) => ({ ...prev, included: [...prev.included, ""] }))
  }

  const removeIncludedItem = (index: number) => {
    if (formData.included.length > 1) {
      const newIncluded = [...formData.included]
      newIncluded.splice(index, 1)
      setFormData((prev) => ({ ...prev, included: newIncluded }))
    }
  }

  const addNotIncludedItem = () => {
    setFormData((prev) => ({ ...prev, notIncluded: [...prev.notIncluded, ""] }))
  }

  const removeNotIncludedItem = (index: number) => {
    if (formData.notIncluded.length > 1) {
      const newNotIncluded = [...formData.notIncluded]
      newNotIncluded.splice(index, 1)
      setFormData((prev) => ({ ...prev, notIncluded: newNotIncluded }))
    }
  }

  const addItineraryItem = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { title: "", description: "" }],
    }))
  }

  const removeItineraryItem = (index: number) => {
    if (formData.itinerary.length > 1) {
      const newItinerary = [...formData.itinerary]
      newItinerary.splice(index, 1)
      setFormData((prev) => ({ ...prev, itinerary: newItinerary }))
    }
  }

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = originalName.split(".").pop()
    return `${timestamp}-${randomString}.${fileExtension}`
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create a tour")
      }

      // Prepare location data
      const locationParts = formData.location.split(",").map((part) => part.trim())
      const city = formData.city || locationParts[0] || ""
      const country = formData.country || locationParts[locationParts.length - 1] || ""

      // Create the tour as an experience
      const { data, error } = await supabase
        .from("experiences")
        .insert({
          business_id: user.id,
          title: formData.title,
          description: formData.description,
          price: Number.parseFloat(formData.price) || 0,
          duration: Number.parseInt(formData.duration) || 1,
          location: formData.location,
          city: city,
          country: country,
          category: formData.category,
          rating: 0, // Default rating for new experiences
          reviews_count: 0, // Default reviews count
          image_url: images.length > 0 ? images[0].url : null, // Primary image
          images: images.map((img) => img.url), // All image URLs
          included: formData.included.filter((item) => item.trim() !== ""),
          not_included: formData.notIncluded.filter((item) => item.trim() !== ""),
          itinerary: formData.itinerary.filter((item) => item.title.trim() !== "" || item.description.trim() !== ""),
          max_participants: Number.parseInt(formData.maxParticipants) || 10,
          latitude: 0, // Default coordinates (should be set based on location)
          longitude: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Tour created successfully!",
        description: "Your tour has been created and is now available for booking.",
      })

      router.push("/business/dashboard/tours")
    } catch (error: any) {
      console.error("Error creating tour:", error)
      toast({
        title: "Error creating tour",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardTitle>Create New Tour</CardTitle>
          <CardDescription>Fill in the details to create a new tour listing</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tour Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., 7-Day Cultural Tour of Uzbekistan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Tour Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of your tour..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 499.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 8"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Full Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Tashkent, Uzbekistan"
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., Uzbekistan"
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
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="food">Food & Culinary</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                    <SelectItem value="nature">Nature & Wildlife</SelectItem>
                    <SelectItem value="city">City Tour</SelectItem>
                    <SelectItem value="religious">Religious & Spiritual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>What's Included</Label>
              {formData.included.map((item, index) => (
                <div key={`included-${index}`} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleIncludedChange(index, e.target.value)}
                    placeholder="e.g., Airport transfers"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIncludedItem(index)}
                    disabled={formData.included.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addIncludedItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              <Label>What's Not Included</Label>
              {formData.notIncluded.map((item, index) => (
                <div key={`not-included-${index}`} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleNotIncludedChange(index, e.target.value)}
                    placeholder="e.g., International flights"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotIncludedItem(index)}
                    disabled={formData.notIncluded.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addNotIncludedItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              <Label>Itinerary</Label>
              {formData.itinerary.map((item, index) => (
                <div key={`itinerary-${index}`} className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <Label>Day {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItineraryItem(index)}
                      disabled={formData.itinerary.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={item.title}
                    onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                    placeholder="Title (e.g., Arrival in Tashkent)"
                    className="mb-2"
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                    placeholder="Description of activities for this day..."
                    rows={3}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItineraryItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>

            <div className="space-y-4">
              <Label>Tour Images</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative rounded-md overflow-hidden h-40 group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Tour image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => removeImage(image)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
                <div className="border border-dashed rounded-md flex items-center justify-center h-40 hover:border-primary transition-colors">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload high-quality images of your tour. Recommended size: 1200×800 pixels. The first image will be used
                as the primary image.
              </p>
              {isUploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Uploading images...
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || isUploadingImage}>
              {isLoading ? "Creating Tour..." : "Create Tour"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
