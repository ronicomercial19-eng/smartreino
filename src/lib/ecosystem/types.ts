/**
 * 9FIT Ecosystem Shared Types
 * 
 * Types used across the ecosystem for inter-module communication.
 * These define the "contract" other modules can rely on.
 */

/** Standardized user representation across the ecosystem */
export interface EcosystemUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'professor' | 'student' | 'user';
  moduleAccess: string[]; // e.g., ['smartreino', 'nutrition', 'analytics']
}

/** Standardized student representation */
export interface EcosystemStudent {
  id: string;
  name: string;
  email?: string;
  coachId: string;
  goals: string[];
  experienceLevel: string;
  status: 'active' | 'inactive' | 'suspended';
}

/** API response envelope — standard across all modules */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    module: string;
    version: string;
    timestamp: string;
  };
}

/** Data domain identifiers used in the ecosystem */
export type DataDomain =
  | 'users'
  | 'training'
  | 'assessments'
  | 'progress'
  | 'content'
  | 'commerce'
  | 'analytics'
  | 'system';

/** Module registration descriptor — used when connecting to central platform */
export interface ModuleDescriptor {
  moduleId: string;
  moduleName: string;
  version: string;
  domains: DataDomain[];
  canonicalViews: string[];
  apiRoutes: string[];
  webhookEvents: string[];
}

/** SmartReino module descriptor */
export const SMARTREINO_DESCRIPTOR: ModuleDescriptor = {
  moduleId: 'smartreino',
  moduleName: 'SmartReino — Gestão de Treinos',
  version: '1.0.0',
  domains: ['users', 'training', 'assessments', 'progress', 'content', 'analytics', 'system'],
  canonicalViews: [
    'v_students_canonical',
    'v_assessments_canonical',
    'v_assignments_canonical',
    'v_periodizations_canonical',
    'v_exercises_canonical',
    'v_workouts_canonical',
    'v_progress_canonical',
    'v_plans_canonical',
  ],
  apiRoutes: [
    '/api/v1/training/generate',
    '/api/v1/training/modify',
    '/api/v1/training/full-plan',
    '/api/v1/analytics/recommend',
    '/api/v1/assessments/analyze',
    '/api/v1/health',
    '/api/v1/routes',
  ],
  webhookEvents: [
    'workout_created',
    'workout_modified',
    'workout_completed',
    'student_enrolled',
    'student_updated',
    'assessment_created',
    'plan_generated',
    'recommendation_generated',
  ],
};
