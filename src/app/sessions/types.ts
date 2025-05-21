export interface Session {
  id: string;
  title: string;
  image: string;
  slug: string;
  description: string;
  duration: number; // in minutes
  intensity: 'Low' | 'Medium' | 'High';
  type: string;
  instructor_id: number;
  instructor?: {
    name: string;
    specialization: string | null;
    contact: string | null;
  };
  capacity: number;
  equipment: string[];
  benefits: string[];
  day_of_week?: number | null; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time?: string | null; // Format: "HH:MM:SS"
  end_time?: string | null; // Format: "HH:MM:SS"
  created_at?: string;
  updated_at?: string;
}

export interface DaySchedule {
  day: string;
  sessions: SessionSchedule[];
}

export interface SessionSchedule {
  time: string;
  title: string;
  color: string;
  image: string;
  sessionId: string;
}

export interface TimeSlot {
  id: string;
  name: string;
}

export const timeSlots: TimeSlot[] = [
  { id: 'morning', name: 'Morning' },
  { id: 'afternoon', name: 'Afternoon' },
  { id: 'evening', name: 'Evening' },
  { id: 'night', name: 'Night' },
];

export const sessionTypes = [
  'Yoga', 
  'Cardio', 
  'Strength', 
  'HIIT', 
  'Meditation', 
  'Dance', 
  'Pilates',
  'Aerobics',
  'Functional',
  'Recovery',
  'Nutrition',
  'Personal Training'
];

export const daysOfWeek = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
]; 