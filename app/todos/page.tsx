"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserTodos, createTodo, updateTodo, deleteTodo, type Todo, type TodoInput } from "@/lib/api/todos"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Edit, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TodosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  // Fetch todos on component mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/todos")
      return
    }

    if (user) {
      fetchTodos()
    }
  }, [user, authLoading, router])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const data = await getUserTodos()
      setTodos(data)
    } catch (error) {
      toast({
        title: "Error fetching todos",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const todoInput: TodoInput = {
        title,
        description: description || null,
        due_date: dueDate ? dueDate.toISOString() : null,
        completed: false,
        priority,
        related_destination_id: null,
      }

      if (editingTodo) {
        await updateTodo(editingTodo.id, todoInput)
        toast({
          title: "Todo updated",
          description: "Your todo has been updated successfully",
        })
      } else {
        await createTodo(todoInput)
        toast({
          title: "Todo created",
          description: "Your todo has been created successfully",
        })
      }

      // Reset form
      setTitle("")
      setDescription("")
      setDueDate(undefined)
      setPriority("medium")
      setShowForm(false)
      setEditingTodo(null)

      // Refresh todos
      fetchTodos()
    } catch (error) {
      toast({
        title: editingTodo ? "Error updating todo" : "Error creating todo",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await updateTodo(todo.id, { completed: !todo.completed })
      fetchTodos()
    } catch (error) {
      toast({
        title: "Error updating todo",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id)
      toast({
        title: "Todo deleted",
        description: "Your todo has been deleted successfully",
      })
      fetchTodos()
    } catch (error) {
      toast({
        title: "Error deleting todo",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setTitle(todo.title)
    setDescription(todo.description || "")
    setDueDate(todo.due_date ? new Date(todo.due_date) : undefined)
    setPriority(todo.priority)
    setShowForm(true)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  if (authLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Travel Todo List</h1>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            if (!showForm) {
              setEditingTodo(null)
              setTitle("")
              setDescription("")
              setDueDate(undefined)
              setPriority("medium")
            }
          }}
        >
          {showForm ? "Cancel" : "Add Todo"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingTodo ? "Edit Todo" : "Add New Todo"}</CardTitle>
            <CardDescription>
              {editingTodo ? "Update your travel task details" : "Add a new task to your travel planning list"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateTodo}>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter todo title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter todo description"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">{editingTodo ? "Update Todo" : "Create Todo"}</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading todos...</p>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No todos yet</h3>
          <p className="text-muted-foreground mt-1">Create your first todo to get started</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Todo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <Card key={todo.id} className={todo.completed ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                      className="mt-1"
                    />
                    <CardTitle className={`text-lg ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                      {todo.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center">{getPriorityIcon(todo.priority)}</div>
                </div>
                {todo.due_date && (
                  <CardDescription className="mt-1">Due: {format(new Date(todo.due_date), "PPP")}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {todo.description && (
                  <p className={`text-sm ${todo.completed ? "text-muted-foreground" : ""}`}>{todo.description}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditTodo(todo)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteTodo(todo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
