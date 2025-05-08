// src/types/member.ts
import { z } from "zod"

export const memberSchema = z.object({
  id: z.number().or(z.string()).transform((val) => Number(val)).optional(),
  member_id: z.number().optional(),
  name: z.string(),
  email: z.string().nullable(),
  gender: z.string(),
  phoneNumber: z.string(),
  emergencyContact: z.string().nullable(),
  healthInfo: z.string().nullable(),
  activityLevel: z.string(),
  trainer: z.string().default("Assign trainer"),
  trainer_id: z.number().nullable().optional(),
})

export type Member = z.infer<typeof memberSchema>  