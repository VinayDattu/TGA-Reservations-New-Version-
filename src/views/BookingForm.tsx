import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Printer, FileText, ArrowLeft, X, Plus, Upload, Paperclip, Trash2, Eye } from 'lucide-react';
import { ReservationFormData, Reservation, Department, Draft, DepartmentType, DepartmentTask } from '../types';
import { ROOMS_DATA, SETUP_TYPES, TIME_SLOTS } from '../data';
import { Input, Select, Checkbox, Textarea } from '../components/FormControls';

interface BookingFormProps {
  reservations: Reservation[];
  onSaveReservation: (res: Reservation) => void;
  editingReservationId: string | null;
  prefilledDate: string | null;
  prefilledRoom?: string | null;
  prefilledTime?: string | null;
  onCancelEdit: () => void;
  activeDraftId: string | null;
  drafts: Draft[];
  onSaveDraft: (draftId: string, formData: ReservationFormData) => void;
  onDeleteDraft: (draftId: string) => void;
  onTriggerPrint?: (view: 'book', details?: { id?: string; draftId?: string; printSummary?: boolean }) => void;
}

const INITIAL_STATE: ReservationFormData = {
  department: '', memberSponsor: '', groupName: '', attendeeCount: '',
  schedulingContactName: '', schedulingContactNumber: '', schedulingContactEmail: '',
  onSiteContactName: '', onSiteContactNumber: '', onSiteContactEmail: '',
  requestedDate: '', requestedTime: '', room: '',
  needsAV: false, avNotes: '',
  needsSecurity: false, securityNotes: '',
  needsCatering: false, cateringNotes: '',
  needsFacilities: false, facilitiesNotes: '',
  needsSetup: false, setupType: [], setupNotes: '', additionalDetails: '',
  departmentTasks: [], attachments: []
};

const mapReservationToFormData = (res: Reservation): ReservationFormData => {
  return {
    department: res.department as Department,
    memberSponsor: res.memberSponsor || '',
    groupName: res.groupName,
    attendeeCount: res.attendeeCount || '',
    schedulingContactName: res.schedulingContactName || '',
    schedulingContactNumber: res.schedulingContactNumber || '',
    schedulingContactEmail: res.schedulingContactEmail || '',
    onSiteContactName: res.onSiteContactName || '',
    onSiteContactNumber: res.onSiteContactNumber || '',
    onSiteContactEmail: res.onSiteContactEmail || '',
    requestedDate: res.date,
    requestedTime: res.time,
    room: res.room,
    needsAV: res.needsAV || false,
    avNotes: res.avNotes || '',
    needsSecurity: res.needsSecurity || false,
    securityNotes: res.securityNotes || '',
    needsCatering: res.needsCatering || false,
    cateringNotes: res.cateringNotes || '',
    needsFacilities: res.needsFacilities || false,
    facilitiesNotes: res.facilitiesNotes || '',
    needsSetup: res.needsSetup || false,
    setupType: res.setupType || [],
    setupNotes: res.setupNotes || '',
    additionalDetails: res.additionalDetails || '',
    departmentTasks: res.departmentTasks || [],
    attachments: res.attachments || [],
  };
};

const getDepartmentOfRoom = (roomName: string): Department => {
  if (ROOMS_DATA.Joint.some(r => r.name === roomName)) return 'Joint';
  if (ROOMS_DATA.Senate.some(r => r.name === roomName)) return 'Senate';
  if (ROOMS_DATA.House.some(r => r.name === roomName)) return 'House';
  return '';
};

export default function BookingForm({ 
  reservations, 
  onSaveReservation, 
  editingReservationId, 
  prefilledDate, 
  prefilledRoom,
  prefilledTime,
  onCancelEdit,
  activeDraftId,
  drafts,
  onSaveDraft,
  onDeleteDraft,
  onTriggerPrint
}: BookingFormProps) {
  const [formData, setFormData] = useState<ReservationFormData>(INITIAL_STATE);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useSameContact, setUseSameContact] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  const [conflictError, setConflictError] = useState<string | null>(null);

  const [showPrintSummary, setShowPrintSummary] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('printSummary') === 'true';
  });
  const [selectedPrintDepts, setSelectedPrintDepts] = useState<DepartmentType[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskDept, setSelectedTaskDept] = useState<DepartmentType | ''>('');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const departmentTypes: DepartmentType[] = ['LIS', 'AV', 'Facilities', 'Security', 'Catering', 'Other'];

  const lastLoadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (showPrintSummary && formData.departmentTasks) {
      setSelectedPrintDepts(formData.departmentTasks.map(t => t.departmentType));
    }
  }, [showPrintSummary]);

  useEffect(() => {
    if (!showPrintSummary) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrintSummary]);

  useEffect(() => {
    const currentId = editingReservationId || activeDraftId || 'new';
    if (lastLoadedIdRef.current === currentId) {
      return;
    }
    lastLoadedIdRef.current = currentId;

    if (editingReservationId) {
      const existing = reservations.find(r => r.id === editingReservationId);
      if (existing) {
        setFormData(mapReservationToFormData(existing));
        setConfirmationNumber(existing.confirmationNumber);
        setIsSubmitted(false);
        setUseSameContact(
          existing.schedulingContactEmail === existing.onSiteContactEmail &&
          existing.schedulingContactEmail !== ''
        );
      }
    } else if (activeDraftId) {
      const existingDraft = drafts.find(d => d.id === activeDraftId);
      if (existingDraft) {
        setFormData(existingDraft.formData);
        setConfirmationNumber('');
        setIsSubmitted(false);
        setUseSameContact(
          existingDraft.formData.schedulingContactEmail === existingDraft.formData.onSiteContactEmail &&
          existingDraft.formData.schedulingContactEmail !== ''
        );
      } else {
        setFormData({
          ...INITIAL_STATE,
          requestedDate: prefilledDate || '',
          room: prefilledRoom || '',
          requestedTime: prefilledTime || '',
          department: prefilledRoom ? getDepartmentOfRoom(prefilledRoom) : '',
        });
        setConfirmationNumber('');
        setIsSubmitted(false);
        setUseSameContact(false);
      }
    } else {
      setFormData({
        ...INITIAL_STATE,
        requestedDate: prefilledDate || '',
        room: prefilledRoom || '',
        requestedTime: prefilledTime || '',
        department: prefilledRoom ? getDepartmentOfRoom(prefilledRoom) : '',
      });
      setConfirmationNumber('');
      setIsSubmitted(false);
      setUseSameContact(false);
    }
  }, [editingReservationId, activeDraftId, prefilledDate, prefilledRoom, prefilledTime, reservations, drafts]);

  useEffect(() => {
    if (!editingReservationId && activeDraftId) {
      const existingDraft = drafts.find(d => d.id === activeDraftId);
      let hasChanged = false;

      if (!existingDraft) {
        hasChanged = Object.keys(formData).some(key => {
          if (key === 'departmentTasks') {
            const val = formData.departmentTasks || [];
            return val.length > 0;
          }
          const val = formData[key as keyof ReservationFormData];
          const initialVal = INITIAL_STATE[key as keyof ReservationFormData];
          return val !== initialVal;
        });
      } else {
        hasChanged = Object.keys(formData).some(key => {
          if (key === 'departmentTasks') {
            const currentTasks = formData.departmentTasks || [];
            const draftTasks = existingDraft.formData.departmentTasks || [];
            if (currentTasks.length !== draftTasks.length) return true;
            return currentTasks.some((task, idx) => {
              const dTask = draftTasks[idx];
              return !dTask || task.departmentType !== dTask.departmentType || task.instructions !== dTask.instructions;
            });
          }
          const val = formData[key as keyof ReservationFormData];
          const draftVal = existingDraft.formData[key as keyof ReservationFormData];
          return val !== draftVal;
        });
      }

      if (hasChanged) {
        onSaveDraft(activeDraftId, formData);
      }
    }
  }, [formData, activeDraftId, editingReservationId, onSaveDraft, drafts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newFiles]
      }));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => {
      const newAttachments = [...(prev.attachments || [])];
      newAttachments.splice(index, 1);
      return { ...prev, attachments: newAttachments };
    });
  };

  const handlePrintPDF = () => {
    if (onTriggerPrint) {
      onTriggerPrint('book', {
        id: editingReservationId || undefined,
        draftId: activeDraftId || undefined,
        printSummary: showPrintSummary
      });
    } else {
      window.print();
    }
  };

  const handleExportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const content = `
      <h1>Reservation Confirmation</h1>
      <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
      <p><strong>Department:</strong> ${formData.department}</p>
      <p><strong>Room:</strong> ${formData.room}</p>
      <p><strong>Date:</strong> ${formData.requestedDate}</p>
      <p><strong>Time:</strong> ${formData.requestedTime}</p>
      <p><strong>Group Name:</strong> ${formData.groupName}</p>
      ${formData.needsAV ? `<p><strong>AV Notes:</strong> ${formData.avNotes}</p>` : ''}
      ${formData.needsSecurity ? `<p><strong>Security Notes:</strong> ${formData.securityNotes}</p>` : ''}
      ${formData.needsCatering ? `<p><strong>Catering Notes:</strong> ${formData.cateringNotes}</p>` : ''}
      ${formData.needsFacilities ? `<p><strong>Facilities Notes:</strong> ${formData.facilitiesNotes}</p>` : ''}
      ${formData.needsSetup ? `<p><strong>Setup Types:</strong> ${formData.setupType.join(', ')}</p>` : ''}
      ${formData.needsSetup && formData.setupNotes ? `<p><strong>Setup Notes:</strong> ${formData.setupNotes}</p>` : ''}
      ${formData.attachments && formData.attachments.length > 0 ? `
        <h3>Attachments</h3>
        <ul>
          ${formData.attachments.map(file => `<li>${file.name} (${(file.size / 1024).toFixed(1)} KB)</li>`).join('')}
        </ul>
      ` : ''}
    `;
    const sourceHTML = header + content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Reservation_${confirmationNumber}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrintNotes = (type: string, notes: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ${type} Notes</title>
            <style>
              body { font-family: 'Aptos', sans-serif; padding: 20px; line-height: 1.5; color: #0f172a; }
              h1 { font-size: 1.25rem; margin-bottom: 20px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              p { white-space: pre-wrap; font-size: 0.875rem; }
              .meta { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${type} Notes</h1>
            <div class="meta">
              <strong>Group:</strong> ${formData.groupName || 'Unspecified'} | 
              <strong>Date:</strong> ${formData.requestedDate || 'Unspecified'} | 
              <strong>Room:</strong> ${formData.room || 'Unspecified'}
            </div>
            <p>${notes || 'No notes provided.'}</p>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleInputChange = (field: keyof ReservationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSameContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseSameContact(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        onSiteContactName: prev.schedulingContactName,
        onSiteContactNumber: prev.schedulingContactNumber,
        onSiteContactEmail: prev.schedulingContactEmail,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        onSiteContactName: '', onSiteContactNumber: '', onSiteContactEmail: '',
      }));
    }
  };

  const handleSchedulingContactChange = (field: 'schedulingContactName' | 'schedulingContactNumber' | 'schedulingContactEmail', value: string) => {
    setFormData(prev => {
      const updates: Partial<ReservationFormData> = { [field]: value };
      if (useSameContact) {
        if (field === 'schedulingContactName') updates.onSiteContactName = value;
        if (field === 'schedulingContactNumber') updates.onSiteContactNumber = value;
        if (field === 'schedulingContactEmail') updates.onSiteContactEmail = value;
      }
      return { ...prev, ...updates };
    });
  };

  const handleAddDepartmentTaskClick = (dept: DepartmentType) => {
    const existingTask = formData.departmentTasks?.find(t => t.departmentType === dept);
    if (existingTask) {
      setEditingTaskId(existingTask.id);
      setSelectedTaskDept(dept);
      setTaskInstructions(existingTask.instructions);
    } else {
      setEditingTaskId(null);
      setSelectedTaskDept(dept);
      setTaskInstructions('');
    }
    setIsTaskModalOpen(true);
  };

  const handleEditTaskClick = (task: DepartmentTask) => {
    setEditingTaskId(task.id);
    setSelectedTaskDept(task.departmentType);
    setTaskInstructions(task.instructions);
    setIsTaskModalOpen(true);
  };

  const handleRemoveTask = (taskIdOrDept: string) => {
    const updatedTasks = (formData.departmentTasks || []).filter(
      t => t.id !== taskIdOrDept && t.departmentType !== taskIdOrDept
    );
    handleInputChange('departmentTasks', updatedTasks);
  };

  const handleSaveTask = () => {
    if (!taskInstructions.trim()) {
      if (confirm("No comments entered. Remove this department task?")) {
        if (editingTaskId) {
          handleRemoveTask(editingTaskId);
        }
      }
      setIsTaskModalOpen(false);
      return;
    }

    const updatedTasks = [...(formData.departmentTasks || [])];
    if (editingTaskId) {
      const idx = updatedTasks.findIndex(t => t.id === editingTaskId);
      if (idx > -1) {
        updatedTasks[idx] = {
          ...updatedTasks[idx],
          instructions: taskInstructions
        };
      }
    } else {
      const existingIdx = updatedTasks.findIndex(t => t.departmentType === selectedTaskDept);
      if (existingIdx > -1) {
        updatedTasks[existingIdx] = {
          ...updatedTasks[existingIdx],
          instructions: taskInstructions
        };
      } else {
        updatedTasks.push({
          id: 'task-' + Math.random().toString(36).substring(2, 9),
          departmentType: selectedTaskDept as DepartmentType,
          instructions: taskInstructions
        });
      }
    }

    handleInputChange('departmentTasks', updatedTasks);
    setIsTaskModalOpen(false);
  };

  const departmentOptions = [
    { value: 'Joint', label: 'Joint' }, { value: 'Senate', label: 'Senate' }, { value: 'House', label: 'House' }
  ];
  const timeOptions = TIME_SLOTS.map(t => ({ value: t, label: t }));
  const roomOptions = formData.department 
    ? ROOMS_DATA[formData.department as 'Joint' | 'Senate' | 'House'].map(r => ({
        value: r.name, label: `${r.name}${r.capacity ? ` (Capacity: ${r.capacity})` : ''}`
      }))
    : [];
  const setupOptions = SETUP_TYPES.map(s => ({ value: s, label: s }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    
    // Real-time conflict validation
    const hasConflict = reservations.some(r => {
      // Ignore if editing the same reservation
      if (editingReservationId && r.id === editingReservationId) return false;
      
      // Check for same room, date, and time.
      return r.room === formData.room && 
             r.date === formData.requestedDate && 
             r.time === formData.requestedTime;
    });

    if (hasConflict) {
      setConflictError(`The room "${formData.room}" is already reserved for the chosen date (${formData.requestedDate}) and time slot (${formData.requestedTime}). Please select a different time or room.`);
      return;
    }
    
    const prefix = formData.department === 'Senate' ? 'SEN' : formData.department === 'House' ? 'HOU' : formData.department === 'Joint' ? 'JOU' : 'RES';
    const num = Math.floor(100000 + Math.random() * 900000);
    const confNum = confirmationNumber || `${prefix}-${num}`;
    
    const savedReservation: Reservation = {
      id: editingReservationId || Math.random().toString(36).substring(2, 9),
      confirmationNumber: confNum,
      date: formData.requestedDate,
      time: formData.requestedTime,
      department: formData.department,
      room: formData.room,
      groupName: formData.groupName,
      status: editingReservationId ? (reservations.find(r => r.id === editingReservationId)?.status || 'Confirmed') : 'Confirmed',
      
      memberSponsor: formData.memberSponsor,
      attendeeCount: typeof formData.attendeeCount === 'number' ? formData.attendeeCount : parseInt(formData.attendeeCount) || 0,
      schedulingContactName: formData.schedulingContactName,
      schedulingContactNumber: formData.schedulingContactNumber,
      schedulingContactEmail: formData.schedulingContactEmail,
      onSiteContactName: formData.onSiteContactName,
      onSiteContactNumber: formData.onSiteContactNumber,
      onSiteContactEmail: formData.onSiteContactEmail,
      needsAV: formData.needsAV,
      avNotes: formData.avNotes,
      needsSecurity: formData.needsSecurity,
      securityNotes: formData.securityNotes,
      needsCatering: formData.needsCatering,
      cateringNotes: formData.cateringNotes,
      needsFacilities: formData.needsFacilities,
      facilitiesNotes: formData.facilitiesNotes,
      needsSetup: formData.needsSetup,
      setupType: formData.setupType,
      setupNotes: formData.setupNotes,
      additionalDetails: formData.additionalDetails,
      departmentTasks: formData.departmentTasks || [],
      attachments: formData.attachments || [],
    };

    onSaveReservation(savedReservation);
  };

  if (showPrintSummary) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300 print:p-0">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <button
            type="button"
            onClick={() => setShowPrintSummary(false)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-950 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Booking Form
          </button>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Print Routing Sheets
          </h2>
        </div>

        {/* Two-Column Print Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          
          {/* Left Column: Sidebar Print Filter (print:hidden) */}
          <div className="lg:col-span-4 bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col gap-6 print:hidden">
            <div>
              <h3 className="text-xs font-bold text-primary-950 uppercase tracking-wider mb-2">Print Filter Sidebar</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Select which department task comments to render on the printed document. Toggling checkboxes dynamically updates the preview.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Departments</h4>
              {formData.departmentTasks && formData.departmentTasks.length > 0 ? (
                <div className="space-y-2.5">
                  {formData.departmentTasks.map(task => {
                    const isChecked = selectedPrintDepts.includes(task.departmentType);
                    return (
                      <label key={task.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedPrintDepts(prev => prev.filter(d => d !== task.departmentType));
                            } else {
                              setSelectedPrintDepts(prev => [...prev, task.departmentType]);
                            }
                          }}
                          className="mt-0.5 rounded border-slate-300 text-primary-950 focus:ring-slate-400 accent-slate-900 cursor-pointer w-4 h-4"
                        />
                        <div>
                          <p className="text-xs font-bold text-primary-950 uppercase tracking-wide">{task.departmentType}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{task.instructions}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No departmental tasks have been added to this reservation.</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="button"
                onClick={handlePrintPDF}
                className="w-full flex items-center justify-center gap-2 bg-primary-950 hover:bg-primary-900 text-white rounded font-bold text-xs uppercase tracking-wide py-3 px-4 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Selected Sheets
              </button>
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                Pressing <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px] font-mono">Ctrl+P</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px] font-mono">Cmd+P</kbd> will also print the filtered preview below.
              </p>
            </div>
          </div>

          {/* Right Column: Print Preview Page (print:block print:w-full) */}
          <div className="lg:col-span-8 print:w-full">
            <div 
              id="routing-sheet-print-area"
              className="bg-white border border-slate-200 rounded shadow-md p-8 md:p-12 min-h-[842px] relative print:border-none print:shadow-none print:p-0"
            >
              {/* Executive Template Header */}
              <header className="border-b-4 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-primary-950 tracking-tight uppercase">Tennessee General Assembly</h1>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Ancillary Services Routing Sheet</p>
                </div>
                <div className="text-left sm:text-right font-mono text-xs">
                  <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">Confirmation Number</p>
                  <p className="text-lg font-bold text-primary-950">{confirmationNumber || 'DRAFT-NEW'}</p>
                </div>
              </header>

              {/* Event Metadata Grid */}
              <section className="mb-8 bg-slate-50 border border-slate-200 rounded p-6 grid grid-cols-2 sm:grid-cols-3 gap-6 print:bg-white print:border-slate-300">
                <div>
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Room / Chamber</p>
                  <p className="text-sm font-medium text-primary-950">{formData.room || 'Unspecified'}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Requested Date</p>
                  <p className="text-sm font-medium text-primary-950">{formData.requestedDate || 'Unspecified'}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Requested Time</p>
                  <p className="text-sm font-medium text-primary-950">{formData.requestedTime || 'Unspecified'}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Sponsoring Dept</p>
                  <p className="text-sm font-medium text-primary-950">{formData.department || 'Unspecified'}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Member Sponsor</p>
                  <p className="text-sm font-medium text-primary-950">{formData.memberSponsor || 'Unspecified'}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Attendee Count</p>
                  <p className="text-sm font-medium text-primary-950">{formData.attendeeCount || '0'}</p>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <p className="font-bold uppercase text-[9px] tracking-wider text-slate-500 mb-0.5">Group / Event Name</p>
                  <p className="text-sm font-medium text-primary-950">{formData.groupName || 'Unspecified'}</p>
                </div>
              </section>

              {/* Print Area Contents */}
              <div className="space-y-8">
                {formData.needsSetup && (
                  <div className="break-inside-avoid">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-4 print:border-slate-300">
                      Setup Requirements
                    </h2>
                    <div className="border border-slate-200 rounded p-5 bg-white shadow-sm print:border-slate-400 print:shadow-none">
                      <p className="text-sm font-medium text-primary-950 mb-2"><strong>Requested Types:</strong> {formData.setupType.join(', ')}</p>
                      {formData.setupNotes && (
                        <p className="text-sm text-primary-900 whitespace-pre-wrap leading-relaxed font-sans">
                          <strong>Notes:</strong> {formData.setupNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2 print:border-slate-300">
                  <span>Assigned Departmental Instructions</span>
                  <span className="text-[10px] lowercase text-slate-400 font-normal print:hidden">
                    (Only checked departments are printed)
                  </span>
                </h2>

                {formData.departmentTasks && formData.departmentTasks.filter(t => selectedPrintDepts.includes(t.departmentType)).length > 0 ? (
                  <div className="space-y-6">
                    {formData.departmentTasks
                      .filter(t => selectedPrintDepts.includes(t.departmentType))
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="border border-slate-200 rounded p-5 bg-white shadow-sm break-inside-avoid print:border-slate-400 print:shadow-none"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 print:border-slate-300">
                            <h3 className="text-sm font-bold uppercase text-primary-950 flex items-center gap-2">
                              <span className="w-2 h-2 bg-primary-950"></span>
                              {task.departmentType} Instructions
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                              Routing Block
                            </span>
                          </div>
                          <p className="text-sm text-primary-900 whitespace-pre-wrap leading-relaxed font-sans">
                            {task.instructions}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded text-center bg-slate-50 print:bg-white print:border-slate-300">
                    <p className="text-xs text-slate-400 font-medium">No department tasks selected for printing.</p>
                    <p className="text-[10px] text-slate-400 mt-1 print:hidden">Check departments in the sidebar to populate sheets.</p>
                  </div>
                )}
              </div>

              {/* Attachments Section in Print View */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="space-y-4 mt-8 break-inside-avoid">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 print:border-slate-300">
                    Attachments Provided
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 print:bg-white print:border-slate-300">
                        <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <footer className="absolute bottom-8 left-8 right-8 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-4 flex justify-between items-center print:static print:mt-16 print:pt-4 print:border-slate-300">
                <p>Generated: {new Date().toLocaleDateString()}</p>
                <p>TNGA Reservations Routing Sheet</p>
              </footer>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center p-8 h-full animate-in fade-in duration-300 print:p-0">
        <div className="max-w-md w-full bg-white rounded border border-slate-200 shadow-sm p-8 text-center print:border-none print:shadow-none print:p-0 print:max-w-none print:text-left">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 print:hidden">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-primary-950 mb-2 uppercase tracking-tight print:mb-6 print:text-3xl">Reservation Confirmed</h2>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6 mt-4 print:bg-white print:border-slate-800 print:inline-block print:px-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 print:text-primary-900">Confirmation Number</p>
            <p className="text-2xl font-mono font-bold text-primary-950 print:text-3xl">{confirmationNumber}</p>
          </div>
          
          <div className="hidden print:block mb-8 text-sm text-primary-900">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Department</p>
                <p className="font-medium text-base">{formData.department}</p>
              </div>
              <div>
                <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Room</p>
                <p className="font-medium text-base">{formData.room}</p>
              </div>
              <div>
                <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Date</p>
                <p className="font-medium text-base">{formData.requestedDate}</p>
              </div>
              <div>
                <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Time</p>
                <p className="font-medium text-base">{formData.requestedTime}</p>
              </div>
              <div className="col-span-2">
                <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Group Name</p>
                <p className="font-medium text-base">{formData.groupName}</p>
              </div>
              {formData.needsAV && (
                <div className="col-span-2">
                  <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">AV Notes</p>
                  <p className="font-medium text-base whitespace-pre-wrap">{formData.avNotes || 'None'}</p>
                </div>
              )}
              {formData.needsSecurity && (
                <div className="col-span-2">
                  <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Security Notes</p>
                  <p className="font-medium text-base whitespace-pre-wrap">{formData.securityNotes || 'None'}</p>
                </div>
              )}
              {formData.needsCatering && (
                <div className="col-span-2">
                  <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Catering Notes</p>
                  <p className="font-medium text-base whitespace-pre-wrap">{formData.cateringNotes || 'None'}</p>
                </div>
              )}
              {formData.needsFacilities && (
                <div className="col-span-2">
                  <p className="font-bold uppercase text-[10px] tracking-wider text-slate-500 mb-1">Facilities Notes</p>
                  <p className="font-medium text-base whitespace-pre-wrap">{formData.facilitiesNotes || 'None'}</p>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-8 print:hidden">
            Your reservation request has been successfully saved. Our scheduling team will review it and contact you shortly.
          </p>
          
          <div className="flex flex-col gap-3 print:hidden">
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handlePrintPDF}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 rounded font-bold text-xs uppercase tracking-wide py-2.5 px-4 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / PDF
              </button>
              <button 
                type="button"
                onClick={handleExportWord}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 rounded font-bold text-xs uppercase tracking-wide py-2.5 px-4 shadow-sm hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Word Doc
              </button>
            </div>
            {formData.departmentTasks && formData.departmentTasks.length > 0 && (
              <button 
                type="button"
                onClick={() => setShowPrintSummary(true)}
                className="w-full flex items-center justify-center gap-2 bg-accent-500 text-primary-950 rounded font-bold text-xs uppercase tracking-wide py-2.5 px-4 shadow-sm hover:bg-accent-600 transition-colors"
              >
                <Printer className="w-4 h-4 text-primary-950" />
                Print Routing Sheets
              </button>
            )}
            <button 
              onClick={() => { setIsSubmitted(false); setFormData(INITIAL_STATE); setUseSameContact(false); setConfirmationNumber(''); }}
              className="w-full bg-primary-950 text-white rounded font-bold text-sm uppercase tracking-wide py-3 px-4 shadow hover:bg-primary-900 transition-colors mt-2"
            >
              Book Another Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button 
          type="button" 
          onClick={onCancelEdit}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-950 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        
        <div className="flex items-center gap-3">
          {!editingReservationId && activeDraftId && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded tracking-wide animate-pulse">
              DRAFT AUTO-SAVED
            </span>
          )}
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {editingReservationId ? 'Edit Reservation' : 'New Room Booking'}
          </h2>
        </div>
      </div>

      {/* Conflict Error Banner */}
      {conflictError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-800">Booking Conflict</h3>
            <p className="text-xs text-red-700 mt-1">{conflictError}</p>
          </div>
          <button type="button" onClick={() => setConflictError(null)} className="text-red-500 hover:text-red-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Row 1: Core Identification & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sponsorship & Group */}
        <div className="md:col-span-5 bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-950"></span> Sponsorship & Event Details
          </h2>
          <div className="space-y-4">
            <Select label="Department *" required value={formData.department} onChange={e => { handleInputChange('department', e.target.value); handleInputChange('room', ''); }} options={departmentOptions} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Member Sponsor *" required value={formData.memberSponsor} onChange={e => handleInputChange('memberSponsor', e.target.value)} placeholder="e.g. Sen. Miller" />
              <Input label="Attendee Count *" required type="number" min="1" value={formData.attendeeCount} onChange={e => handleInputChange('attendeeCount', e.target.value ? parseInt(e.target.value) : '')} placeholder="0" />
            </div>
            <Input label="Group Name *" required value={formData.groupName} onChange={e => handleInputChange('groupName', e.target.value)} placeholder="Official Committee or Group Name" />
          </div>
        </div>

        {/* Scheduling & On-Site Contacts */}
        <div className="md:col-span-7 bg-white p-5 rounded border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase mb-2">Scheduling Contact</h2>
              <Input label="Name *" required value={formData.schedulingContactName} onChange={e => handleSchedulingContactChange('schedulingContactName', e.target.value)} placeholder="Contact Name" />
              <Input label="Phone Number *" required type="tel" value={formData.schedulingContactNumber} onChange={e => handleSchedulingContactChange('schedulingContactNumber', e.target.value)} placeholder="Contact Number" />
              <Input label="Email *" required type="email" value={formData.schedulingContactEmail} onChange={e => handleSchedulingContactChange('schedulingContactEmail', e.target.value)} placeholder="Contact Email" />
            </div>
            <div className="space-y-4 sm:border-l border-slate-100 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase">On-Site Day-of Contact</h2>
                <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={useSameContact} onChange={handleSameContactChange} className="rounded border-slate-300 accent-slate-900 cursor-pointer w-3 h-3" />
                  Same as scheduling
                </label>
              </div>
              <Input label="Name *" required disabled={useSameContact} value={formData.onSiteContactName} onChange={e => handleInputChange('onSiteContactName', e.target.value)} placeholder="Contact Name" />
              <Input label="Phone Number *" required type="tel" disabled={useSameContact} value={formData.onSiteContactNumber} onChange={e => handleInputChange('onSiteContactNumber', e.target.value)} placeholder="Contact Number" />
              <Input label="Email *" required type="email" disabled={useSameContact} value={formData.onSiteContactEmail} onChange={e => handleInputChange('onSiteContactEmail', e.target.value)} placeholder="Contact Email" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Scheduling Logistics */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-950"></span> Scheduling Logistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-1">
          <Input label="Requested Date *" required type="date" value={formData.requestedDate} onChange={e => handleInputChange('requestedDate', e.target.value)} />
          <Select label="Requested Time *" required value={formData.requestedTime} onChange={e => handleInputChange('requestedTime', e.target.value)} options={timeOptions} />
          <div className="flex flex-col">
            <Select label={formData.department ? `Select Room (${formData.department}) *` : "Select Room (Filtered by Dept) *"} required disabled={!formData.department} value={formData.room} onChange={e => handleInputChange('room', e.target.value)} options={roomOptions} />
            {!formData.department && (
              <span className="mt-1 text-[10px] text-accent-600 font-semibold italic">Select a Department first to view rooms</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Room Setup Configuration */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-950"></span> Room Setup Configuration
          </h2>
          <div className="space-y-4">
            <Checkbox 
              label="Custom Setup Required" 
              checked={formData.needsSetup} 
              onChange={e => { 
                handleInputChange('needsSetup', e.target.checked); 
                if (!e.target.checked) {
                  handleInputChange('setupType', []); 
                  handleInputChange('setupNotes', '');
                }
              }} 
            />
            
            {formData.needsSetup ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-700">Setup Type(s) *</label>
                  <div className="flex flex-col gap-2 p-3 border border-slate-300 rounded bg-white">
                    {setupOptions.map(opt => (
                      <Checkbox
                        key={opt.value}
                        label={opt.label}
                        checked={formData.setupType.includes(opt.value)}
                        onChange={e => {
                          const current = [...formData.setupType];
                          if (e.target.checked) {
                            current.push(opt.value);
                          } else {
                            const idx = current.indexOf(opt.value);
                            if (idx > -1) current.splice(idx, 1);
                            // Clear setupNotes if Other is unchecked
                            if (opt.value === 'Other (explain below)') {
                              handleInputChange('setupNotes', '');
                            }
                          }
                          handleInputChange('setupType', current);
                        }}
                      />
                    ))}
                  </div>
                  {formData.setupType.includes('Other (explain below)') && (
                    <div className="mt-3 animate-in fade-in duration-300">
                      <Textarea
                        label="Other Setup Instructions *"
                        placeholder="Please explain the requested setup..."
                        required
                        value={formData.setupNotes}
                        onChange={(e) => handleInputChange('setupNotes', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 italic">Select the desired arrangement for the reserved room.</p>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded bg-slate-50/50">
                <p className="text-xs text-slate-400 text-center font-medium">Toggle "Custom Setup Required" to configure room arrangement.</p>
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 mt-6">
          <div className="p-3 bg-accent-50 rounded border border-accent-100 flex items-start gap-3">
            <div className="text-accent-600 text-lg leading-none">ⓘ</div>
            <p className="text-[11px] text-amber-800 leading-tight italic">Requests must be submitted 72 hours in advance. Some rooms may require additional security clearance.</p>
          </div>
        </div>
      </div>

      {/* Inter-Departmental Task Delegation Section */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-950"></span> Inter-Departmental Task Delegation & Coordination
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Route specialized instructions directly to support teams (LIS, AV, Facilities, Security, Catering, Other).
            </p>
          </div>
          
          <div className="flex items-center">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddDepartmentTaskClick(e.target.value as DepartmentType);
                }
              }}
              className="w-full sm:w-60 border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="" disabled>+ Add Department Task...</option>
              {departmentTypes.map(dept => (
                <option key={dept} value={dept}>
                  {dept} {formData.departmentTasks?.some(t => t.departmentType === dept) ? '(Edit instructions)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formData.departmentTasks && formData.departmentTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.departmentTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => handleEditTaskClick(task)}
                className="p-4 bg-slate-50/50 border border-slate-200 rounded flex flex-col justify-between hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group relative shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 tracking-wider">
                      {task.departmentType}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove instructions for ${task.departmentType}?`)) {
                          handleRemoveTask(task.id);
                        }
                      }}
                      title="Remove Instructions"
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-wrap pr-1 leading-relaxed">
                    {task.instructions}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200/40 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="group-hover:text-slate-600 transition-colors">Click to Edit</span>
                  <span>{task.instructions.length} chars</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded bg-slate-50">
            <p className="text-xs text-slate-400 text-center font-medium">No ancillary department tasks routed yet.</p>
            <p className="text-[10px] text-slate-400 text-center mt-1">Select LIS, AV, Facilities, Security, Catering, or Other from the dropdown to delegate.</p>
          </div>
        )}
      </div>

      {/* Row 3: Comments & Attachments */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm shrink-0 flex flex-col gap-6">
        <Textarea label="Please provide additional details" description="(Include catering plans, specific room arrangement details, AV requests, or other technical needs)" value={formData.additionalDetails} onChange={e => handleInputChange('additionalDetails', e.target.value)} placeholder="Enter detailed requirements here..." className="w-full" />
        
        <div className="border-t border-slate-100 pt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Attachments</label>
          <div className="flex flex-col gap-3">
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
                {formData.attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-700 truncate hover:text-accent-600 hover:underline inline-block max-w-full">
                          {file.name}
                        </a>
                        <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
                        title="View attachment"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(i)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 uppercase tracking-wide hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Files
              </label>
              <p className="text-[10px] text-slate-400 mt-2">Supported formats: PDF, DOCX, JPG, PNG (Max 10MB)</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Controls */}
      <footer className="bg-white border border-slate-200 rounded p-4 flex flex-col-reverse sm:flex-row justify-between items-center shrink-0 mt-2 gap-4 sm:gap-0 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${formData.department && formData.room ? 'bg-emerald-500' : 'bg-accent-400'}`}></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              {formData.department && formData.room ? 'Ready to save' : 'Pending required fields'}
            </span>
          </div>
          {formData.department && (
            <span className="text-[10px] text-slate-400 uppercase tracking-widest pl-5">
              Prefix: {formData.department === 'Senate' ? 'SEN' : formData.department === 'House' ? 'HOU' : 'JOU'}-XXXXXX
            </span>
          )}
        </div>
        <div className="flex gap-4 w-full sm:w-auto items-center">
          {!editingReservationId && activeDraftId && (
            <button 
              type="button" 
              onClick={() => {
                if (confirm('Are you sure you want to discard this draft?')) {
                  onDeleteDraft(activeDraftId);
                  onCancelEdit();
                }
              }} 
              className="px-4 py-2 text-red-600 hover:text-red-700 font-bold text-sm uppercase tracking-wide hover:bg-red-50 rounded transition-colors"
            >
              Discard Draft
            </button>
          )}
          {formData.departmentTasks && formData.departmentTasks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPrintSummary(true)}
              className="flex-1 sm:flex-none px-5 py-2 bg-accent-500 hover:bg-accent-600 text-primary-950 rounded font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <Printer className="w-4 h-4" /> Routing Sheets
            </button>
          )}
          <button type="button" onClick={onCancelEdit} className="flex-1 sm:flex-none px-6 py-2 border border-slate-300 text-slate-600 rounded font-bold text-sm uppercase tracking-wide hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 sm:flex-none px-8 py-2 bg-primary-950 text-white rounded font-bold text-sm uppercase tracking-wide shadow hover:bg-primary-900 transition-colors">
            {editingReservationId ? 'Update Reservation' : 'Save Reservation'}
          </button>
        </div>
      </footer>

      {/* Task Modal Overlay */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded border border-slate-200 shadow-xl max-w-lg w-full flex flex-col animate-in zoom-in-95 duration-200">
            <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-primary-950 uppercase tracking-tight">
                {editingTaskId ? 'Edit Instructions for:' : 'Add Instructions for:'}{' '}
                <span className="text-accent-600 font-mono font-bold">{selectedTaskDept}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            <div className="p-5 flex-1 flex flex-col gap-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                Task Instructions / Comments *
              </label>
              <textarea
                required
                rows={6}
                value={taskInstructions}
                onChange={(e) => setTaskInstructions(e.target.value)}
                placeholder={`Enter detailed instructions specific to the ${selectedTaskDept} department...`}
                className="w-full border border-slate-300 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 italic">
                These instructions will be routed directly to the {selectedTaskDept} team and can be selectively printed.
              </p>
            </div>
            
            <footer className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  if (!taskInstructions.trim()) {
                    if (confirm("No instructions entered. Remove this department task?")) {
                      if (editingTaskId) {
                        handleRemoveTask(editingTaskId);
                      }
                    }
                    setIsTaskModalOpen(false);
                    return;
                  }
                  setIsTaskModalOpen(false);
                }}
                className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                className="px-5 py-2 bg-primary-950 hover:bg-primary-900 text-white rounded font-bold text-xs uppercase tracking-wide shadow-sm transition-colors"
              >
                Save Instructions
              </button>
            </footer>
          </div>
        </div>
      )}
    </form>
  );
}
