/**
 * 9FIT API Facade
 * 
 * Single entry point for all domain services.
 * Usage: import { api } from '@/services/api';
 *        api.users.getCurrentUser();
 *        api.training.generateWorkout({...});
 */
import { usersService } from './domains/users';
import { trainingService } from './domains/training';
import { assessmentsService } from './domains/assessments';
import { progressService } from './domains/progress';
import { analyticsService } from './domains/analytics';
import { systemService } from './domains/system';

export const api = {
  users: usersService,
  training: trainingService,
  assessments: assessmentsService,
  progress: progressService,
  analytics: analyticsService,
  system: systemService,
} as const;

// Re-export individual services for granular imports
export { usersService } from './domains/users';
export { trainingService } from './domains/training';
export { assessmentsService } from './domains/assessments';
export { progressService } from './domains/progress';
export { analyticsService } from './domains/analytics';
export { systemService } from './domains/system';

// Re-export types
export type { UserProfile } from './domains/users';
export type { WorkoutPlan, WorkoutGenerationParams, FullPlanGenerationParams } from './domains/training';
export type { Assessment } from './domains/assessments';
export type { WorkoutLog } from './domains/progress';
export type { AIRecommendation } from './domains/analytics';
