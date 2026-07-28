/**
 * Setup Type Constants
 */

export const SETUP_TYPES = [
  "Theater (chairs only)",
  "Pods (tables w/ chairs all around)",
  "Classroom (tables w/chairs facing front)",
  "Breakfast/Lunch (rows of tables w/ chairs on both sides)",
  "Other (explain below)"
] as const;

export type SetupType = typeof SETUP_TYPES[number];
