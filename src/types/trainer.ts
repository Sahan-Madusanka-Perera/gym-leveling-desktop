import { z } from "zod"

// Define schema based on your Supabase Trainer table
// ID should be trainer_id based on our investigation
export const trainerSchema = z.object({
  // Make id optional with .optional() for new trainer creation
  id: z.number().optional(),
  // Make trainer_id optional with .optional() for new trainer creation
  trainer_id: z.number().optional(),
  name: z.string(),
  specialization: z.string().nullable(),
  contact: z.string().nullable(),
})

// Define extended schema that allows string IDs (for temporary IDs)
export const extendedTrainerSchema = z.object({
  id: z.union([z.number(), z.string()]),
  trainer_id: z.number().optional(),
  name: z.string(),
  specialization: z.string().nullable(),
  contact: z.string().nullable(),
})

export type Trainer = z.infer<typeof trainerSchema>
export type TrainerWithTempId = z.infer<typeof extendedTrainerSchema> 