/**
 * Room Data Constants
 */

import { Room } from '@/types';

export const ROOMS_DATA: Record<'Joint' | 'Senate' | 'House', Room[]> = {
  Joint: [
    { name: "Conference Room 8A", capacity: 30 },
    { name: "Conference Room 8B", capacity: 30 },
    { name: "Conference Room 8C", capacity: 80 },
    { name: "Conference Room 8D", capacity: 90 },
    { name: "Conference Room 8E", capacity: 25 },
    { name: "Legislative Lounge", capacity: 70 },
    { name: "Press Conference Room", capacity: 30 },
    { name: "Day on the Hill Table 1", capacity: null },
    { name: "Day on the Hill Table 2", capacity: null },
    { name: "Day on the Hill Table 3", capacity: null },
    { name: "Day on the Hill Table 4", capacity: null },
    { name: "Day on the Hill Table 5", capacity: null },
    { name: "Day on the Hill Table 6", capacity: null },
    { name: "Beth Harwell Plaza", capacity: 100 },
  ],
  Senate: [
    { name: "Conference Room 7A", capacity: 15 },
    { name: "Conference Room 7B", capacity: 10 },
    { name: "Conference Room 7C", capacity: 10 },
    { name: "Conference Room 7D", capacity: 10 },
    { name: "Senate Hearing Room I", capacity: 199 },
    { name: "Senate Hearing Room II", capacity: 122 },
    { name: "Senate Chamber (Floor)", capacity: 166 },
    { name: "Senate Chamber (Gallery)", capacity: 101 },
    { name: "Conference Room F", capacity: 14 },
  ],
  House: [
    { name: "Conference Room 4B", capacity: 10 },
    { name: "Conference Room 5B", capacity: 8 },
    { name: "Conference Room 5C", capacity: 36 },
    { name: "Conference Room 5E", capacity: 4 },
    { name: "Conference Room 5F", capacity: 10 },
    { name: "Conference Room 5G", capacity: 6 },
    { name: "Conference Room 5H", capacity: 14 },
    { name: "Conference Room 5I", capacity: 12 },
    { name: "Conference Room 6B", capacity: 16 },
    { name: "Conference Room 6C", capacity: 7 },
    { name: "Conference Room 6D", capacity: 10 },
    { name: "House Hearing Room I", capacity: 180 },
    { name: "House Hearing Room II", capacity: 97 },
    { name: "House Hearing Room III", capacity: 147 },
    { name: "House Hearing Room IV", capacity: 76 },
    { name: "House Hearing Room V", capacity: 77 },
    { name: "House Chamber (Floor)", capacity: 100 },
    { name: "House Chamber (Gallery)", capacity: 248 },
  ]
};

export const getAllRooms = () => [
  ...ROOMS_DATA.Joint.map(r => ({ ...r, department: 'Joint' as const })),
  ...ROOMS_DATA.Senate.map(r => ({ ...r, department: 'Senate' as const })),
  ...ROOMS_DATA.House.map(r => ({ ...r, department: 'House' as const })),
];
