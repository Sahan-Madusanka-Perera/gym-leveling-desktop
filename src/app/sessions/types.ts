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