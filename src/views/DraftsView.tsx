import React from 'react';
import { Trash2, ArrowRight, Clock, FileText } from 'lucide-react';
import { Draft } from '../types';

interface DraftsViewProps {
  drafts: Draft[];
  onResumeDraft: (draft: Draft) => void;
  onDiscardDraft: (draftId: string) => void;
}

export default function DraftsView({ drafts, onResumeDraft, onDiscardDraft }: DraftsViewProps) {
  const handleDiscard = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to discard this draft?')) {
      onDiscardDraft(draftId);
    }
  };

  const formatLastSaved = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-950 tracking-tight">Draft Reservations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Resume writing your unsaved bookings or discard incomplete requests.
          </p>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xs font-bold text-primary-950 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-500" />
            Unsaved Drafts ({drafts.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {drafts.length > 0 ? (
            drafts.map((draft) => {
              const { formData, updatedAt, id } = draft;
              const groupName = formData.groupName.trim() || 'Untitled Draft Reservation';
              const departmentInfo = formData.department 
                ? `${formData.department} Department` 
                : 'No Department Specified';
              const roomInfo = formData.room 
                ? formData.room 
                : 'No Room Selected';
              const dateTimeInfo = formData.requestedDate 
                ? `${formData.requestedDate} ${formData.requestedTime ? `• ${formData.requestedTime}` : ''}`
                : 'No Date / Time Selected';

              return (
                <div 
                  key={id}
                  onClick={() => onResumeDraft(draft)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                  title="Click to Resume Booking"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base text-primary-950 group-hover:text-accent-600 transition-colors truncate">
                        {groupName}
                      </h3>
                      {!formData.groupName.trim() && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">
                          Empty
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">{departmentInfo}</span>
                        {formData.room && <span className="text-slate-400">&bull;</span>}
                        {formData.room && <span className="text-slate-600 font-bold">{roomInfo}</span>}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>{dateTimeInfo}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Saved {formatLastSaved(updatedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDiscard(e, id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Discard Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-primary-950 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm group-hover:scale-102"
                      >
                        <span>Resume</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 px-4 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-slate-500 font-medium text-sm">No draft reservations found.</p>
              <p className="text-xs text-slate-400 max-w-md">
                When you start booking a room, your progress is automatically saved as a draft so you can finish it later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
