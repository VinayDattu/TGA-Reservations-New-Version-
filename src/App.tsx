import React, { useState, useEffect } from 'react';
import { Menu, ChevronLeft, LayoutDashboard, Calendar as CalendarIcon, List, CalendarPlus, Search, FileText, X, Printer, MessageSquare } from 'lucide-react';
import DashboardView from './views/DashboardView';
import ListView from './views/ListView';
import CalendarView from './views/CalendarView';
import BookingForm from './views/BookingForm';
import DraftsView from './views/DraftsView';
import FeedbackView from './views/FeedbackView';
import ThemeSettings, { ThemeType } from './components/ThemeSettings';
import { MOCK_RESERVATIONS } from './data';
import { Reservation, Draft, ReservationFormData } from './types';

export default function App() {
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('tnga_theme') as ThemeType) || 'navy';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tnga_theme', theme);
  }, [theme]);

  const [currentView, setCurrentView] = useState<'dashboard'|'calendar'|'list'|'book'|'drafts'|'feedback'>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && ['dashboard', 'calendar', 'list', 'book', 'drafts', 'feedback'].includes(view)) {
      return view as any;
    }
    return 'dashboard';
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [searchError, setSearchError] = useState('');

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('tnga_reservations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved reservations", e);
      }
    }
    return MOCK_RESERVATIONS;
  });

  const [drafts, setDrafts] = useState<Draft[]>(() => {
    const saved = localStorage.getItem('tnga_drafts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved drafts", e);
      }
    }
    return [];
  });

  const [editingReservationId, setEditingReservationId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  });
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [prefilledRoom, setPrefilledRoom] = useState<string | null>(null);
  const [prefilledTime, setPrefilledTime] = useState<string | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('draftId');
  });

  const [printModalInfo, setPrintModalInfo] = useState<{ isOpen: boolean; view: string; url: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      const timer = setTimeout(() => {
        window.print();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTriggerPrint = (
    viewName: 'calendar' | 'list' | 'book',
    details?: { id?: string; draftId?: string; printSummary?: boolean }
  ) => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      let url = `${window.location.origin}${window.location.pathname}?view=${viewName}&print=true`;
      if (details?.id) url += `&id=${encodeURIComponent(details.id)}`;
      if (details?.draftId) url += `&draftId=${encodeURIComponent(details.draftId)}`;
      if (details?.printSummary) url += `&printSummary=true`;
      
      setPrintModalInfo({
        isOpen: true,
        view: viewName,
        url: url
      });
    } else {
      window.print();
    }
  };

  const saveReservationsToStorage = (updatedList: Reservation[]) => {
    setReservations(updatedList);
    localStorage.setItem('tnga_reservations', JSON.stringify(updatedList));
  };

  const handleSaveDraft = (draftId: string, formData: ReservationFormData) => {
    setDrafts(prev => {
      const existingIdx = prev.findIndex(d => d.id === draftId);
      const newDraft: Draft = {
        id: draftId,
        updatedAt: new Date().toISOString(),
        formData
      };
      let updated;
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx] = newDraft;
      } else {
        updated = [newDraft, ...prev];
      }
      localStorage.setItem('tnga_drafts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(prev => {
      const updated = prev.filter(d => d.id !== draftId);
      localStorage.setItem('tnga_drafts', JSON.stringify(updated));
      return updated;
    });
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
  };

  const handleResumeDraft = (draft: Draft) => {
    setEditingReservationId(null);
    setPrefilledDate(null);
    setActiveDraftId(draft.id);
    setCurrentView('book');
  };

  const handleSaveReservation = (updatedRes: Reservation) => {
    let updatedList;
    if (reservations.some(r => r.id === updatedRes.id)) {
      updatedList = reservations.map(r => r.id === updatedRes.id ? updatedRes : r);
    } else {
      updatedList = [updatedRes, ...reservations];
    }
    saveReservationsToStorage(updatedList);

    // If we just saved a reservation, delete any draft associated with it
    if (activeDraftId) {
      handleDeleteDraft(activeDraftId);
    }

    setEditingReservationId(null);
    setPrefilledDate(null);
    setPrefilledRoom(null);
    setPrefilledTime(null);
    setActiveDraftId(null);
    setCurrentView('list');
  };

  const handleEditReservation = (res: Reservation) => {
    setEditingReservationId(res.id);
    setPrefilledDate(null);
    setPrefilledRoom(null);
    setPrefilledTime(null);
    setActiveDraftId(null);
    setCurrentView('book');
  };

  const handleCreateReservationOnDate = (date: string, room?: string, time?: string) => {
    setEditingReservationId(null);
    setPrefilledDate(date);
    setPrefilledRoom(room || null);
    setPrefilledTime(time || null);
    setActiveDraftId('draft-' + Math.random().toString(36).substring(2, 9));
    setCurrentView('book');
  };

  const handleCancelEdit = () => {
    setEditingReservationId(null);
    setPrefilledDate(null);
    setPrefilledRoom(null);
    setPrefilledTime(null);
    setActiveDraftId(null);
    setCurrentView('list');
  };

  const handleSidebarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarSearch.trim()) return;
    
    const found = reservations.find(r => 
      r.confirmationNumber.toLowerCase() === sidebarSearch.trim().toLowerCase()
    );

    if (found) {
      setSearchError('');
      setEditingReservationId(found.id);
      setPrefilledDate(null);
      setCurrentView('book');
      setSidebarSearch('');
    } else {
      setSearchError('Not found');
      setTimeout(() => setSearchError(''), 3000);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'list', label: 'List View', icon: List },
    { id: 'book', label: 'Book a Room', icon: CalendarPlus },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'feedback', label: 'Submit Feedback', icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-primary-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-primary-950 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64 sm:w-72'} shrink-0 border-r-4 border-accent-500 z-10 print:hidden`}>
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-primary-900 h-16`}>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm sm:text-base font-bold tracking-tight uppercase truncate">TNGA Reservation</h1>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-primary-900 transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Search Bar - only visible when sidebar is not collapsed */}
        {!isCollapsed && (
          <form onSubmit={handleSidebarSearch} className="px-4 py-3 border-b border-primary-900 bg-primary-950/40">
            <label className="text-[10px] font-bold uppercase tracking-widest text-accent-500 block mb-1.5">Search Reservation</label>
            <div className="flex gap-1.5">
              <input 
                type="text" 
                placeholder="Enter Conf #..." 
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="bg-primary-900 text-white rounded text-xs px-2.5 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-accent-500 flex-1 border border-slate-700 min-w-0"
              />
              <button 
                type="submit"
                className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold text-xs uppercase px-3 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </div>
            {searchError && <p className="text-[10px] text-red-400 mt-1 font-semibold">{searchError}</p>}
          </form>
        )}
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'book') {
                    setEditingReservationId(null);
                    setPrefilledDate(null);
                    setPrefilledRoom(null);
                    setPrefilledTime(null);
                    setActiveDraftId('draft-' + Math.random().toString(36).substring(2, 9));
                  }
                  setCurrentView(item.id);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center justify-between w-full px-3 py-3 rounded transition-colors ${
                  isActive 
                    ? 'bg-accent-500 text-primary-950 shadow' 
                    : 'text-slate-400 hover:text-white hover:bg-primary-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Icon className="w-5 h-5 shrink-0" />
                    {isCollapsed && item.id === 'drafts' && drafts.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full" />
                    )}
                  </div>
                  {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.id === 'drafts' && drafts.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-primary-950 text-accent-500' : 'bg-accent-500 text-primary-950'
                  }`}>
                    {drafts.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <>
            <ThemeSettings currentTheme={theme} onThemeChange={setTheme} />
            <div className="p-4 border-t border-primary-900 bg-primary-950">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Session Year {new Date().getFullYear()}
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
        {currentView === 'dashboard' && (
          <DashboardView 
            reservations={reservations} 
            onEditReservation={handleEditReservation}
            onUpdateReservations={saveReservationsToStorage}
          />
        )}
        {currentView === 'calendar' && (
          <CalendarView 
            reservations={reservations} 
            onEditReservation={handleEditReservation} 
            onCreateReservationOnDate={handleCreateReservationOnDate}
            onTriggerPrint={handleTriggerPrint}
          />
        )}
        {currentView === 'list' && (
          <ListView 
            reservations={reservations} 
            onEditReservation={handleEditReservation}
            onTriggerPrint={handleTriggerPrint}
          />
        )}
        {currentView === 'book' && (
          <BookingForm 
            reservations={reservations}
            onSaveReservation={handleSaveReservation}
            editingReservationId={editingReservationId}
            prefilledDate={prefilledDate}
            prefilledRoom={prefilledRoom}
            prefilledTime={prefilledTime}
            onCancelEdit={handleCancelEdit}
            activeDraftId={activeDraftId}
            drafts={drafts}
            onSaveDraft={handleSaveDraft}
            onDeleteDraft={handleDeleteDraft}
            onTriggerPrint={handleTriggerPrint}
          />
        )}
        {currentView === 'drafts' && (
          <DraftsView 
            drafts={drafts}
            onResumeDraft={handleResumeDraft}
            onDiscardDraft={handleDeleteDraft}
          />
        )}
        {currentView === 'feedback' && (
          <FeedbackView />
        )}
      </main>

      {/* Iframe Print Support Modal */}
      {printModalInfo?.isOpen && (
        <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded border border-slate-200 shadow-xl max-w-md w-full flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-primary-950 text-xs flex items-center gap-2 uppercase tracking-wide">
                <Printer className="w-4 h-4 text-accent-500" />
                Print Confirmation
              </h3>
              <button 
                onClick={() => setPrintModalInfo(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-5 flex flex-col gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Because this application is currently running inside the secure preview pane, the browser restricts direct access to your system printer.
              </p>
              <div className="bg-accent-50/50 border border-amber-200/60 p-3.5 rounded flex items-start gap-3">
                <span className="text-accent-600 text-lg leading-none mt-0.5">ⓘ</span>
                <p className="text-xs text-slate-600 font-medium leading-normal">
                  To print, we will open this view in a new browser tab and automatically open the Print dialog for you.
                </p>
              </div>
            </div>
            <footer className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setPrintModalInfo(null)}
                className="px-4 py-2 border border-slate-300 rounded text-xs font-bold text-slate-700 uppercase tracking-wide hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <a
                href={printModalInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPrintModalInfo(null)}
                className="px-5 py-2 bg-primary-950 hover:bg-primary-900 text-white rounded font-bold text-xs uppercase tracking-wide shadow flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Open & Print
              </a>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
