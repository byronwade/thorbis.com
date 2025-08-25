"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons"

export function VehicleFilters({
  vehicles,
  onFilteredVehicles
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeFilters, setActiveFilters] = useState([])

  const applyFilters = () => {
    let filtered = vehicles

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((vehicle) =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.destination.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === typeFilter)
    }

    onFilteredVehicles(filtered)

    // Update active filters
    const filters = []
    if (searchTerm) filters.push(`Search: ${searchTerm}`)
    if (statusFilter !== "all") filters.push(`Status: ${statusFilter}`)
    if (typeFilter !== "all") filters.push(`Type: ${typeFilter}`)
    setActiveFilters(filters)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setActiveFilters([])
    onFilteredVehicles(vehicles)
  }

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.startsWith("Search:")) {
      setSearchTerm("")
    } else if (filterToRemove.startsWith("Status:")) {
      setStatusFilter("all")
    } else if (filterToRemove.startsWith("Type:")) {
      setTypeFilter("all")
    }

    // Reapply filters after removing one
    setTimeout(applyFilters, 0)
  }

  return (
    <div className="space-y-3 p-3 mb-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
        <div className="relative flex-1 md:min-w-[200px] lg:min-w-[300px]">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, drivers, plates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10" />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-36 lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-36 lg:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sedan">Sedan</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="coupe">Coupe</SelectItem>
            <SelectItem value="bus">Bus</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={applyFilters} className="w-full md:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Apply
        </Button>
      </div>
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter}
              <Cross2Icon
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => removeFilter(filter)} />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
