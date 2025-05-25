import { Loader2 } from "lucide-react"

export default function BookingLoading() {
  return (
    <div className="container py-12 flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <p className="text-lg">Loading booking page...</p>
    </div>
  )
}
