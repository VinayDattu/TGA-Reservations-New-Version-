# Business Requirements Document (BRD)
## Tennessee General Assembly (TNGA) Room Reservation & Routing System

### 1. Executive Summary
The TNGA Room Reservation System is a comprehensive web-based application designed to streamline the scheduling, coordination, and management of legislative rooms and spaces (Chambers, Hearing Rooms, Conference Rooms, Plazas, etc.) for the Joint, Senate, and House departments. It serves as a centralized hub for booking logistics, ancillary service requests, and inter-departmental communication.

### 2. Business Objectives
- **Centralize Booking Management:** Provide a unified platform for tracking all room reservations across the legislative complex.
- **Streamline Ancillary Services:** Facilitate clear communication with support departments (LIS, AV, Facilities, Security, Catering) through dedicated task delegation and routing sheets.
- **Enhance Visibility:** Offer diverse views (Dashboard, List, Calendar) to allow reservation agents to anticipate demand, manage bottlenecks, and avoid scheduling conflicts.
- **Standardize Documentation:** Automate the generation of confirmation documents, routing sheets, and exportable reports (PDF, Word Doc) for record-keeping and on-site event management.

### 3. Core Functional Requirements

#### 3.1. Reservation Management (Booking Engine)
- **Sponsorship & Event Details:** Capture primary event data including Sponsoring Department, Member Sponsor, Attendee Count, and Official Group Name.
- **Contact Information:** Record both Scheduling Contact and On-Site Day-of Contact details, with an option to link them.
- **Logistics & Scheduling:** Select Date, Time (30-minute intervals), and Room (filtered dynamically based on the selected Department).
- **Setup Configuration:** Allow users to specify custom room arrangements (e.g., U-Shape, Classroom, Banquet) and provide additional detailed instructions if "Other" is selected.

#### 3.2. Inter-Departmental Task Delegation
- **Task Assignment:** Ability to assign specific instructions to specialized support departments (LIS, AV, Facilities, Security, Catering, Other).
- **Routing Sheets:** Dynamically generate printable routing sheets tailored for selected departments to fulfill specific event needs.

#### 3.3. File & Attachment Handling
- **Document Uploads:** Support uploading supplemental files (PDF, DOCX, JPG, PNG) attached directly to the reservation.

#### 3.4. Views & Dashboards
- **Dashboard View:**
  - Real-time overview of active, pending, and draft reservations.
  - Short-term facility trend analysis (e.g., Peak Booking Slots Heatmap, Most Demanded Rooms).
- **List View:**
  - Searchable, tabular directory of all reservations filtered by Confirmation Number, Room, or Group.
- **Calendar View:**
  - Visual calendar interface displaying bookings by date and time to easily spot overlapping schedules or available slots.

#### 3.5. Reporting & Exporting
- **Print / PDF Generation:** Create standardized PDF routing sheets and reservation summaries.
- **Word Document Export:** Generate `.doc` files containing comprehensive reservation details for offline editing or archival.

### 4. User Roles 
- **Reservation Agent (Admin):** Has full access to create, edit, approve, and manage all bookings and inter-departmental tasks.
- **Viewer (Read-Only):** Can view the dashboard, calendar, and list of reservations without modification privileges.

### 5. Non-Functional Requirements
- **Responsive Design:** Must function seamlessly on desktop displays, prioritizing high-density information layouts.
- **Performance:** Asynchronous computation for trend analysis to avoid blocking the user interface during heavy data loads.
- **Accessibility & Usability:** Clean, high-contrast interface using modern design principles to minimize training time for legislative staff.

### 6. Future Enhancements 
- Integration with external calendar systems (e.g., Outlook/Exchange).
- Automated email notifications for confirmation and departmental task assignment.
- Real-time conflict resolution and double-booking prevention logic.
