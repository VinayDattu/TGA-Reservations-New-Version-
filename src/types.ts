export type Department = 'Joint' | 'Senate' | 'House' | '';

export type DepartmentType = 'LIS' | 'AV' | 'Facilities' | 'Security' | 'Catering' | 'Other';

export interface DepartmentTask {
  id: string;
  departmentType: DepartmentType;
  instructions: string;
}

export interface Room {
  name: string;
  capacity: number | null;
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  department: string;
  room: string;
  date: string;
  time: string;
  groupName: string;
  status: 'Confirmed' | 'Pending';
  
  // Detailed fields for persistence and editing
  memberSponsor?: string;
  attendeeCount?: number | '';
  schedulingContactName?: string;
  schedulingContactNumber?: string;
  schedulingContactEmail?: string;
  onSiteContactName?: string;
  onSiteContactNumber?: string;
  onSiteContactEmail?: string;
  needsAV?: boolean;
  avNotes?: string;
  needsSecurity?: boolean;
  securityNotes?: string;
  needsCatering?: boolean;
  cateringNotes?: string;
  needsFacilities?: boolean;
  facilitiesNotes?: string;
  needsSetup?: boolean;
  setupType?: string[];
  additionalDetails?: string;
  departmentTasks?: DepartmentTask[];
  attachments?: { name: string; url: string; size: number }[];
}

export interface ReservationFormData {
  department: Department;
  memberSponsor: string;
  groupName: string;
  attendeeCount: number | '';
  
  schedulingContactName: string;
  schedulingContactNumber: string;
  schedulingContactEmail: string;
  
  onSiteContactName: string;
  onSiteContactNumber: string;
  onSiteContactEmail: string;
  
  requestedDate: string;
  requestedTime: string;
  room: string;
  
  needsAV: boolean;
  avNotes: string;
  needsSecurity: boolean;
  securityNotes: string;
  needsCatering: boolean;
  cateringNotes: string;
  needsFacilities: boolean;
  facilitiesNotes: string;
  needsSetup: boolean;
  setupType: string[];
  
  additionalDetails: string;
  departmentTasks: DepartmentTask[];
  attachments: { name: string; url: string; size: number }[];
}

export interface Draft {
  id: string;
  updatedAt: string;
  formData: ReservationFormData;
}

