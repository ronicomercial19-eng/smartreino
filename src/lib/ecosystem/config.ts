/**
 * 9FIT Ecosystem Configuration
 * 
 * Controls how this module connects to the central ecosystem.
 * Reads config from `ecosystem_config` table when available,
 * falls back to hardcoded defaults in standalone mode.
 */
import { supabase } from "@/lib/api/client";

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

// Default: standalone mode
const defaultConfig: EcosystemConfig = {
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

let cachedConfig: EcosystemConfig | null = null;

/** Load config from ecosystem_config table, merge with defaults */
export async function loadEcosystemConfig(): Promise<EcosystemConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const { data, error } = await supabase
      .from('ecosystem_config' as any)
      .select('config_key, config_value')
      .eq('module_id', 'smartreino');

    if (error || !data?.length) {
      cachedConfig = { ...defaultConfig };
      return cachedConfig;
    }

    const configMap = Object.fromEntries(
      data.map((row: any) => [row.config_key, row.config_value])
    );

    const moduleInfo = configMap.module_info || {};
    const ecosystemMode = configMap.ecosystem_mode || {};
    const features = configMap.features || defaultConfig.features;

    cachedConfig = {
      mode: ecosystemMode.mode || 'standalone',
      moduleId: 'smartreino',
      moduleVersion: moduleInfo.version || '1.0.0',
      moduleName: moduleInfo.name || 'SmartReino',
      features: {
        centralAuth: features.centralAuth ?? false,
        centralAnalytics: features.centralAnalytics ?? false,
        centralStorage: features.centralStorage ?? false,
        crossModuleEvents: features.crossModuleEvents ?? false,
      },
    };

    return cachedConfig;
  } catch {
    cachedConfig = { ...defaultConfig };
    return cachedConfig;
  }
}

/** Sync getter — returns cached or default */
export function getEcosystemConfig(): EcosystemConfig {
  return cachedConfig || { ...defaultConfig };
}

export function isConnectedMode(): boolean {
  return getEcosystemConfig().mode === 'connected';
}

export function getModuleId(): string {
  return getEcosystemConfig().moduleId;
}

/** Invalidate cache (call after config update) */
export function resetConfigCache(): void {
  cachedConfig = null;
}
