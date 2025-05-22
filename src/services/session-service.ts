import { Session } from "@/app/sessions/types";
import { DaySchedule, SessionSchedule } from "@/app/sessions/types";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Add new session to database
export async function addSession(session: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `)
    .single();

  if (error) {
    console.error('Error adding session:', error);
    return null;
  }

  return data;
}

// Upload session image to Supabase storage
export async function uploadSessionImage(file: any, filename: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload failed:', errorData.error);
      return null;
    }
    
    const result = await response.json();
    return result.path;
  } catch (error) {
    console.error('Error in upload:', error);
    return null;
  }
}

export async function getAllSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return undefined;
  }

  return data;
}

export async function getPopularSessions(limit: number = 3): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `)
    .limit(limit);

  if (error) {
    console.error('Error fetching popular sessions:', error);
    return [];
  }

  return data || [];
}

export async function getSessionsByType(type: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `)
    .eq('type', type);

  if (error) {
    console.error('Error fetching sessions by type:', error);
    return [];
  }

  return data || [];
}

export async function getSessionsByInstructor(instructorId: number): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `)
    .eq('instructor_id', instructorId);

  if (error) {
    console.error('Error fetching sessions by instructor:', error);
    return [];
  }

  return data || [];
}

export async function getUniqueInstructors(): Promise<{ trainer_id: number; name: string }[]> {
  const { data, error } = await supabase
    .from('Trainer')
    .select('trainer_id, name');

  if (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }

  return data || [];
}

export async function getUniqueTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('type');

  if (error) {
    console.error('Error fetching unique types:', error);
    return [];
  }

  if (!data) return [];
  
  const uniqueTypes = [...new Set(data.map((item: { type: string }) => item.type))];
  return uniqueTypes;
}

export async function filterSessions({
  type,
  instructor,
  intensity,
  search,
  day_of_week
}: {
  type?: string;
  instructor?: number;
  intensity?: 'Low' | 'Medium' | 'High';
  search?: string;
  day_of_week?: number;
}): Promise<Session[]> {
  let query = supabase
    .from('sessions')
    .select(`
      *,
      instructor:Trainer (
        name,
        specialization,
        contact
      )
    `);

  if (type) {
    query = query.eq('type', type);
  }

  if (instructor) {
    query = query.eq('instructor_id', instructor);
  }

  if (intensity) {
    query = query.eq('intensity', intensity);
  }

  if (day_of_week !== undefined) {
    query = query.eq('day_of_week', day_of_week);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error filtering sessions:', error);
    return [];
  }

  return data || [];
}

/**
 * Update an existing session by ID
 */
export async function updateSession(id: string, sessionData: Partial<Session>): Promise<Session | null> {
  try {
    // First get the current session to merge with updates
    const { data: currentSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentSession) {
      throw new Error('Session not found');
    }

    // Update the session
    const { data, error } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', id)
      .select(`
        *,
        instructor:Trainer (
          name,
          specialization,
          contact
        )
      `)
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update session:', error);
    throw error;
  }
} 