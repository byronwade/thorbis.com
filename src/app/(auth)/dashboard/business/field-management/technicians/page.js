'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Briefcase,
  Clock,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Wrench
} from 'lucide-react';

export default function TechniciansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  // Mock technician data
  const technicians = [
    {
      id: 'TECH-001',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@company.com',
      phone: '(555) 123-4567',
      status: 'active',
      availability: 'available',
      location: 'Springfield - North',
      joinDate: '2023-01-15',
      level: 'senior',
      rating: 4.8,
      totalJobs: 245,
      completedJobs: 238,
      skills: ['HVAC', 'Electrical', 'Plumbing'],
      certifications: ['EPA 608', 'NATE Certified', 'OSHA 30'],
      currentJob: null,
      nextJob: 'JOB-001 at 2:00 PM',
      avatar: '/placeholder-user.jpg',
      hourlyRate: '$45.00',
      weeklyHours: 40,
      performanceScore: 94
    },
    {
      id: 'TECH-002',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      phone: '(555) 234-5678',
      status: 'active',
      availability: 'on-job',
      location: 'Springfield - South',
      joinDate: '2023-03-20',
      level: 'senior',
      rating: 4.9,
      totalJobs: 198,
      completedJobs: 195,
      skills: ['Plumbing', 'Water Treatment', 'Drain Cleaning'],
      certifications: ['Master Plumber', 'Backflow Prevention'],
      currentJob: 'JOB-002 - Smith Commercial',
      nextJob: 'JOB-003 at 4:30 PM',
      avatar: '/placeholder-user.jpg',
      hourlyRate: '$48.00',
      weeklyHours: 40,
      performanceScore: 96
    },
    {
      id: 'TECH-003',
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      phone: '(555) 345-6789',
      status: 'active',
      availability: 'off-duty',
      location: 'Springfield - East',
      joinDate: '2022-08-10',
      level: 'lead',
      rating: 4.7,
      totalJobs: 312,
      completedJobs: 305,
      skills: ['Electrical', 'Solar Installation', 'Smart Home'],
      certifications: ['Master Electrician', 'Solar Certified', 'Home Automation'],
      currentJob: null,
      nextJob: 'Tomorrow - 8:00 AM',
      avatar: '/placeholder-user.jpg',
      hourlyRate: '$52.00',
      weeklyHours: 40,
      performanceScore: 92
    },
    {
      id: 'TECH-004',
      name: 'Lisa Martinez',
      email: 'lisa.martinez@company.com',
      phone: '(555) 456-7890',
      status: 'active',
      availability: 'on-break',
      location: 'Springfield - West',
      joinDate: '2023-06-01',
      level: 'junior',
      rating: 4.5,
      totalJobs: 67,
      completedJobs: 65,
      skills: ['HVAC', 'Duct Cleaning', 'Air Quality'],
      certifications: ['EPA 608', 'HVAC Excellence'],
      currentJob: null,
      nextJob: 'JOB-005 at 1:00 PM',
      avatar: '/placeholder-user.jpg',
      hourlyRate: '$38.00',
      weeklyHours: 40,
      performanceScore: 88
    },
    {
      id: 'TECH-005',
      name: 'Tom Anderson',
      email: 'tom.anderson@company.com',
      phone: '(555) 567-8901',
      status: 'inactive',
      availability: 'unavailable',
      location: 'Springfield - Central',
      joinDate: '2021-11-15',
      level: 'senior',
      rating: 4.6,
      totalJobs: 445,
      completedJobs: 432,
      skills: ['General Maintenance', 'Carpentry', 'Painting'],
      certifications: ['General Contractor', 'Safety Certified'],
      currentJob: null,
      nextJob: 'On Leave',
      avatar: '/placeholder-user.jpg',
      hourlyRate: '$42.00',
      weeklyHours: 0,
      performanceScore: 85
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'suspended': 'bg-red-100 text-red-800 border-red-200',
      'training': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      'available': 'bg-green-100 text-green-800 border-green-200',
      'on-job': 'bg-blue-100 text-blue-800 border-blue-200',
      'on-break': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'off-duty': 'bg-gray-100 text-gray-800 border-gray-200',
      'unavailable': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[availability] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getLevelColor = (level) => {
    const colors = {
      'junior': 'text-blue-600',
      'senior': 'text-purple-600',
      'lead': 'text-orange-600',
      'manager': 'text-red-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         tech.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tech.status === statusFilter;
    const matchesSkill = skillFilter === 'all' || tech.skills.some(skill => skill === skillFilter);
    return matchesSearch && matchesStatus && matchesSkill;
  });

  const technicianStats = {
    total: technicians.length,
    active: technicians.filter(t => t.status === 'active').length,
    available: technicians.filter(t => t.availability === 'available').length,
    onJob: technicians.filter(t => t.availability === 'on-job').length,
    avgRating: (technicians.reduce((sum, tech) => sum + tech.rating, 0) / technicians.length).toFixed(1),
    totalJobs: technicians.reduce((sum, tech) => sum + tech.totalJobs, 0)
  };

  const skills = [...new Set(technicians.flatMap(tech => tech.skills))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Technician Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage field technicians and track performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Technician
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Technicians</p>
                <p className="text-2xl font-bold">{technicianStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{technicianStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-600">{technicianStats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Job</p>
                <p className="text-2xl font-bold text-blue-600">{technicianStats.onJob}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold">{technicianStats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold">{technicianStats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search technicians, skills, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="training">Training</option>
              </select>
              
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Skills</option>
                {skills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technicians List */}
      <div className="grid gap-4">
        {filteredTechnicians.map((technician) => (
          <Card key={technician.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={technician.avatar} alt={technician.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg font-medium">
                      {technician.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">{technician.name}</h3>
                      <Badge className={`${getStatusColor(technician.status)} border`}>
                        {technician.status.charAt(0).toUpperCase() + technician.status.slice(1)}
                      </Badge>
                      <Badge className={`${getAvailabilityColor(technician.availability)} border`}>
                        {technician.availability.charAt(0).toUpperCase() + technician.availability.replace('-', ' ').slice(1)}
                      </Badge>
                      <span className={`text-sm font-medium ${getLevelColor(technician.level)}`}>
                        {technician.level.charAt(0).toUpperCase() + technician.level.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{technician.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{technician.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{technician.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Rating: {technician.rating}/5.0</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Jobs: {technician.completedJobs}/{technician.totalJobs}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>Performance: {technician.performanceScore}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Skills: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {technician.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Certifications: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {technician.certifications.map(cert => (
                            <Badge key={cert} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Current Job: {technician.currentJob || 'None'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Next Job: {technician.nextJob}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No technicians found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or add new technicians.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Technician
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
