/**
 * LocalStorage Keys
 * Centralized constants for localStorage keys to avoid typos
 */

export const STORAGE_KEYS = {
  RESERVATIONS: 'tnga_reservations',
  DRAFTS: 'tnga_drafts',
  THEME: 'tnga_theme',
  
  // Dashboard state
  DASHBOARD_ROLE: 'tnga_dash_role',
  DASHBOARD_SENSORS: 'tnga_dash_sensors',
  DASHBOARD_CHECKED_IN: 'tnga_dash_checked_in',
  DASHBOARD_MAINTENANCE: 'tnga_dash_maintenance',
  DASHBOARD_CANCELS_COUNT: 'tnga_dash_cancels_count',
  
  // Calendar state
  CALENDAR_ROOM_COLORS: 'tnga_calendar_room_colors',
  CALENDAR_HIDDEN_ROOMS: 'tnga_calendar_hidden_rooms',
} as const;

export default STORAGE_KEYS;
