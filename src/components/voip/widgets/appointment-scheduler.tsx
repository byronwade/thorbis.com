"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Phone, User, Plus, Trash2 } from "lucide-react"

interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  serviceType: string
  address: string
  date: string
  time: string
  duration: number
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled"
  notes: string
  technician: string
  priority: "normal" | "urgent"
}

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    customerPhone: "",
    serviceType: "",
    address: "",
    date: "",
    time: "",
    duration: 60,
    notes: "",
    technician: "",
    priority: "normal" as const,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "completed">("upcoming")

  useEffect(() => {
    const saved = localStorage.getItem("appointment-scheduler")
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
  }, [])

  const saveAppointments = (newAppointments: Appointment[]) => {
    localStorage.setItem("appointment-scheduler", JSON.stringify(newAppointments))
    setAppointments(newAppointments)
  }

  const createAppointment = () => {
    if (!newAppointment.customerName.trim() || !newAppointment.date || !newAppointment.time) return

    const appointment: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      status: "scheduled",
    }

    saveAppointments([...appointments, appointment])
    setNewAppointment({
      customerName: "",
      customerPhone: "",
      serviceType: "",
      address: "",
      date: "",
      time: "",
      duration: 60,
      notes: "",
      technician: "",
      priority: "normal",
    })
  }

  const updateStatus = (id: string, status: Appointment["status"]) => {
    const updated = appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    saveAppointments(updated)
  }

  const deleteAppointment = (id: string) => {
    saveAppointments(appointments.filter((apt) => apt.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "confirmed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-emerald-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-neutral-500"
    }
  }

  const filteredAppointments = appointments
    .filter((apt) => {
      const today = new Date().toISOString().split("T")[0]
      const aptDate = apt.date

      switch (filter) {
        case "today":
          return aptDate === today
        case "upcoming":
          return aptDate >= today && apt.status !== "completed" && apt.status !== "cancelled"
        case "completed":
          return apt.status === "completed"
        default:
          return true
      }
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

  const technicians = ["Mike Johnson", "Sarah Chen", "David Rodriguez", "Lisa Park"]
  const serviceTypes = ["Installation", "Repair", "Maintenance", "Inspection", "Consultation"]

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100">
      <div className="p-2 border-b border-neutral-700">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-blue-400" />
          Appointment Scheduler
        </h3>
      </div>

      <div className="p-2 space-y-3">
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-neutral-800 rounded-lg">
          {[
            { key: "upcoming", label: "Upcoming" },
            { key: "today", label: "Today" },
            { key: "completed", label: "Completed" },
            { key: "all", label: "All" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "default" : "ghost"}
              onClick={() => setFilter(key as any)}
              className={`flex-1 text-xs h-7 ${
                filter === key ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* New Appointment Form */}
        <div className="space-y-2 p-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <div className="flex gap-2">
            <Input
              placeholder="Customer name..."
              value={newAppointment.customerName}
              onChange={(e) => setNewAppointment((prev) => ({ ...prev, customerName: e.target.value }))}
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
            />
            <Input
              placeholder="Phone..."
              value={newAppointment.customerPhone}
              onChange={(e) => setNewAppointment((prev) => ({ ...prev, customerPhone: e.target.value }))}
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={newAppointment.serviceType}
              onValueChange={(value) => setNewAppointment((prev) => ({ ...prev, serviceType: value }))}
            >
              <SelectTrigger className="bg-neutral-700 border-neutral-600">
                <SelectValue placeholder="Service type..." />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newAppointment.technician}
              onValueChange={(value) => setNewAppointment((prev) => ({ ...prev, technician: value }))}
            >
              <SelectTrigger className="bg-neutral-700 border-neutral-600">
                <SelectValue placeholder="Technician..." />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Address..."
            value={newAppointment.address}
            onChange={(e) => setNewAppointment((prev) => ({ ...prev, address: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-neutral-100"
          />

          <div className="flex gap-2">
            <Input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment((prev) => ({ ...prev, date: e.target.value }))}
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
            />
            <Input
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment((prev) => ({ ...prev, time: e.target.value }))}
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
            />
            <Select
              value={newAppointment.duration.toString()}
              onValueChange={(value) => setNewAppointment((prev) => ({ ...prev, duration: Number.parseInt(value) }))}
            >
              <SelectTrigger className="w-24 bg-neutral-700 border-neutral-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30m</SelectItem>
                <SelectItem value="60">1h</SelectItem>
                <SelectItem value="90">1.5h</SelectItem>
                <SelectItem value="120">2h</SelectItem>
                <SelectItem value="180">3h</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createAppointment} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            placeholder="Notes..."
            value={newAppointment.notes}
            onChange={(e) => setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))}
            className="bg-neutral-700 border-neutral-600 text-neutral-100 resize-none"
            rows={2}
          />
        </div>

        {/* Appointments List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment.status)}`} />
                  <span className="font-medium text-sm">{appointment.customerName}</span>
                  {appointment.priority === "urgent" && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(appointment.id, "confirmed")}
                    className="h-6 px-2 text-xs"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(appointment.id, "completed")}
                    className="h-6 px-2 text-xs"
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAppointment(appointment.id)}
                    className="h-6 px-2 text-xs text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-neutral-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {appointment.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {appointment.time} ({appointment.duration}m)
                  </span>
                </div>

                {appointment.serviceType && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">{appointment.serviceType}</span>
                  </div>
                )}

                {appointment.technician && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {appointment.technician}
                  </div>
                )}

                {appointment.customerPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {appointment.customerPhone}
                  </div>
                )}

                {appointment.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {appointment.address}
                  </div>
                )}

                {appointment.notes && <p className="text-neutral-300 mt-1">{appointment.notes}</p>}
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-6 text-neutral-400">
            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  )
}
