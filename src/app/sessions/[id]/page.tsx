"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionById, updateSession } from "@/services/session-service";
import { Session, daysOfWeek } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Calendar, 
  Dumbbell,
  BellRing,
  CheckCircle,
  Award,
  Edit,
  CalendarDays
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import { formatSchedule } from "@/app/sessions/utils";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    day_of_week: null as number | null,
    start_time: '' as string | null,
    end_time: '' as string | null
  });

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        if (!params.id || typeof params.id !== "string") {
          throw new Error("Invalid session ID");
        }
        
        const sessionData = await getSessionById(params.id);
        setSession(sessionData || null);
        
        // Initialize edit form with session data
        if (sessionData) {
          setEditForm({
            day_of_week: sessionData.day_of_week || null,
            start_time: sessionData.start_time || '',
            end_time: sessionData.end_time || ''
          });
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [params.id]);

  const goBack = () => {
    router.back();
  };

  const getIntensityColor = (intensity: string) => {
    switch(intensity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const openEditDialog = () => {
    if (session) {
      setEditForm({
        day_of_week: session.day_of_week || null,
        start_time: session.start_time || '',
        end_time: session.end_time || ''
      });
      setIsEditDialogOpen(true);
    }
  };
  
  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-calculate end time based on start time and session duration
    if (field === 'start_time' && value && session) {
      const endTime = calculateEndTime(value, session.duration);
      if (endTime) {
        setEditForm(prev => ({
          ...prev,
          end_time: endTime
        }));
      }
    }
  };
  
  const calculateEndTime = (startTime: string, durationMinutes: number): string | null => {
    if (!startTime) return null;
    
    try {
      const [hours, minutes] = startTime.split(':').map(part => parseInt(part, 10));
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      // Calculate end time by adding duration
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      
      return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating end time:', error);
      return null;
    }
  };
  
  const handleSaveSchedule = async () => {
    if (!session) return;
    
    setIsUpdating(true);
    try {
      const updatedSession = await updateSession(session.id, {
        day_of_week: editForm.day_of_week,
        start_time: editForm.start_time,
        end_time: editForm.end_time
      });
      
      if (updatedSession) {
        setSession(updatedSession);
        toast.success("Session schedule updated successfully");
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session schedule", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center px-4 lg:px-0">
        <LoadingButton isLoading={true} loadingText="Loading session details..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full px-4 lg:px-0">
        <Button onClick={goBack} variant="outline" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
        </Button>
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-lg font-medium mb-2">Session not found</p>
          <p className="text-muted-foreground">The session you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-0">
      <Button onClick={goBack} variant="outline" className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Image and Session Info */}
        <div className="md:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-6">
            <Image
              src={session.image}
              alt={session.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="outline" className={getIntensityColor(session.intensity)}>
                {session.intensity} Intensity
              </Badge>
              <Badge variant="outline" className="bg-secondary/10">
                {session.type}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{session.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">{session.capacity} people</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Instructor</p>
                  <p className="text-sm text-muted-foreground">
                    {session.instructor ? session.instructor.name : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Schedule Information with Edit Button */}
            <div className="bg-secondary/10 p-4 rounded-lg flex justify-between items-center mb-6">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm font-medium">Schedule</p>
                  {session.day_of_week !== null && session.start_time ? (
                    <p className="text-sm text-muted-foreground">
                      {formatSchedule(session.day_of_week, session.start_time, session.end_time)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific schedule assigned</p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openEditDialog}
                className="flex items-center gap-1"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Schedule
              </Button>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground">{session.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Required Equipment</h2>
                {session.equipment.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {session.equipment.map((item, index) => (
                      <li key={index} className="text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No equipment required for this session.</p>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Benefits</h2>
                <ul className="list-disc pl-5 space-y-1">
                  {session.benefits.map((benefit, index) => (
                    <li key={index} className="text-muted-foreground">{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Book This Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Session Type:</span>
                <span>{session.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Duration:</span>
                <span>{session.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Intensity:</span>
                <Badge variant="outline" className={getIntensityColor(session.intensity)}>
                  {session.intensity}
                </Badge>
              </div>
              
              <div className="bg-secondary/10 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Advance booking recommended</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Session available this week</p>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Led by certified trainers</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full">Book Now</Button>
              <Button variant="outline" className="w-full">Add to Favorites</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Session Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day_of_week">Day of Week</Label>
              <Select
                value={editForm.day_of_week !== null ? editForm.day_of_week.toString() : "none"}
                onValueChange={(value) => 
                  handleEditFormChange('day_of_week', value === "none" ? null : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day of week (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific day</SelectItem>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day.id} value={day.id.toString()}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <TimePicker
                  value={editForm.start_time || ''}
                  onChange={(value) => handleEditFormChange('start_time', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <TimePicker
                  value={editForm.end_time || ''}
                  onChange={(value) => handleEditFormChange('end_time', value)}
                  disabled={!!editForm.start_time}
                />
                {editForm.start_time && (
                  <p className="text-xs text-muted-foreground">
                    End time is calculated based on duration ({session.duration} minutes)
                  </p>
                )}
              </div>
            </div>
            
            {editForm.start_time && editForm.end_time && (
              <div className="bg-muted p-2 rounded-md mt-2">
                <p className="text-sm flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  Session will run for {session.duration} minutes, from{' '}
                  <span className="font-medium mx-1">{
                    new Date(`2000-01-01T${editForm.start_time}:00`).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })
                  }</span> to{' '}
                  <span className="font-medium mx-1">{
                    new Date(`2000-01-01T${editForm.end_time}:00`).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })
                  }</span>
                </p>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              You can leave these empty to remove any specific schedule assignment.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveSchedule} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 