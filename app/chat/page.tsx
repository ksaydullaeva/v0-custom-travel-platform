"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Globe, Send, Bot, User, MapPin, Calendar, PlaneTakeoff, Hotel, Ticket, Menu, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { chatSuggestions } from "@/lib/data"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "👋 Hi there! I'm your AI travel assistant. I can help you discover destinations, plan itineraries, find activities, and answer your travel questions. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      // In a real app, this would call your backend API
      // For now, we'll use the AI SDK directly
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `You are a helpful AI travel assistant. The user says: ${input}. 
        Provide a helpful, friendly response about travel. If they're asking about destinations, 
        activities, or itineraries, give specific suggestions. Keep your response concise but informative.`,
        temperature: 0.7,
        maxTokens: 500,
      })

      // Add AI response
      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Globe className="h-6 w-6 text-primary" />
            <span>TravelMind</span>
          </Link>
          <Tabs defaultValue="chat" className="ml-auto md:ml-10">
            <TabsList>
              <TabsTrigger value="chat" className="text-primary">
                Chat
              </TabsTrigger>
              <TabsTrigger value="explore" asChild>
                <Link href="/explore">Explore</Link>
              </TabsTrigger>
              <TabsTrigger value="itineraries" asChild>
                <Link href="/itineraries">Itineraries</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center ml-auto gap-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              John Doe
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-4 py-4">
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Globe className="h-6 w-6 text-primary" />
                    <span>TravelMind</span>
                  </Link>
                  <div className="grid gap-2">
                    <Link href="/chat" className="flex items-center gap-2 p-2 rounded-md bg-muted">
                      <Bot className="h-5 w-5" />
                      Chat
                    </Link>
                    <Link href="/explore" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <MapPin className="h-5 w-5" />
                      Explore
                    </Link>
                    <Link href="/itineraries" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Calendar className="h-5 w-5" />
                      My Itineraries
                    </Link>
                    <div className="border-t my-2 pt-2">
                      <p className="px-2 text-sm font-medium">Tools</p>
                    </div>
                    <Link href="/hotels" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Hotel className="h-5 w-5" />
                      Hotels
                    </Link>
                    <Link href="/flights" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <PlaneTakeoff className="h-5 w-5" />
                      Flights
                    </Link>
                    <Link href="/activities" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Ticket className="h-5 w-5" />
                      Activities
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-medium mb-3">Tools</h3>
            <div className="space-y-2">
              <Link href="/hotels">
                <Button variant="outline" className="w-full justify-start">
                  <Hotel className="h-4 w-4 mr-2" />
                  Hotels
                </Button>
              </Link>
              <Link href="/flights">
                <Button variant="outline" className="w-full justify-start">
                  <PlaneTakeoff className="h-4 w-4 mr-2" />
                  Flights
                </Button>
              </Link>
              <Link href="/activities">
                <Button variant="outline" className="w-full justify-start">
                  <Ticket className="h-4 w-4 mr-2" />
                  Activities
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-4 border-t">
            <h3 className="font-medium mb-3">Recent Chats</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-left h-auto py-2">
                <div>
                  <p className="font-medium">Trip to Japan</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left h-auto py-2">
                <div>
                  <p className="font-medium">European vacation</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left h-auto py-2">
                <div>
                  <p className="font-medium">Beach destinations</p>
                  <p className="text-xs text-muted-foreground">Last week</p>
                </div>
              </Button>
            </div>
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-4rem)]">
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-muted">
                      <User className="h-4 w-4" />
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-start gap-2">
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium mb-3">Suggested questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {chatSuggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-3 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <p className="text-sm">{suggestion}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
              <Input
                placeholder="Ask me anything about travel..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
