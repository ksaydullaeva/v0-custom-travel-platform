"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

const chatMessages = [
  {
    role: "assistant",
    content: "Hi there! I'm your AI travel assistant. How can I help you plan your next trip?",
  },
  {
    role: "user",
    content: "I want to visit Japan for 10 days in April. Can you suggest an itinerary?",
  },
  {
    role: "assistant",
    content:
      "Great choice! Japan in April is beautiful with cherry blossoms. Here's a 10-day itinerary:\n\n**Days 1-3: Tokyo**\n- Explore Shibuya and Shinjuku\n- Visit Meiji Shrine and Yoyogi Park\n- Day trip to Kamakura\n\n**Days 4-5: Hakone**\n- Hot springs and Mt. Fuji views\n- Lake Ashi cruise\n\n**Days 6-9: Kyoto**\n- Historic temples and shrines\n- Day trip to Nara\n- Day trip to Osaka\n\n**Day 10: Return to Tokyo**\n\nWould you like more details on any part of this itinerary?",
  },
]

export default function ChatPreview() {
  const [messages, setMessages] = useState(chatMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState<typeof chatMessages>([])

  useEffect(() => {
    // Simulate typing effect for the first message
    setIsTyping(true)
    const timer = setTimeout(() => {
      setDisplayedMessages([messages[0]])
      setIsTyping(false)
      setCurrentTypingIndex(1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (currentTypingIndex < messages.length && !isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setDisplayedMessages((prev) => [...prev, messages[currentTypingIndex]])
          setIsTyping(false)
          setCurrentTypingIndex((prev) => prev + 1)
        }, messages[currentTypingIndex].content.length * 20)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentTypingIndex, isTyping, messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // In a real app, you would send this to your API
    setInput("")
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl overflow-hidden">
      <div className="p-3 border-b bg-muted/50 flex items-center">
        <Bot className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-medium">Travel Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedMessages.map((message, index) => (
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
              <p className="whitespace-pre-line text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 bg-muted">
                <User className="h-4 w-4" />
              </Avatar>
            )}
          </div>
        ))}
        {isTyping && (
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
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Input
          placeholder="Ask about your trip..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  )
}
