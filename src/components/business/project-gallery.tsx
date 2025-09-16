"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Eye,
  Calendar,
  MapPin,
  Award,
  FolderOpen,
  Info,
  Building2,
  CheckCircle,
  Star,
  Users,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Shield,
  Medal,
  Timer,
  Phone,
  MessageCircle,
  Filter,
  Grid3X3,
  Maximize2,
  Play
} from "lucide-react";

interface Project {
  id: string;
  image: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description?: string;
}

interface ProjectGalleryProps {
  business: {
    name: string;
    gallery?: string[];
  };
}

export function ProjectGallery({ business }: ProjectGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleCallClick = () => {
    window.location.href = 'tel:+1-800-555-0123';
  };

  const handleQuoteClick = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Modern project showcase inspired by top platforms
  const projects = [
    {
      id: 'project-1',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      title: 'Complete System Overhaul',
      category: 'Full Service',
      location: 'San Francisco, CA',
      value: '$2,850',
      rating: 5.0,
      description: 'Complete system replacement with modern components'
    },
    {
      id: 'project-2', 
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      title: 'Emergency Repair',
      category: 'Emergency',
      location: 'Oakland, CA', 
      value: '$450',
      rating: 4.9,
      description: 'Same-day emergency response and repair'
    },
    {
      id: 'project-3',
      image: 'https://images.unsplash.com/photo-1609778705752-d4c34b8b4e3d?w=400&h=300&fit=crop', 
      title: 'Preventive Maintenance',
      category: 'Maintenance',
      location: 'Berkeley, CA',
      value: '$295',
      rating: 4.8,
      description: 'Comprehensive maintenance and optimization'
    },
    {
      id: 'project-4',
      image: 'https://images.unsplash.com/photo-1607472829080-677b5c2a3c21?w=400&h=300&fit=crop',
      title: 'Premium Installation',
      category: 'Installation',
      location: 'Palo Alto, CA',
      value: '$1,850',
      rating: 5.0,
      description: 'High-end installation with warranty'
    }
  ];

  const categories = ['All', 'Emergency', 'Full Service', 'Maintenance', 'Installation'];
  
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage === 0 ? filteredProjects.length - 1 : selectedImage - 1);
    } else {
      setSelectedImage(selectedImage === filteredProjects.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <section className="min-h-screen bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[#1C8BFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-bold mb-4">Recent Work</h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-8">
            Explore our portfolio of {projects.length} successfully completed projects with verified customer reviews
          </p>

          {/* Category Filter Pills */}
          <div className="flex gap-3 flex-wrap justify-center">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              const categoryCount = category === 'All' ? projects.length : projects.filter(p => p.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1C8BFF] text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                  }'}
                >
                  {category} ({categoryCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Grid */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-800/80 transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => openLightbox(index)}
              >
                <div className="relative h-64">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 bg-black/70 rounded-full px-3 py-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-medium">{project.rating}</span>
                      </div>
                      <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                        <span className="text-green-400 text-sm font-bold">{project.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-2">{project.title}</h4>
                  <div className="flex items-center gap-2 text-neutral-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 bg-neutral-700 px-3 py-1 rounded-full border border-neutral-600">{project.category}</span>
                    <button className="text-[#1C8BFF] hover:text-[#1C8BFF]/80 text-sm font-medium flex items-center gap-1">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio CTA Section */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-neutral-800 to-neutral-700 p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Quality Showcase</h3>
                <p className="text-xl text-neutral-300 leading-relaxed mb-8">
                  Browse our portfolio of completed projects with real customer reviews and verified ratings. Each project represents our commitment to excellence.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleQuoteClick}
                    className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Get Quote for Similar Project
                  </button>
                  
                  <button
                    onClick={handleCallClick}
                    className="border-2 border-neutral-600 hover:border-neutral-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:bg-neutral-800 flex items-center justify-center gap-3"
                  >
                    <Phone className="w-6 h-6" />
                    Discuss Your Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && filteredProjects[selectedImage] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <div className="relative max-w-full max-h-full">
              <Image
                src={filteredProjects[selectedImage].image}
                alt={filteredProjects[selectedImage].title}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
                priority
              />
              
              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 rounded-b-lg">
                <h3 className="text-white font-bold text-lg mb-2">{filteredProjects[selectedImage].title}</h3>
                <p className="text-gray-200 text-sm mb-3">{filteredProjects[selectedImage].description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{filteredProjects[selectedImage].location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{filteredProjects[selectedImage].rating}</span>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold">{filteredProjects[selectedImage].value}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            {selectedImage + 1} of {filteredProjects.length}
          </div>
        </div>
      )}
    </section>
  );
}