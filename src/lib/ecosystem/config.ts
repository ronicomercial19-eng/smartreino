/**
 * 9FIT Ecosystem Configuration
 * 
 * Controls how this module connects to the central ecosystem.
 * In 'standalone' mode, operates independently.
 * In 'connected' mode, integrates with central 9FIT infrastructure.
 */

export type EcosystemMode = 'standalone' | 'connected';

export interface EcosystemConfig {
  mode: EcosystemMode;
  moduleId: string;
  moduleVersion: string;
  moduleName: string;
  centralDbUrl?: string;
  centralApiUrl?: string;
  features: {
    centralAuth: boolean;
    centralAnalytics: boolean;
    centralStorage: boolean;
    crossModuleEvents: boolean;
  };
}

// Default: standalone mode (no central connection)
const config: EcosystemConfig = {
  mode: 'standalone',
  moduleId: 'smartreino',
  moduleVersion: '1.0.0',
  moduleName: 'SmartReino — Gestão de Treinos',
  features: {
    centralAuth: false,
    centralAnalytics: false,
    centralStorage: false,
    crossModuleEvents: false,
  },
};

export function getEcosystemConfig(): EcosystemConfig {
  return { ...config };
}

export function isConnectedMode(): boolean {
  return config.mode === 'connected';
}

export function getModuleId(): string {
  return config.moduleId;
}
