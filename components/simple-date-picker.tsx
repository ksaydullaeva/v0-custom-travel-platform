"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

interface DatePickerProps {
  onSelect: (dateRange: string) => void
  onClose: () => void
}

export function DatePicker({ onSelect, onClose }: DatePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  // Current month and year
  const currentDate = new Date()
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth())
  const [viewYear, setViewYear] = useState(currentDate.getFullYear())

  // Days in current month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()

  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long" })

  // Navigate to previous month
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  // Navigate to next month
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Check if a date is the start date
  const isStartDate = (date: Date) => {
    return (
      startDate &&
      date.getDate() === startDate.getDate() &&
      date.getMonth() === startDate.getMonth() &&
      date.getFullYear() === startDate.getFullYear()
    )
  }

  // Check if a date is the end date
  const isEndDate = (date: Date) => {
    return (
      endDate &&
      date.getDate() === endDate.getDate() &&
      date.getMonth() === endDate.getMonth() &&
      date.getFullYear() === endDate.getFullYear()
    )
  }

  // Check if a date is in the selected range
  const isInRange = (date: Date) => {
    if (!startDate) return false

    const end = endDate || hoverDate
    if (!end) return false

    return date > startDate && date < end
  }

  // Handle date click
  const handleDateClick = (date: Date, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!startDate || (startDate && endDate) || date < startDate) {
      setStartDate(date)
      setEndDate(null)
    } else {
      setEndDate(date)
    }
  }

  // Handle date hover
  const handleDateHover = (date: Date) => {
    if (startDate && !endDate) {
      setHoverDate(date)
    }
  }

  // Generate calendar days
  const calendarDays = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10"></div>)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day)
    const isStart = isStartDate(date)
    const isEnd = isEndDate(date)
    const inRange = isInRange(date)

    // Calculate today (set time to 00:00:00 for accurate comparison)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isPast = date < today

    calendarDays.push(
      <button
        key={day}
        type="button" // Prevent form submission
        className={`h-10 w-10 rounded-full flex items-center justify-center text-lg
          ${isStart || isEnd ? "bg-blue-600 text-white" : ""}
          ${inRange ? "bg-blue-100 text-black" : "text-black hover:bg-gray-100"}
          ${isPast ? "text-gray-300 cursor-not-allowed bg-gray-50 hover:bg-gray-50" : ""}
        `}
        onClick={isPast ? undefined : (e) => handleDateClick(date, e)}
        onMouseEnter={isPast ? undefined : () => handleDateHover(date)}
        disabled={isPast}
      >
        {day}
      </button>,
    )
  }

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Prevent event bubbling

    if (startDate) {
      let dateRangeText = ""

      if (endDate) {
        dateRangeText = `${formatDate(startDate)} - ${formatDate(endDate)}`
      } else {
        dateRangeText = formatDate(startDate)
      }

      onSelect(dateRangeText)
    } else {
      onClose()
    }
  }

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Prevent event bubbling

    setStartDate(null)
    setEndDate(null)
    setHoverDate(null)
    onSelect("")
    onClose()
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 w-[350px] border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <button
          type="button" // Prevent form submission
          className="p-1 rounded-full bg-gray-100 border border-blue-500 shadow-md hover:bg-blue-100"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            prevMonth()
          }}
        >
          <ChevronRight className="h-5 w-5 text-blue-600 transform rotate-180" />
        </button>
        <h2 className="text-xl text-black font-bold">
          {monthName} {viewYear}
        </h2>
        <button
          type="button" // Prevent form submission
          className="p-1 rounded-full bg-gray-100 border border-blue-500 shadow-md hover:bg-blue-100"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            nextMonth()
          }}
        >
          <ChevronRight className="h-5 w-5 text-blue-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">{calendarDays}</div>

      <div className="text-sm text-gray-600 mb-4">
        {startDate && !endDate && <p>Select end date</p>}
        {startDate && endDate && (
          <p>
            {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button" // Prevent form submission
          className="flex-1 py-3 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          type="button" // Prevent form submission
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
