/**
 * Schemas de validação para perfis de usuário
 */

import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999')
    .optional()
    .or(z.literal('')),
  age: z.number()
    .int('Idade deve ser um número inteiro')
    .min(10, 'Idade mínima: 10 anos')
    .max(100, 'Idade máxima: 100 anos')
    .optional(),
  height: z.number()
    .min(100, 'Altura mínima: 100cm')
    .max(250, 'Altura máxima: 250cm')
    .optional(),
  weight: z.number()
    .min(30, 'Peso mínimo: 30kg')
    .max(300, 'Peso máximo: 300kg')
    .optional(),
  gender: z.enum(['masculino', 'feminino', 'outro'])
    .optional(),
  experience_level: z.enum(['iniciante', 'intermediario', 'avancado'])
    .optional(),
  primary_goal: z.enum(['hipertrofia', 'forca', 'potencia', 'resistencia', 'perda-peso'])
    .optional(),
  training_environment: z.enum(['academia', 'casa', 'ar-livre', 'misto'])
    .optional(),
  injuries_limitations: z.string()
    .max(1000, 'Limitações devem ter no máximo 1000 caracteres')
    .optional()
});

export const userSettingsSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  phone: z.string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  age: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 10 && Number(val) <= 100), 
      'Idade deve estar entre 10 e 100 anos')
    .optional(),
  height: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 100 && Number(val) <= 250), 
      'Altura deve estar entre 100 e 250cm')
    .optional(),
  weight: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 30 && Number(val) <= 300), 
      'Peso deve estar entre 30 e 300kg')
    .optional(),
  primaryGoal: z.enum(['hipertrofia', 'perda-peso', 'forca', 'resistencia', 'condicionamento'])
    .optional()
    .or(z.literal('')),
  experienceLevel: z.enum(['iniciante', 'intermediario', 'avancado'])
    .optional()
    .or(z.literal('')),
  trainingEnvironment: z.enum(['academia', 'casa', 'parque', 'misto'])
    .optional()
    .or(z.literal('')),
  injuriesLimitations: z.string()
    .max(1000, 'Limitações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal(''))
});

export type UserProfileData = z.infer<typeof userProfileSchema>;
export type UserSettingsData = z.infer<typeof userSettingsSchema>;