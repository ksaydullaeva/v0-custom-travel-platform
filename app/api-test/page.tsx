"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"

export default function ApiTestPage() {
  const [backendStatus, setBackendStatus] = useState<string>("Not tested")
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Not tested")
  const [error, setError] = useState<string | null>(null)
  const [supabaseData, setSupabaseData] = useState<any[]>([])

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test FastAPI backend connection
  const testBackendConnection = async () => {
    try {
      setBackendStatus("Testing...")
      const response = await fetch("http://localhost:8000/health")

      if (response.ok) {
        const data = await response.json()
        setBackendStatus(`Connected: ${data.message}`)
      } else {
        setBackendStatus(`Error: ${response.status}`)
      }
    } catch (err) {
      setBackendStatus("Failed to connect")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  // Update the testSupabaseConnection function to use the actual destinations table

  const testSupabaseConnection = async () => {
    try {
      setSupabaseStatus("Testing...")

      // Attempt to query the destinations table we just created
      const { data, error } = await supabase.from("destinations").select("*").limit(3)

      if (error) throw error

      setSupabaseData(data || [])
      setSupabaseStatus("Connected successfully")
    } catch (err) {
      setSupabaseStatus("Failed to connect")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>FastAPI Backend Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="mb-2">
                Status:{" "}
                <span
                  className={`font-bold ${backendStatus.includes("Connected") ? "text-green-600" : backendStatus === "Testing..." ? "text-yellow-600" : "text-red-600"}`}
                >
                  {backendStatus}
                </span>
              </p>
              {error && <p className="text-red-600 text-sm mt-2">Error: {error}</p>}
            </div>
            <Button onClick={testBackendConnection}>Test Backend Connection</Button>
          </CardContent>
        </Card>

        {/* Supabase Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="mb-2">
                Status:{" "}
                <span
                  className={`font-bold ${supabaseStatus.includes("Connected") ? "text-green-600" : supabaseStatus === "Testing..." ? "text-yellow-600" : "text-red-600"}`}
                >
                  {supabaseStatus}
                </span>
              </p>
              {supabaseData.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold">Retrieved {supabaseData.length} records:</p>
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto max-h-32">
                    {JSON.stringify(supabaseData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <Button onClick={testSupabaseConnection}>Test Supabase Connection</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
