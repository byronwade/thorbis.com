'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Plus, User, Phone, MapPin, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getMockPeople } from '@/components/investigations/data/mock-data'
import type { Person } from '@/types/investigations'

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState(')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const people = getMockPeople()

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = searchQuery === ' || 
        '${person.firstName} ${person.lastName}'.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = typeFilter === 'all' || person.type === typeFilter
      const matchesRisk = riskFilter === 'all' || person.riskLevel === riskFilter
      
      return matchesSearch && matchesType && matchesRisk
    })
  }, [people, searchQuery, typeFilter, riskFilter])

  const getTypeColor = (type: Person['type']) => {
    switch (type) {
      case 'suspect': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'victim': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'witness': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'person_of_interest': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'informant': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'officer': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      case 'other': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getRiskColor = (riskLevel: Person['riskLevel']) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskIcon = (riskLevel: Person['riskLevel']) => {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return <AlertTriangle className="w-4 h-4" />
    }
    return null
  }

  const getAge = (dateOfBirth: string | undefined): number | null => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getPrimaryContact = (person: Person) => {
    const primary = person.contacts.find(contact => contact.primary)
    return primary || person.contacts[0]
  }

  const getPrimaryAddress = (person: Person) => {
    const current = person.addresses.find(addr => addr.type === 'current')
    const residence = person.addresses.find(addr => addr.type === 'residence')
    return current || residence || person.addresses[0]
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">People</h1>
            <p className="text-gray-400 mt-2">
              Manage persons of interest, suspects, victims, and witnesses
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search people by name or aliases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="suspect">Suspect</option>
              <option value="victim">Victim</option>
              <option value="witness">Witness</option>
              <option value="person_of_interest">Person of Interest</option>
              <option value="informant">Informant</option>
              <option value="officer">Officer</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPeople.map((person) => {
            const primaryContact = getPrimaryContact(person)
            const primaryAddress = getPrimaryAddress(person)
            const age = getAge(person.dateOfBirth)

            return (
              <Card key={person.id} className="bg-gray-900 border-gray-700 p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {person.firstName} {person.lastName}
                      </h3>
                      {age && (
                        <p className="text-gray-400 text-sm">Age {age}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRiskIcon(person.riskLevel) && (
                      <span className={getRiskColor(person.riskLevel)}>
                        {getRiskIcon(person.riskLevel)}
                      </span>
                    )}
                    <Badge className={getTypeColor(person.type)}>
                      {person.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Aliases */}
                {person.aliases.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aliases</p>
                    <div className="flex flex-wrap gap-1">
                      {person.aliases.slice(0, 2).map((alias, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/20"
                        >
                          {alias}
                        </Badge>
                      ))}
                      {person.aliases.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/20"
                        >
                          +{person.aliases.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  {primaryContact && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{primaryContact.value}</span>
                    </div>
                  )}
                  {primaryAddress && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{primaryAddress.city}, {primaryAddress.state}</span>
                    </div>
                  )}
                </div>

                {/* Physical Description */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    {person.physicalDescription.height && (
                      <div>Height: {person.physicalDescription.height}</div>
                    )}
                    {person.physicalDescription.eyeColor && (
                      <div>Eyes: {person.physicalDescription.eyeColor}</div>
                    )}
                    {person.physicalDescription.hairColor && (
                      <div>Hair: {person.physicalDescription.hairColor}</div>
                    )}
                    {person.physicalDescription.race && (
                      <div>Race: {person.physicalDescription.race}</div>
                    )}
                  </div>
                </div>

                {/* Case Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {person.associatedCases.length}
                    </div>
                    <div className="text-xs text-gray-400">Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {person.criminalHistory.length}
                    </div>
                    <div className="text-xs text-gray-400">History</div>
                  </div>
                </div>

                {/* Risk Level Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Level</span>
                    <Badge className={'${getRiskColor(person.riskLevel)} bg-transparent border-transparent'}>
                      {person.riskLevel}
                    </Badge>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredPeople.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No people found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}