export interface Exercise {
  id: string;
  gifUrl: string;
  bodyPart: string;
  equipment: string;
  name: string;
  target: string;
  description: string;
}

export type BodyPart = 'waist' | 'back' | 'chest' | 'upper arms' | 'upper legs' | 'lower legs' | 'shoulders' | 'cardio' | 'lower arms' | 'neck';
export type Equipment = 'body weight' | 'cable' | 'dumbbell' | 'barbell' | 'leverage machine' | 'assisted' | 'medicine ball' | 'band' | 'kettlebell' | 'smith machine';
export type Target = 'abs' | 'lats' | 'pectorals' | 'triceps' | 'quads' | 'hamstrings' | 'biceps' | 'delts' | 'cardiovascular system' | 'forearms' | 'calves' | 'traps'; 