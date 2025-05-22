import { daysOfWeek } from "./types";

export function formatSchedule(dayOfWeek: number | null | undefined, startTime: string | null | undefined, endTime: string | null | undefined) {
  const dayName = dayOfWeek !== null && dayOfWeek !== undefined ? daysOfWeek.find(day => day.id === dayOfWeek)?.name : null;
  
  // Format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTimeString = (timeStr: string | null | undefined) => {
    if (!timeStr) return null;
    
    // If it has seconds, remove them
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      if (parts.length === 3) {
        timeStr = `${parts[0]}:${parts[1]}`;
      }
    }
    
    // Try to parse the time
    try {
      const timeParts = timeStr.split(':');
      if (timeParts.length < 2) return timeStr;
      
      let hours = parseInt(timeParts[0], 10);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };
  
  const formattedStartTime = formatTimeString(startTime);
  const formattedEndTime = formatTimeString(endTime);
  
  if (dayName && formattedStartTime && formattedEndTime) {
    return `${dayName}s, ${formattedStartTime} - ${formattedEndTime}`;
  } else if (dayName) {
    return `${dayName}s`;
  } else if (formattedStartTime && formattedEndTime) {
    return `${formattedStartTime} - ${formattedEndTime}`;
  }
  
  return null;
} 