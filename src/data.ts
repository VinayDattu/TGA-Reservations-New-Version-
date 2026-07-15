import { Room, Reservation } from './types';

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

export const SETUP_TYPES = [
  "Theater (chairs only)",
  "Pods (tables w/ chairs all around)",
  "Classroom (tables w/chairs facing front)",
  "Breakfast/Lunch (rows of tables w/ chairs on both sides)",
  "Other (explain below)"
];

export const TIME_SLOTS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM"
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: '1', confirmationNumber: 'SEN-123456', department: 'Senate', room: 'Senate Hearing Room I', date: '2026-07-10', time: '10:00 AM', groupName: 'Finance Committee', status: 'Confirmed' },
  { id: '2', confirmationNumber: 'HOU-654321', department: 'House', room: 'Conference Room 4B', date: '2026-07-11', time: '01:00 PM', groupName: 'Education Sub-committee', status: 'Pending' },
  { id: '3', confirmationNumber: 'JOU-111222', department: 'Joint', room: 'Conference Room 8C', date: '2026-07-12', time: '09:00 AM', groupName: 'Joint Budget Review', status: 'Confirmed' },
  { id: '4', confirmationNumber: 'SEN-987654', department: 'Senate', room: 'Conference Room 7A', date: '2026-07-15', time: '02:00 PM', groupName: 'Ethics Committee', status: 'Pending' },
  { id: '5', confirmationNumber: 'HOU-456789', department: 'House', room: 'House Hearing Room I', date: '2026-07-18', time: '10:00 AM', groupName: 'Transportation & Infrastructure', status: 'Confirmed' },
];
