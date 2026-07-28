/**
 * Department Constants
 */

export const DEPARTMENTS = {
  JOINT: 'Joint',
  SENATE: 'Senate',
  HOUSE: 'House',
} as const;

export const DEPARTMENT_OPTIONS = [
  { value: 'Joint', label: 'Joint' },
  { value: 'Senate', label: 'Senate' },
  { value: 'House', label: 'House' },
] as const;

export const DEPARTMENT_TYPES = {
  LIS: 'LIS',
  AV: 'AV',
  FACILITIES: 'Facilities',
  SECURITY: 'Security',
  CATERING: 'Catering',
  OTHER: 'Other',
} as const;

export const CONFIRMATION_PREFIXES = {
  Joint: 'JOU',
  Senate: 'SEN',
  House: 'HOU',
} as const;
