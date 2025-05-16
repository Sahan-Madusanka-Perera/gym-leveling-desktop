"use client";

import React, { useEffect, useState } from "react";
import { Session, timeSlots } from "./types";
import { 
  getAllSessions,
  getUniqueTypes,
  getUniqueInstructors,
  filterSessions,
  addSession,
  uploadSessionImage
} from "@/services/session-service";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Grid, LayoutList, Users, Plus, Image as ImageIcon, Trash, Save, ListChecks, Info } from "lucide-react";

// Temporary mock data for weekSchedule until we implement it in Supabase
const weekSchedule = [
  {
    day: "Monday",
    sessions: [
      { time: "Morning", title: "Morning Yoga", color: "bg-blue-100", image: "/images/morning-yoga.jpeg", sessionId: "1" },
      { time: "Afternoon", title: "HIIT Cardio", color: "bg-red-100", image: "/images/hiit-cardio.jpg", sessionId: "2" }
    ]
  },
  {
    day: "Tuesday",
    sessions: [
      { time: "Morning", title: "Pilates", color: "bg-green-100", image: "/images/pilates.jpeg", sessionId: "4" },
      { time: "Evening", title: "Strength Training", color: "bg-purple-100", image: "/images/strength-training.jpg", sessionId: "3" }
    ]
  },
  {
    day: "Wednesday",
    sessions: [
      { time: "Morning", title: "Morning Yoga", color: "bg-blue-100", image: "/images/morning-yoga.jpeg", sessionId: "1" },
      { time: "Afternoon", title: "Kickboxing", color: "bg-orange-100", image: "/images/kickboxing.jpg", sessionId: "5" }
    ]
  },
  {
    day: "Thursday",
    sessions: [
      { time: "Morning", title: "Spinning Class", color: "bg-yellow-100", image: "/images/spinning.jpg", sessionId: "6" },
      { time: "Evening", title: "Core & Abs", color: "bg-pink-100", image: "/images/core&abs.webp", sessionId: "8" }
    ]
  },
  {
    day: "Friday",
    sessions: [
      { time: "Morning", title: "Zumba Dance", color: "bg-indigo-100", image: "/images/zumba.jpg", sessionId: "7" },
      { time: "Evening", title: "Stretch & Recovery", color: "bg-teal-100", image: "/images/stretch-recovery.jpg", sessionId: "9" }
    ]
  },
  {
    day: "Saturday",
    sessions: [
      { time: "Morning", title: "Morning Yoga", color: "bg-blue-100", image: "/images/morning-yoga.jpeg", sessionId: "1" },
      { time: "Afternoon", title: "HIIT Cardio", color: "bg-red-100", image: "/images/hiit-cardio.jpg", sessionId: "2" }
    ]
  },
  {
    day: "Sunday",
    sessions: [
      { time: "Morning", title: "Stretch & Recovery", color: "bg-teal-100", image: "/images/stretch-recovery.jpg", sessionId: "9" },
      { time: "Afternoon", title: "Evening Meditation", color: "bg-violet-100", image: "/images/evening-meditation.jpg", sessionId: "10" }
    ]
  }
]; 

// AddSessionDialog Component
function AddSessionDialog({ onSessionAdded }: { onSessionAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  const [instructors, setInstructors] = useState<{ trainer_id: number; name: string }[]>([]);
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: 60,
    intensity: 'Medium' as 'Low' | 'Medium' | 'High',
    type: '',
    instructor_id: 0,
    capacity: 15,
    equipment: [''],
    benefits: [''],
  });

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const instructorsData = await getUniqueInstructors();
          setInstructors(instructorsData);
          
          const typesData = await getUniqueTypes();
          setSessionTypes(typesData);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      
      fetchData();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name: 'equipment' | 'benefits', index: number, value: string) => {
    setFormData(prev => {
      const newList = [...prev[name]];
      newList[index] = value;
      return { ...prev, [name]: newList };
    });
  };

  const addListItem = (name: 'equipment' | 'benefits') => {
    setFormData(prev => {
      // Create a typed copy of the array
      const newItems = Array.isArray(prev[name]) ? 
        [...prev[name] as string[]] : 
        [];
      newItems.push('');
      return { ...prev, [name]: newItems };
    });
  };

  const removeListItem = (name: 'equipment' | 'benefits', index: number) => {
    setFormData(prev => {
      // Create a typed copy of the array
      const newItems = Array.isArray(prev[name]) ? 
        [...prev[name] as string[]] : 
        [];
      newItems.splice(index, 1);
      return { ...prev, [name]: newItems };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events for image upload
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      duration: 60,
      intensity: 'Medium',
      type: '',
      instructor_id: 0,
      capacity: 15,
      equipment: [''],
      benefits: [''],
    });
    setImageFile(null);
    setImagePreview(null);
    setActiveTab('info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let imagePath = '/images/default-session.jpg';
      
      // Handle image upload
      if (imageFile) {
        // Generate unique filename with timestamp
        const timestamp = new Date().getTime();
        const extension = imageFile.name.split('.').pop();
        const filename = `${formData.slug}-${timestamp}.${extension}`;
        
        const imageUrl = await uploadSessionImage(imageFile, filename);
        if (imageUrl) {
          imagePath = imageUrl;
        }
      }
      
      // Filter out empty items from arrays
      const equipment = formData.equipment.filter(item => item.trim());
      const benefits = formData.benefits.filter(item => item.trim());
      
      // Create session
      await addSession({
        ...formData,
        equipment,
        benefits,
        image: imagePath,
        instructor_id: Number(formData.instructor_id)
      });
      
      // Reset form and close dialog
      resetForm();
      setOpen(false);
      
      // Notify parent to refresh data
      onSessionAdded();
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="my-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info" className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center">
                <ListChecks className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Morning Yoga"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="e.g. morning-yoga"
                />
                <p className="text-xs text-muted-foreground">
                  This will be used in the URL: /sessions/your-slug
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Provide a detailed description of this session"
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Session Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity</Label>
                  <Select
                    value={formData.intensity}
                    onValueChange={(value: any) => handleSelectChange('intensity', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select
                    value={formData.instructor_id.toString()}
                    onValueChange={(value) => handleSelectChange('instructor_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map(instructor => (
                        <SelectItem key={instructor.trainer_id} value={instructor.trainer_id.toString()}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min={1}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab('details')}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Required Equipment</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={() => addListItem('equipment')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                
                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleListChange('equipment', index, e.target.value)}
                      placeholder="e.g. Yoga mat"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem('equipment', index)}
                      disabled={formData.equipment.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Session Benefits</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={() => addListItem('benefits')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Benefit
                  </Button>
                </div>
                
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => handleListChange('benefits', index, e.target.value)}
                      placeholder="e.g. Improved flexibility"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem('benefits', index)}
                      disabled={formData.benefits.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab('info')}>
                  Previous
                </Button>
                <Button type="button" onClick={() => setActiveTab('image')}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-md ${dragActive ? 'border-primary/70 bg-primary/5' : 'border-gray-300'} p-6 text-center`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="flex justify-center">
                      <Plus className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Click or drag to upload session image
                    </p>
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Label
                  htmlFor="image"
                  className="w-full text-center cursor-pointer py-2 px-4 bg-secondary/20 hover:bg-secondary/30 transition rounded-md block mt-2"
                >
                  Browse Files
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended size: 800x600px. Maximum file size: 2MB.
              </p>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                  Previous
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Session...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SessionsPage() {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<{id: number; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter states
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        // Use the async functions
        const sessionsData = await getAllSessions();
        setAllSessions(sessionsData);
        setFilteredSessions(sessionsData);
        
        const typesData = await getUniqueTypes();
        setTypes(typesData);
        
        const instructorsData = await getUniqueInstructors();
        // Transform the instructor data to match the expected format
        const formattedInstructors = instructorsData.map(instructor => ({
          id: instructor.trainer_id,
          name: instructor.name
        }));
        setInstructors(formattedInstructors);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  useEffect(() => {
    // Apply filters when any filter criteria changes
    const applyFilters = async () => {
      try {
        // Fix type safety issues with selectedIntensity
        let intensityFilter: 'Low' | 'Medium' | 'High' | undefined = undefined;
        if (selectedIntensity) {
          intensityFilter = selectedIntensity;
        }
        
        const filtered = await filterSessions({
          type: selectedType === "all_types" ? undefined : selectedType || undefined,
          instructor: selectedInstructor === null ? undefined : selectedInstructor,
          intensity: intensityFilter,
          search: searchTerm || undefined
        });
        setFilteredSessions(filtered);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (error) {
        console.error("Failed to filter sessions:", error);
      }
    };

    if (!isLoading) {
      applyFilters();
    }
  }, [selectedType, selectedInstructor, selectedIntensity, searchTerm, isLoading, instructors]);

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedInstructor(null);
    setSelectedIntensity(null);
    setSearchTerm("");
  };

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "schedule") {
      // No additional filtering needed for schedule
    } else if (value !== "all") {
      // Filter by time slot
      setSelectedType(null);
      setSelectedInstructor(null);
      setSelectedIntensity(null);
      
      // We'll use the search term to filter by time of day
      const timeSlot = value.charAt(0).toUpperCase() + value.slice(1);
      
      // Create a list of all sessions that occur during this time slot
      const sessionsInTimeSlot = weekSchedule.flatMap(day => 
        day.sessions.filter(s => s.time === timeSlot)
          .map(s => s.sessionId)
      );
      
      // Filter the main sessions list to only include those in this time slot
      const filtered = allSessions.filter(session => 
        sessionsInTimeSlot.includes(session.id)
      );
      
      setFilteredSessions(filtered);
    } else {
      // Reset filters when "All" is selected
      clearFilters();
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch(intensity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add this function to refresh sessions after adding a new one
  const refreshSessions = async () => {
    try {
      // Use the async functions
      const sessionsData = await getAllSessions();
      setAllSessions(sessionsData);
      setFilteredSessions(sessionsData);
      
      const typesData = await getUniqueTypes();
      setTypes(typesData);
      
      const instructorsData = await getUniqueInstructors();
      // Transform the instructor data to match the expected format
      const formattedInstructors = instructorsData.map(instructor => ({
        id: instructor.trainer_id,
        name: instructor.name
      }));
      setInstructors(formattedInstructors);
    } catch (error) {
      console.error("Failed to refresh sessions:", error);
    }
  };

  return (
    <div className="w-full px-4 lg:px-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Session Management</h1>
        <AddSessionDialog onSessionAdded={refreshSessions} />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="morning">Morning</TabsTrigger>
          <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
          <TabsTrigger value="evening">Evening</TabsTrigger>
          <TabsTrigger value="night">Night</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="mt-6">
          <Card className="w-full shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Weekly Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {weekSchedule.map((day, index) => (
                        <th key={index} className="p-2 text-center border-b">
                          {day.day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot, slotIndex) => (
                      <tr key={slotIndex}>
                        <th className="p-2 text-left font-medium text-muted-foreground">
                          {timeSlot.name}
                        </th>
                        {weekSchedule.map((day, dayIndex) => {
                          const sessionsInSlot = day.sessions.filter(
                            session => session.time === timeSlot.name
                          );
                          
                          return (
                            <td key={dayIndex} className="p-1 border">
                              <div className="grid grid-cols-1 gap-1">
                                {sessionsInSlot.map((session, i) => (
                                  <Link 
                                    href={`/sessions/${session.sessionId}`} 
                                    key={`${dayIndex}-${slotIndex}-${i}`}
                                  >
                                    <div className="relative rounded-md h-16 overflow-hidden transition-all hover:opacity-90 cursor-pointer shadow-sm border">
                                      <div className="absolute inset-0">
                                        <Image 
                                          src={session.image}
                                          alt={session.title}
                                          fill={true}
                                          style={{ objectFit: 'cover' }}
                                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                          unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40"></div>
                                      </div>
                                      <div className="relative z-10 h-full flex flex-col justify-center items-center p-1">
                                        <span className="text-xs font-medium text-white text-center">
                                          {session.title}
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <Sessions 
            isLoading={isLoading}
            sessions={currentSessions}
            filteredSessions={filteredSessions}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            types={types}
            instructors={instructors}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedInstructor={selectedInstructor}
            setSelectedInstructor={setSelectedInstructor}
            selectedIntensity={selectedIntensity}
            setSelectedIntensity={setSelectedIntensity}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearFilters={clearFilters}
            getIntensityColor={getIntensityColor}
          />
        </TabsContent>
        
        {/* Make each time slot tab re-use the Sessions component */}
        {timeSlots.map(slot => (
          <TabsContent key={slot.id} value={slot.id} className="mt-6">
            <Sessions 
              isLoading={isLoading}
              sessions={currentSessions}
              filteredSessions={filteredSessions}
              selectedView={selectedView}
              setSelectedView={setSelectedView}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              types={types}
              instructors={instructors}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedInstructor={selectedInstructor}
              setSelectedInstructor={setSelectedInstructor}
              selectedIntensity={selectedIntensity}
              setSelectedIntensity={setSelectedIntensity}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              clearFilters={clearFilters}
              getIntensityColor={getIntensityColor}
              timeSlotName={slot.name}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Extracted Sessions component to avoid code duplication
function Sessions({
  isLoading,
  sessions,
  filteredSessions,
  selectedView,
  setSelectedView,
  currentPage,
  totalPages,
  handlePageChange,
  types,
  instructors,
  selectedType,
  setSelectedType,
  selectedInstructor,
  setSelectedInstructor,
  selectedIntensity,
  setSelectedIntensity,
  searchTerm,
  setSearchTerm,
  clearFilters,
  getIntensityColor,
  timeSlotName
}: {
  isLoading: boolean;
  sessions: Session[];
  filteredSessions: Session[];
  selectedView: 'grid' | 'list';
  setSelectedView: (view: 'grid' | 'list') => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  types: string[];
  instructors: {id: number; name: string}[];
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  selectedInstructor: number | null;
  setSelectedInstructor: (instructor: number | null) => void;
  selectedIntensity: 'Low' | 'Medium' | 'High' | null;
  setSelectedIntensity: (intensity: 'Low' | 'Medium' | 'High' | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  getIntensityColor: (intensity: string) => string;
  timeSlotName?: string;
}) {
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingButton isLoading={true} loadingText="Loading sessions..." />
        </div>
      ) : (
        <>
          {/* Filters Section */}
          <div className="bg-secondary/10 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder={`Search sessions${timeSlotName ? ` (${timeSlotName})` : ''}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select 
                  value={selectedType || undefined}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor</label>
                <Select 
                  value={selectedInstructor !== null ? selectedInstructor.toString() : undefined}
                  onValueChange={(value) => {
                    if (value === "all_instructors") {
                      setSelectedInstructor(null);
                    } else {
                      setSelectedInstructor(parseInt(value));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_instructors">All Instructors</SelectItem>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Intensity</label>
                <Select 
                  value={selectedIntensity || ""}
                  onValueChange={(value) => {
                    if (value === "all_intensity") {
                      setSelectedIntensity(null);
                    } else if (value === "Low" || value === "Medium" || value === "High") {
                      setSelectedIntensity(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_intensity">All Intensities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm">
              Showing {filteredSessions.length} sessions
              {timeSlotName ? ` (${timeSlotName})` : ''}
            </p>
            <div className="flex gap-2">
              <Button 
                variant={selectedView === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedView('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button 
                variant={selectedView === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedView('list')}
              >
                <LayoutList className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* No Results */}
          {filteredSessions.length === 0 && (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <p className="text-lg font-medium mb-2">No sessions found</p>
              <p className="text-muted-foreground">Try changing your filters or search term</p>
            </div>
          )}

          {/* Grid View */}
          {selectedView === 'grid' && filteredSessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="overflow-hidden h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-secondary/20">
                    <Image
                      src={session.image}
                      alt={session.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold truncate" title={session.title}>
                      {session.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className={getIntensityColor(session.intensity)}>
                        {session.intensity} Intensity
                      </Badge>
                      <Badge variant="outline" className="bg-secondary/10">
                        {session.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{session.duration} min</span>
                      <span className="mx-2">•</span>
                      <Users className="h-4 w-4" />
                      <span>Capacity: {session.capacity}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {session.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/sessions/${session.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {selectedView === 'list' && filteredSessions.length > 0 && (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    <div className="w-full md:w-32 h-32 relative overflow-hidden bg-secondary/20 shrink-0 rounded-md">
                      <Image
                        src={session.image}
                        alt={session.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={getIntensityColor(session.intensity)}>
                          {session.intensity} Intensity
                        </Badge>
                        <Badge variant="outline" className="bg-secondary/10">
                          {session.type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mb-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {session.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Instructor:</span>
                          <span>{session.instructor ? session.instructor.name : ''}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.description}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center mt-4 md:mt-0">
                      <Link href={`/sessions/${session.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredSessions.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = totalPages <= 5 
                  ? i + 1 
                  : currentPage > 3 && currentPage < totalPages - 1 
                    ? currentPage - 2 + i 
                    : currentPage >= totalPages - 1 
                      ? totalPages - 4 + i 
                      : i + 1;
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
