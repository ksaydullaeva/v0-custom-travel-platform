"use client"

// Initial scaffold for editing an existing experience (tour) from the business dashboard.
// This copies much of the structure from the create-tour page but will evolve to share
// a common reusable form component. For now, it fetches the existing experience, guards
// ownership, and displays a placeholder while we progressively wire the live form.

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, X, MapPin, Upload } from "lucide-react"
import EmbeddedMap from "@/components/EmbeddedMap"
import MultiDatePicker from "@/components/MultiDatePicker"
// TODO: Copy full form implementation here; NewTourPage import removed

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

interface Experience {
  id: string
  business_id: string
  title: string
  description: string
  duration: number
  location: string
  city: string
  country: string
  category: string
  images: any[]
  package_options: any // JSONB coming from DB view (we'll map later)
  status: string
  [key: string]: any
}

export default function EditTourPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [owning, setOwning] = useState(false)

  // Form local state (prefilled from experience once loaded)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [category, setCategory] = useState("")
  const [duration, setDuration] = useState<number>(1)

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<TourImage[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Package options state
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([{
    name: "Standard",
    description: "",
    meeting_point_address: "",
    meeting_point_lat: 0,
    meeting_point_lng: 0,
    meeting_point_details: "",
    start_end_times: [],
    unavailable_dates: [],
    unavailable_days: [],
    age_categories: [],
    additional_info: "",
    inclusions: [""],
    exclusions: [""],
    itinerary: []
  }])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update main experience with images
      const imageUrls = images.map(img => img.url)
      const { error } = await supabase
        .from("experiences")
        .update({
          title,
          description,
          location,
          city,
          country,
          category,
          duration,
          images: imageUrls,
        })
        .eq("id", experience!.id)
        .eq("business_id", user.id)

      if (error) throw error

      // Delete existing package options for this experience
      const { error: deleteError } = await supabase
        .from("package_options")
        .delete()
        .eq("experience_id", experience!.id)

      if (deleteError) {
        console.error('Error deleting existing package options:', deleteError)
        // Continue anyway, might be first time
      }

      // Insert new package options
      for (const [index, pkg] of packageOptions.entries()) {
        const { data: packageData, error: packageError } = await supabase
          .from("package_options")
          .insert({
            experience_id: experience!.id,
            name: pkg.name,
            description: pkg.description,
            meeting_point_address: pkg.meeting_point_address,
            meeting_point_lat: pkg.meeting_point_lat,
            meeting_point_lng: pkg.meeting_point_lng,
            meeting_point_details: pkg.meeting_point_details,
            unavailable_dates: pkg.unavailable_dates,
            unavailable_days: pkg.unavailable_days,
            age_categories: pkg.age_categories,
            additional_info: pkg.additional_info,
            inclusions: pkg.inclusions,
            exclusions: pkg.exclusions,
          })
          .select()
          .single()

        if (packageError) {
          console.error('Error inserting package option:', packageError)
          throw packageError
        }

        // Insert start/end times for this package
        if (pkg.start_end_times && pkg.start_end_times.length > 0) {
          const timesToInsert = pkg.start_end_times.map(time => ({
            package_option_id: packageData.id,
            start_time: time.start_time,
            end_time: time.end_time,
            capacity: time.capacity,
          }))

          const { error: timesError } = await supabase
            .from("package_option_start_end_times")
            .insert(timesToInsert)

          if (timesError) {
            console.error('Error inserting start/end times:', timesError)
            throw timesError
          }
        }

        // Insert itinerary steps for this package
        if (pkg.itinerary && pkg.itinerary.length > 0) {
          const stepsToInsert = pkg.itinerary.map(step => ({
            package_option_id: packageData.id,
            title: step.title,
            description: step.description,
            duration: step.duration,
            day: step.day,
          }))

          const { error: stepsError } = await supabase
            .from("package_itinerary_steps")
            .insert(stepsToInsert)

          if (stepsError) {
            console.error('Error inserting itinerary steps:', stepsError)
            throw stepsError
          }
        }
      }
      
      toast({ title: "Success", description: "Experience updated" })
      router.push("/business/dashboard/tours")
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err.message || "Failed to save" , variant: "destructive"})
    } finally {
      setSaving(false)
    }
  }

  // Image handlers
  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}_${randomString}.${extension}`
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const files = Array.from(e.target.files)
    setIsUploadingImage(true)

    try {
      const bucketName = "tour-images"
      const uploadedImages: TourImage[] = []

      for (const file of files) {
        const fileName = generateUniqueFileName(file.name)
        const filePath = `${fileName}`

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file)

        if (error) {
          console.error('Upload error:', error)
          throw error
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        const newImage: TourImage = {
          id: Date.now().toString() + Math.random().toString(),
          url: urlData.publicUrl,
          path: filePath,
          name: file.name
        }

        uploadedImages.push(newImage)
      }

      setImages(prev => [...prev, ...uploadedImages])
      toast({ title: "Success", description: `${uploadedImages.length} image(s) uploaded successfully` })

      if (e.target) {
        e.target.value = ''
      }
    } catch (error: any) {
      console.error('Error uploading images:', error)
      toast({ title: "Error", description: error.message || "Failed to upload images", variant: "destructive" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = async (imageToRemove: TourImage) => {
    try {
      const { error } = await supabase.storage
        .from("tour-images")
        .remove([imageToRemove.path])

      if (error) {
        console.error('Error removing image from storage:', error)
      }

      setImages(prev => prev.filter(img => img.id !== imageToRemove.id))
      toast({ title: "Success", description: "Image removed successfully" })
    } catch (error: any) {
      console.error('Error removing image:', error)
      toast({ title: "Error", description: error.message || "Failed to remove image", variant: "destructive" })
    }
  }

  // Package handlers
  const handlePackageChange = (pkgIndex: number, field: keyof PackageOption, value: any) => {
    setPackageOptions(prev => prev.map((pkg, i) => 
      i === pkgIndex ? { ...pkg, [field]: value } : pkg
    ))
  }

  const toggleUnavailableDay = (pkgIndex: number, dayIndex: number) => {
    setPackageOptions(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg
      const days = pkg.unavailable_days.includes(dayIndex)
        ? pkg.unavailable_days.filter(d => d !== dayIndex)
        : [...pkg.unavailable_days, dayIndex]
      return { ...pkg, unavailable_days: days }
    }))
  }

  const handleAgeCategoryChange = (pkgIndex: number, catIndex: number, field: keyof AgeCategory, value: any) => {
    setPackageOptions(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg
      const updatedCategories = pkg.age_categories.map((cat, j) => 
        j === catIndex ? { ...cat, [field]: value } : cat
      )
      return { ...pkg, age_categories: updatedCategories }
    }))
  }

  const addAgeCategory = (pkgIndex: number) => {
    setPackageOptions(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg
      return {
        ...pkg,
        age_categories: [...pkg.age_categories, { label: "", min: null, max: null, price: 0 }]
      }
    }))
  }

  const removeAgeCategory = (pkgIndex: number, catIndex: number) => {
    setPackageOptions(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg
      return {
        ...pkg,
        age_categories: pkg.age_categories.filter((_, j) => j !== catIndex)
      }
    }))
  }

  const handleInclusionChange = (pkgIndex: number, index: number, value: string) => {
    setPackageOptions(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg
      const updated = [...pkg.inclusions]
      updated[index] = value
      return { ...pkg, inclusions: updated }
    }))
  }

  const handleExclusionChange = (pkgIndex: number, index: number, value: string) => {
    setPackageOptions(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg
      const updated = [...pkg.exclusions]
      updated[index] = value
      return { ...pkg, exclusions: updated }
    }))
  }

  const addPackage = () => {
    setPackageOptions(prev => [...prev, {
      name: "Package " + (prev.length + 1),
      description: "",
      meeting_point_address: "",
      meeting_point_lat: 0,
      meeting_point_lng: 0,
      meeting_point_details: "",
      start_end_times: [{ start_time: "09:00", end_time: "18:00", capacity: 10 }],
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
      itinerary: [{ title: "", description: "", duration: "2 hours", day: 1 }]
    }])
  }

  const removePackage = (index: number) => {
    if (packageOptions.length > 1) {
      setPackageOptions(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Fetch logged-in business profile and experience, ensure ownership
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/business/login")
          return
        }

        // Fetch business profile (optional but can be used later)
        const { data: profile } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        // Fetch experience with package options
        const { data, error } = await supabase
          .from("experiences")
          .select(`
            *,
            package_options (
              *,
              package_option_start_end_times (*),
              package_itinerary_steps (*)
            )
          `)
          .eq("id", id)
          .single()

        if (error) throw error
        if (!data) throw new Error("Experience not found")

        // Guard ownership
        if (data.business_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You do not have permission to edit this experience.",
            variant: "destructive",
          })
          router.push("/business/dashboard/tours")
          return
        }

        setExperience(data as Experience)
        // Prefill form state
        setTitle(data.title || "")
        setDescription(data.description || "")
        setLocation(data.location || "")
        setCity(data.city || "")
        setCountry(data.country || "")
        setCategory(data.category || "")
        setDuration(data.duration || 1)

        // Populate images
        if (data.images && Array.isArray(data.images)) {
          const imageObjects = data.images.map((img: any, index: number) => ({
            id: `existing-${index}`,
            url: typeof img === 'string' ? img : img.url || img,
            path: typeof img === 'string' ? img : img.path || img,
            name: typeof img === 'string' ? `image-${index}` : img.name || `image-${index}`
          }))
          setImages(imageObjects)
        }

        // Populate package options from fetched data
        if (data.package_options && data.package_options.length > 0) {
          const populatedPackages = data.package_options.map((pkg: any) => ({
            name: pkg.name || "",
            description: pkg.description || "",
            meeting_point_address: pkg.meeting_point_address || "",
            meeting_point_lat: pkg.meeting_point_lat || 0,
            meeting_point_lng: pkg.meeting_point_lng || 0,
            meeting_point_details: pkg.meeting_point_details || "",
            start_end_times: pkg.package_option_start_end_times?.map((time: any) => ({
              start_time: time.start_time || "09:00",
              end_time: time.end_time || "18:00",
              capacity: time.capacity || 10
            })) || [{ start_time: "09:00", end_time: "18:00", capacity: 10 }],
            unavailable_dates: Array.isArray(pkg.unavailable_dates) ? pkg.unavailable_dates : [],
            unavailable_days: Array.isArray(pkg.unavailable_days) ? pkg.unavailable_days : [],
            age_categories: Array.isArray(pkg.age_categories) ? pkg.age_categories : [""],
            additional_info: pkg.additional_info || "",
            inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [""],
            exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [""],
            itinerary: pkg.package_itinerary_steps?.map((step: any) => ({
              title: step.title || "",
              description: step.description || "",
              duration: step.duration || "2 hours",
              day: step.day || 1
            })) || [{ title: "", description: "", duration: "2 hours", day: 1 }]
          }))
          setPackageOptions(populatedPackages)
          console.log(populatedPackages)
        }

        setOwning(true)
      } catch (err: any) {
        console.error(err)
        toast({ title: "Error", description: err.message || "Failed to load experience.", variant: "destructive" })
        router.push("/business/dashboard/tours")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id,name,slug")
      if (!error && data) {
        setCategories(data as any)
      }
    }
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
      </div>
    )
  }

  if (!experience || !owning) return null

  // TODO: replace this with a proper form using the extracted TourForm component.
  // For quick iteration we render the create form component and pass initial data via props.
  // We will later refactor NewTourPage into a reusable <TourForm initialData={...} mode="edit" />.

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Experience</h1>
      {/* Top-level tour details form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General information */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Experience Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (Address)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Registan Square, Samarkand"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Package Options */}
        <Card>
          <CardHeader>
            <CardTitle>Package Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {packageOptions.map((pkg, pkgIndex) => (
              <Card key={pkgIndex} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Package {pkgIndex + 1}: {pkg.name}</CardTitle>
                    {packageOptions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePackage(pkgIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={pkg.name}
                        onChange={(e) => handlePackageChange(pkgIndex, 'name', e.target.value)}
                        placeholder="e.g., Standard, Premium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(pkgIndex, 'description', e.target.value)}
                        placeholder="Package description"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Meeting Point */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Meeting Point</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={pkg.meeting_point_address}
                          onChange={(e) => handlePackageChange(pkgIndex, 'meeting_point_address', e.target.value)}
                          placeholder="Meeting point address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Map Location</Label>
                        <div className="h-64 border rounded-md">
                          <EmbeddedMap
                            address={pkg.meeting_point_address}
                            city={city}
                            country={country}
                            lat={pkg.meeting_point_lat}
                            lng={pkg.meeting_point_lng}
                            onLocationChange={(lat, lng) => {
                              handlePackageChange(pkgIndex, 'meeting_point_lat', lat)
                              handlePackageChange(pkgIndex, 'meeting_point_lng', lng)
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Meeting Point Details</Label>
                        <Textarea
                          value={pkg.meeting_point_details}
                          onChange={(e) => handlePackageChange(pkgIndex, 'meeting_point_details', e.target.value)}
                          placeholder="Additional meeting point instructions"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Age Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Age Categories & Pricing</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAgeCategory(pkgIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Category
                      </Button>
                    </div>
                    {pkg.age_categories.map((category, catIndex) => (
                      <div key={catIndex} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={category.label}
                            onChange={(e) => handleAgeCategoryChange(pkgIndex, catIndex, 'label', e.target.value)}
                            placeholder="e.g., Adult"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Min Age</Label>
                          <Input
                            type="number"
                            value={category.min || ''}
                            onChange={(e) => handleAgeCategoryChange(pkgIndex, catIndex, 'min', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Min"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Age</Label>
                          <Input
                            type="number"
                            value={category.max || ''}
                            onChange={(e) => handleAgeCategoryChange(pkgIndex, catIndex, 'max', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Max"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={category.price}
                            onChange={(e) => handleAgeCategoryChange(pkgIndex, catIndex, 'price', Number(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAgeCategory(pkgIndex, catIndex)}
                          disabled={pkg.age_categories.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Inclusions */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Inclusions</Label>
                    {pkg.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={inclusion}
                          onChange={(e) => handleInclusionChange(pkgIndex, index, e.target.value)}
                          placeholder="What's included"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...pkg.inclusions]
                            updated.splice(index, 1)
                            handlePackageChange(pkgIndex, 'inclusions', updated)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = [...pkg.inclusions, '']
                        handlePackageChange(pkgIndex, 'inclusions', updated)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Inclusion
                    </Button>
                  </div>

                  {/* Exclusions */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Exclusions</Label>
                    {pkg.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={exclusion}
                          onChange={(e) => handleExclusionChange(pkgIndex, index, e.target.value)}
                          placeholder="What's not included"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...pkg.exclusions]
                            updated.splice(index, 1)
                            handlePackageChange(pkgIndex, 'exclusions', updated)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = [...pkg.exclusions, '']
                        handlePackageChange(pkgIndex, 'exclusions', updated)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Exclusion
                    </Button>
                  </div>

                  {/* Unavailable Days */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Unavailable Days of Week</Label>
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

                  {/* Unavailable Dates */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Unavailable Dates</Label>
                    <Textarea
                      value={pkg.unavailable_dates.join(', ')}
                      onChange={(e) => {
                        const dates = e.target.value.split(',').map(d => d.trim()).filter(d => d)
                        handlePackageChange(pkgIndex, 'unavailable_dates', dates)
                      }}
                      placeholder="Enter dates separated by commas (e.g., 2024-12-25, 2024-01-01)"
                      rows={2}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    <Label>Additional Information</Label>
                    <Textarea
                      value={pkg.additional_info}
                      onChange={(e) => handlePackageChange(pkgIndex, 'additional_info', e.target.value)}
                      placeholder="Any additional information about this package"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addPackage}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Package Option
            </Button>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  )
}
