/**
 * Mock Reservation Data
 * Used for development and testing
 */

import { Reservation } from '@/types';

export const MOCK_RESERVATIONS: Reservation[] = [
  { 
    id: '1', 
    confirmationNumber: 'SEN-123456', 
    department: 'Senate', 
    room: 'Senate Hearing Room I', 
    date: '2026-07-10', 
    time: '10:00 AM', 
    groupName: 'Finance Committee', 
    status: 'Confirmed' 
  },
  { 
    id: '2', 
    confirmationNumber: 'HOU-654321', 
    department: 'House', 
    room: 'Conference Room 4B', 
    date: '2026-07-11', 
    time: '01:00 PM', 
    groupName: 'Education Sub-committee', 
    status: 'Pending' 
  },
  { 
    id: '3', 
    confirmationNumber: 'JOU-111222', 
    department: 'Joint', 
    room: 'Conference Room 8C', 
    date: '2026-07-12', 
    time: '09:00 AM', 
    groupName: 'Joint Budget Review', 
    status: 'Confirmed' 
  },
  { 
    id: '4', 
    confirmationNumber: 'SEN-987654', 
    department: 'Senate', 
    room: 'Conference Room 7A', 
    date: '2026-07-15', 
    time: '02:00 PM', 
    groupName: 'Ethics Committee', 
    status: 'Pending' 
  },
  { 
    id: '5', 
    confirmationNumber: 'HOU-456789', 
    department: 'House', 
    room: 'House Hearing Room I', 
    date: '2026-07-18', 
    time: '10:00 AM', 
    groupName: 'Transportation & Infrastructure', 
    status: 'Confirmed' 
  },
];
