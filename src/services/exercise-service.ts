import { Exercise } from "@/app/exercises/types";

export async function getExercises(): Promise<Exercise[]> {
  try {
    const response = await fetch('/exercises/db_updated.json');
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }
    const data: Exercise[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const exercises = await getExercises();
    return exercises.find(exercise => exercise.id === id) || null;
  } catch (error) {
    console.error('Error fetching exercise by ID:', error);
    return null;
  }
}

export function getUniqueBodyParts(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map(exercise => exercise.bodyPart))];
}

export function getUniqueEquipment(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map(exercise => exercise.equipment))];
}

export function getUniqueTargets(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map(exercise => exercise.target))];
}

export function filterExercises(
  exercises: Exercise[],
  { bodyPart, equipment, target, searchTerm }: { bodyPart?: string | null; equipment?: string | null; target?: string | null; searchTerm?: string }
): Exercise[] {
  return exercises.filter(exercise => {
    const matchesBodyPart = !bodyPart || 
                           bodyPart === 'all_body_parts' || 
                           exercise.bodyPart === bodyPart;
                           
    const matchesEquipment = !equipment || 
                            equipment === 'all_equipment' || 
                            exercise.equipment === equipment;
                            
    const matchesTarget = !target || 
                         target === 'all_targets' || 
                         exercise.target === target;
                         
    const matchesSearch = !searchTerm || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBodyPart && matchesEquipment && matchesTarget && matchesSearch;
  });
} 