"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"

interface DatePickerProps {
  onSelect: (date: string) => void
  onClose: () => void
}

export function DatePicker({ onSelect, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarDays, setCalendarDays] = useState<React.ReactNode[]>([])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate calendar days whenever the current month changes
  useEffect(() => {
    generateCalendarDays()
  }, [currentMonth, selectedDate])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10 flex items-center justify-center text-gray-300"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()

      days.push(
        <button
          key={`day-${day}`}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-lg
            ${isSelected ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-100"}
            ${new Date().toDateString() === date.toDateString() ? "font-bold" : ""}
          `}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </button>,
      )
    }

    setCalendarDays(days)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleApply = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      onSelect(formattedDate)
    } else {
      onClose()
    }
  }

  const handleReset = () => {
    setSelectedDate(null)
    onSelect("")
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 w-[350px] border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5 transform rotate-180" />
        </button>
        <h2 className="text-xl font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">{calendarDays}</div>

      <div className="flex gap-2 mt-4">
        <button
          className="flex-1 py-3 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
          onClick={handleReset}
        >
          Reset
        </button>
        <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  )
}
