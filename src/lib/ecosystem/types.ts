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
