/**
 * Constantes da aplicação
 */

export const APP_CONFIG = {
  name: 'TrainSync',
  version: '2.0.0',
  description: 'Sistema de Periodização Inteligente',
  author: 'TrainSync Team'
};

export const ROUTES = {
  dashboard: '/dashboard',
  students: '/admin-students',
  exercises: '/exercise-library',
  workouts: '/workout-models',
  periodization: '/periodization-upload',
  profile: '/profile',
  settings: '/settings'
} as const;

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizes: [5, 10, 20, 50, 100]
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;