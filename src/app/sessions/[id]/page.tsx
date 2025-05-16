"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionById } from "@/services/session-service";
import { Session } from "../types";
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
  Award 
} from "lucide-react";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        if (!params.id || typeof params.id !== "string") {
          throw new Error("Invalid session ID");
        }
        
        const sessionData = await getSessionById(params.id);
        setSession(sessionData || null);
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

      {/* Related Sessions - Could be implemented in the future */}
    </div>
  );
} 