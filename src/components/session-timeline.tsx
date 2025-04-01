"use client"
import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define session data type with image URL
interface SessionData {
  time: string;
  title: string;
  color: string;
  image: string;
}

// Define day schedule type
interface DaySchedule {
  day: string;
  sessions: SessionData[];
}

// Sample week schedule data - now with image URLs
const weekSchedule: DaySchedule[] = [
  {
    day: "Monday",
    sessions: [
      { time: "Morning", title: "Morning Yoga", color: "bg-orange-500", image: "/images/morning-yoga.jpeg" },
      { time: "Afternoon", title: "HIIT Cardio", color: "bg-orange-500", image: "/images/hiit-cardio.jpg" },
      { time: "Afternoon", title: "Personal Training", color: "bg-orange-500", image: "/images/personal-training.jpg" },
      { time: "Evening", title: "Strength Training", color: "bg-orange-500", image: "/images/strength-training.jpg" },
      { time: "Evening", title: "Spinning Class", color: "bg-orange-500", image: "/images/spinning.jpg" },
      { time: "Evening", title: "Core & Abs", color: "bg-orange-500", image: "/images/core&abs.webp" },
      { time: "Night", title: "Body Sculpting", color: "bg-orange-500", image: "/images/body-sculpting.jpeg" },
    ]
  },
  {
    day: "Tuesday",
    sessions: [
      { time: "Morning", title: "Pilates", color: "bg-orange-200", image: "/images/pilates.jpeg" },
      { time: "Afternoon", title: "Personal Training", color: "bg-orange-200", image: "/images/personal-training.jpg" },
      { time: "Afternoon", title: "Functional Training Circuit", color: "bg-orange-200", image: "/images/functional-training.jpg" },
      { time: "Evening", title: "Nutrition Consultation", color: "bg-orange-200", image: "/images/nutrition.jpg" },
      { time: "Evening", title: "Kickboxing", color: "bg-orange-200", image: "/images/kickboxing.jpg" },
      { time: "Evening", title: "Zumba Dance", color: "bg-orange-200", image: "/images/zumba.jpg" },
      { time: "Night", title: "Evening Meditation", color: "bg-orange-200", image: "/images/evening-meditation.jpg" },
    ]
  },
  {
    day: "Wednesday",
    sessions: [
      { time: "Morning", title: "Core & Abs", color: "bg-orange-500", image: "/images/core&abs.webp" },
      { time: "Afternoon", title: "Morning Yoga", color: "bg-orange-500", image: "/images/morning-yoga.jpeg" },
      { time: "Afternoon", title: "Aqua Aerobics", color: "bg-orange-500", image: "/images/aqua-aerobics.jpeg" },
      { time: "Evening", title: "Stretch & Recovery", color: "bg-orange-500", image: "/images/stretch-recovery.jpg" },
      { time: "Evening", title: "Personal Training", color: "bg-orange-500", image: "/images/personal-training.jpg" },
      { time: "Evening", title: "Body Sculpting", color: "bg-orange-500", image: "/images/body-sculpting.jpeg" },
      { time: "Night", title: "Evening Meditation", color: "bg-orange-500", image: "/images/evening-meditation.jpg" },
    ]
  },
  {
    day: "Thursday",
    sessions: [
      { time: "Morning", title: "Power Yoga", color: "bg-orange-200", image: "/images/5-17.jpg" },
      { time: "Afternoon", title: "Spinning Class", color: "bg-orange-200", image: "/images/spinning.jpg" },
      { time: "Afternoon", title: "HIIT Cardio", color: "bg-orange-200", image: "/images/hiit-cardio.jpg" },
      { time: "Evening", title: "Kickboxing", color: "bg-orange-200", image: "/images/kickboxing.jpg" },
      { time: "Evening", title: "Zumba Dance", color: "bg-orange-200", image: "/images/zumba.jpg" },
      { time: "Evening", title: "Personal Training", color: "bg-orange-200", image: "/images/personal-training.jpg" },
      { time: "Night", title: "Stretch & Recovery", color: "bg-orange-200", image: "/images/stretch-recovery.jpg" },
    ]
  },
  {
    day: "Friday",
    sessions: [
      { time: "Morning", title: "Pilates", color: "bg-orange-500", image: "/images/pilates.jpeg" },
      { time: "Afternoon", title: "Strength Training", color: "bg-orange-500", image: "/images/strength-training.jpg" },
      { time: "Afternoon", title: "Nutrition Consultation", color: "bg-orange-500", image: "/images/nutrition.jpg" },
      { time: "Evening", title: "Functional Training Circuit", color: "bg-orange-500", image: "/images/functional-training.jpg" },
      { time: "Evening", title: "Mind/Body Integration", color: "bg-orange-500", image: "/images/mind.jpeg" },
      { time: "Evening", title: "Body Sculpting", color: "bg-orange-500", image: "/images/body-sculpting.jpeg" },
      { time: "Night", title: "Evening Meditation", color: "bg-orange-500", image: "/images/evening-meditation.jpg" },
    ]
  },
  {
    day: "Sunday",
    sessions: [
      { time: "Morning", title: "Morning Yoga", color: "bg-orange-500", image: "/images/morning-yoga.jpeg" },
      { time: "Afternoon", title: "Aqua Aerobics", color: "bg-orange-500", image: "/images/aqua-aerobics.jpeg" },
      { time: "Afternoon", title: "Walking Yoga", color: "bg-orange-500", image: "/images/walking-yoga.jpg" },
      { time: "Evening", title: "Zumba Dance", color: "bg-orange-500", image: "/images/zumba.jpg" },
      { time: "Evening", title: "Stretch & Recovery", color: "bg-orange-500", image: "/images/stretch-recovery.jpg" },
      { time: "Evening", title: "Core & Abs", color: "bg-orange-500", image: "/images/core&abs.webp" },
      { time: "Night", title: "Evening Meditation", color: "bg-orange-500", image: "/images/evening-meditation.jpg" },
    ]
  }
];

// Calculate the number of time slots to display
const timeSlots = Math.max(...weekSchedule.map(day => day.sessions.length));

// Helper function to get week of month from date
const getWeekOfMonth = (date: Date): number => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const pastDaysOfMonth = date.getDate() - 1;
  
  // Add days until first day of month is a Monday (0 is Sunday, 1 is Monday)
  const dayOfWeek = firstDayOfMonth.getDay();
  const leadingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return Math.ceil((pastDaysOfMonth + leadingDays) / 7);
};

export const SessionTimeline: React.FC = () => {
  // State for current date
  const [currentDate, setCurrentDate] = React.useState(new Date(2024, 9, 7)); // October 7, 2024
  
  // Get formatted date string
  const getFormattedDate = (): string => {
    const weekNumber = getWeekOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    return `Week ${weekNumber} of ${monthName} ${year}`;
  };
  
  // Navigate to previous week
  const prevWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };
  
  // Navigate to next week
  const nextWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Session Timeline</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Weekly Schedule
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="bg-gray-100 px-3 py-1 h-8 flex items-center">
                <span className="text-sm font-medium">{getFormattedDate()}</span>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
              {[...Array(timeSlots)].map((_, slotIndex) => (
                <tr key={slotIndex}>
                  {weekSchedule.map((day, dayIndex) => {
                    const session = day.sessions[slotIndex];
                    return (
                      <td 
                        key={dayIndex} 
                        className="p-1"
                      >
                        {session && (
                          <div 
                            className="relative rounded-xl min-h-20 h-24 overflow-hidden transition-all hover:opacity-90 cursor-pointer shadow-md"
                          >
                            {/* Use Next.js Image component */}
                            <div className="absolute inset-0">
                              {/* Placeholder API paths */}
                              {session.image.startsWith('/api/placeholder') ? (
                                <img 
                                  src={session.image} 
                                  alt={session.title}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                /* Next.js Image for regular images */
                                <Image 
                                  src={session.image}
                                  alt={session.title}
                                  fill={true}
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              )}
                              {/* Dark overlay for text visibility */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40"></div>
                            </div>
                            
                            {/* Text content */}
                            <div className="relative z-10 h-full flex flex-col justify-center items-center p-2">
                              <span className="text-sm font-medium text-white">{session.title}</span>
                            </div>
                          </div>
                        )}
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
  );
};

export default SessionTimeline;