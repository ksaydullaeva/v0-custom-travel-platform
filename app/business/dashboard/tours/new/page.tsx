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
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function NewTourPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    location: "",
    category: "",
    maxParticipants: "",
    included: [""],
    notIncluded: [""],
    itinerary: [{ title: "", description: "" }],
    images: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    setIsLoading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `tour-images/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage.from("tours").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("tours").getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.publicUrl],
      }))

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData((prev) => ({ ...prev, images: newImages }))
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

      // Create the tour
      const { data, error } = await supabase
        .from("tours")
        .insert({
          business_id: user.id,
          title: formData.title,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          duration: formData.duration,
          location: formData.location,
          category: formData.category,
          max_participants: Number.parseInt(formData.maxParticipants),
          included: formData.included.filter((item) => item.trim() !== ""),
          not_included: formData.notIncluded.filter((item) => item.trim() !== ""),
          itinerary: formData.itinerary.filter((item) => item.title.trim() !== "" || item.description.trim() !== ""),
          images: formData.images,
          status: "active",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Tour created!",
        description: "Your tour has been created successfully.",
      })

      router.push("/business/dashboard/tours")
    } catch (error: any) {
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
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 7 days / 6 nights"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Tashkent, Samarkand, Bukhara"
                  required
                />
              </div>
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
                {formData.images.map((image, index) => (
                  <div key={`image-${index}`} className="relative rounded-md overflow-hidden h-40">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Tour image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="border border-dashed rounded-md flex items-center justify-center h-40">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload high-quality images of your tour. Recommended size: 1200x800 pixels.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Tour..." : "Create Tour"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
