/**
 * Environment Configuration
 * Centralizes all environment variables and app configuration
 */

// Safe access to environment variables
function getEnvVar(key: string, defaultValue: string = ''): string {
  // Check if running in Vite environment
  if (typeof window !== 'undefined' && (window as any).__VITE_ENV__) {
    return (window as any).__VITE_ENV__[key] || defaultValue;
  }
  
  // Try to access import.meta.env safely
  try {
    // @ts-ignore - Vite injects this at build time
    if (import.meta?.env?.[key] !== undefined) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {
    // Fallback if import.meta is not available
  }
  
  return defaultValue;
}

function isDev(): boolean {
  try {
    // @ts-ignore
    return import.meta?.env?.DEV === true;
  } catch {
    return false;
  }
}

function isProd(): boolean {
  try {
    // @ts-ignore
    return import.meta?.env?.PROD === true;
  } catch {
    return false;
  }
}

export const ENV = {
  // API Configuration
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3001/api'),
  API_TIMEOUT: 30000, // 30 seconds
  
  // App Mode
  IS_DEV: isDev(),
  IS_PROD: isProd(),
  IS_MOCK: getEnvVar('VITE_USE_MOCK_DATA', 'true') !== 'false', // Use mock by default
  
  // Features Flags
  ENABLE_AUTH: getEnvVar('VITE_ENABLE_AUTH') === 'true',
  ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS') === 'true',
  
  // App Info
  APP_NAME: 'TNGA Reservation System',
  APP_VERSION: '1.0.0',
} as const;

export default ENV;
