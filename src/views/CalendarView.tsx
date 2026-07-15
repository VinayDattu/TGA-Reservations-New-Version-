import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
  eachDayOfInterval, eachMonthOfInterval, isSameMonth, isSameDay
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Printer, Plus, CalendarPlus2,
  Lock, Unlock, Search, X, Check, EyeOff, MoreVertical, Palette, Info, CalendarDays, CheckSquare, Square
} from 'lucide-react';
import { Reservation } from '../types';
import { ROOMS_DATA, TIME_SLOTS } from '../data';

type ViewMode = 'day' | 'week' | 'month' | 'year' | 'schedule';

interface CalendarViewProps {
  reservations: Reservation[];
  onEditReservation: (res: Reservation) => void;
  onCreateReservationOnDate: (date: string, room?: string, time?: string) => void;
  onTriggerPrint?: (view: 'calendar') => void;
}

const PREDEFINED_COLORS = [
  { id: 'rose', name: 'Rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', hex: '#f43f5e', dot: 'bg-rose-500', indicator: 'border-rose-500' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', hex: '#ec4899', dot: 'bg-pink-500', indicator: 'border-pink-500' },
  { id: 'fuchsia', name: 'Fuchsia', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', hex: '#d946ef', dot: 'bg-fuchsia-500', indicator: 'border-fuchsia-500' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#a855f7', dot: 'bg-purple-500', indicator: 'border-purple-500' },
  { id: 'violet', name: 'Violet', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', hex: '#8b5cf6', dot: 'bg-violet-500', indicator: 'border-violet-500' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#6366f1', dot: 'bg-indigo-500', indicator: 'border-indigo-500' },
  { id: 'blue', name: 'Blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#3b82f6', dot: 'bg-blue-500', indicator: 'border-blue-500' },
  { id: 'sky', name: 'Sky', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', hex: '#0ea5e9', dot: 'bg-sky-500', indicator: 'border-sky-500' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', hex: '#06b6d4', dot: 'bg-cyan-500', indicator: 'border-cyan-500' },
  { id: 'teal', name: 'Teal', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hex: '#14b8a6', dot: 'bg-teal-500', indicator: 'border-teal-500' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10b981', dot: 'bg-emerald-500', indicator: 'border-emerald-500' },
  { id: 'green', name: 'Green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', hex: '#22c55e', dot: 'bg-green-500', indicator: 'border-green-500' },
  { id: 'lime', name: 'Lime', bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', hex: '#84cc16', dot: 'bg-lime-500', indicator: 'border-lime-500' },
  { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', hex: '#eab308', dot: 'bg-yellow-500', indicator: 'border-yellow-500' },
  { id: 'amber', name: 'Amber', bg: 'bg-accent-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#f59e0b', dot: 'bg-accent-500', indicator: 'border-accent-500' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hex: '#f97316', dot: 'bg-orange-500', indicator: 'border-orange-500' }
];

const ALL_ROOMS = [
  ...ROOMS_DATA.Joint.map(r => ({ name: r.name, department: 'Joint' as const, capacity: r.capacity })),
  ...ROOMS_DATA.Senate.map(r => ({ name: r.name, department: 'Senate' as const, capacity: r.capacity })),
  ...ROOMS_DATA.House.map(r => ({ name: r.name, department: 'House' as const, capacity: r.capacity }))
];

const getFallbackColor = (roomName: string): string => {
  let hash = 0;
  for (let i = 0; i < roomName.length; i++) {
    hash = roomName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PREDEFINED_COLORS.length;
  return PREDEFINED_COLORS[index].id;
};

const getRoomColorObj = (roomName: string, customColors: Record<string, string>) => {
  const colorId = customColors[roomName] || getFallbackColor(roomName);
  return PREDEFINED_COLORS.find(c => c.id === colorId) || PREDEFINED_COLORS[0];
};

export default function CalendarView({ reservations, onEditReservation, onCreateReservationOnDate, onTriggerPrint }: CalendarViewProps) {
  // Use noon to avoid timezone issues, default to 2026-07-10 (which is the date of mock reservations)
  const [currentDate, setCurrentDate] = useState(new Date('2026-07-10T12:00:00')); 
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const [selectedRooms, setSelectedRooms] = useState<string[]>(() => {
    const saved = localStorage.getItem('tnga_selected_rooms');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      "Conference Room 8A", "Conference Room 8B", "Conference Room 8C", "Conference Room 8D",
      "Senate Hearing Room I", "Senate Hearing Room II", "Senate Chamber (Floor)",
      "House Hearing Room I", "House Hearing Room II", "House Chamber (Floor)"
    ];
  });

  const [roomColors, setRoomColors] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('tnga_room_colors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  const [restrictedRooms, setRestrictedRooms] = useState<string[]>(() => {
    const saved = localStorage.getItem('tnga_restricted_rooms');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return ["Senate Chamber (Floor)", "House Chamber (Floor)"];
  });

  const [calendarFilter, setCalendarFilter] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; roomName: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('tnga_selected_rooms', JSON.stringify(selectedRooms));
  }, [selectedRooms]);

  useEffect(() => {
    localStorage.setItem('tnga_room_colors', JSON.stringify(roomColors));
  }, [roomColors]);

  useEffect(() => {
    localStorage.setItem('tnga_restricted_rooms', JSON.stringify(restrictedRooms));
  }, [restrictedRooms]);

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day': setCurrentDate(subDays(currentDate, 1)); break;
      case 'schedule': setCurrentDate(subDays(currentDate, 1)); break;
      case 'week': setCurrentDate(subWeeks(currentDate, 1)); break;
      case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
      case 'year': setCurrentDate(subYears(currentDate, 1)); break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day': setCurrentDate(addDays(currentDate, 1)); break;
      case 'schedule': setCurrentDate(addDays(currentDate, 1)); break;
      case 'week': setCurrentDate(addWeeks(currentDate, 1)); break;
      case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
      case 'year': setCurrentDate(addYears(currentDate, 1)); break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-07-10T12:00:00')); // July 10, 2026
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(r => r.date === dateStr);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isCurrentDay = isSameDay(cloneDay, new Date('2026-07-09T12:00:00'));

        days.push(
          <div 
            key={day.toISOString()} 
            onClick={() => onCreateReservationOnDate(format(cloneDay, 'yyyy-MM-dd'))}
            className={`bg-white p-2 min-h-[120px] transition-colors hover:bg-slate-50 border border-slate-100 flex flex-col justify-between group cursor-pointer relative ${isCurrentDay ? 'bg-accent-50/30' : ''}`}
            title={`Click to Book Room on ${format(cloneDay, 'yyyy-MM-dd')}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium ${isCurrentDay ? 'bg-accent-500 text-primary-950 w-6 h-6 flex items-center justify-center rounded-full font-bold' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                {formattedDate}
              </span>
              {isCurrentMonth && (
                <span 
                  className="opacity-0 group-hover:opacity-100 p-0.5 bg-slate-100 hover:bg-accent-100 text-slate-600 hover:text-amber-700 rounded transition-all"
                  title={`Create reservation on ${format(cloneDay, 'yyyy-MM-dd')}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="mt-2 flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[80px]">
              {dayEvents.map(ev => (
                <div 
                  key={ev.id} 
                  onClick={(e) => { e.stopPropagation(); onEditReservation(ev); }}
                  className={`p-1 text-[10px] leading-tight rounded border hover:scale-102 hover:border-accent-500 hover:shadow-sm transition-all cursor-pointer truncate ${ev.status === 'Confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-accent-50 border-amber-200 text-amber-800'}`}
                  title={`Click to Edit reservation for ${ev.groupName}`}
                >
                  <span className="font-bold block truncate">{ev.time} - {ev.groupName}</span>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="overflow-x-auto w-full">
        <div className="min-w-[700px] flex flex-col gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden">
          <div className="grid grid-cols-7 gap-px">
            {weekDays.map(d => (
              <div key={d} className="bg-slate-50 p-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          {rows}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="overflow-x-auto w-full">
        <div className="min-w-[700px] flex flex-col gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden">
           <div className="grid grid-cols-7 gap-px">
            {days.map((day, i) => {
              const isCurrentDay = isSameDay(day, new Date('2026-07-09T12:00:00'));
              return (
                <div key={i} className="bg-slate-50 p-3 text-center flex flex-col items-center">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">{weekDays[i]}</span>
                  <span className={`mt-1 text-base font-medium ${isCurrentDay ? 'bg-accent-500 text-primary-950 w-8 h-8 flex items-center justify-center rounded-full font-bold' : 'text-primary-950'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 gap-px min-h-[400px]">
            {days.map((day, i) => {
               const dayEvents = getEventsForDate(day);
               const isCurrentDay = isSameDay(day, new Date('2026-07-09T12:00:00'));
               return (
                <div 
                  key={i} 
                  onClick={() => onCreateReservationOnDate(format(day, 'yyyy-MM-dd'))}
                  className={`bg-white p-2 transition-colors hover:bg-slate-50 border border-slate-100 flex flex-col justify-between group cursor-pointer ${isCurrentDay ? 'bg-accent-50/30' : ''}`}
                  title={`Click to Book Room on ${format(day, 'yyyy-MM-dd')}`}
                >
                  <div className="flex justify-end mb-1">
                    <span 
                      className="opacity-0 group-hover:opacity-100 p-0.5 bg-slate-100 hover:bg-accent-100 text-slate-600 hover:text-amber-700 rounded transition-all"
                      title={`Create reservation on ${format(day, 'yyyy-MM-dd')}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="mt-1 flex-1 flex flex-col gap-2">
                    {dayEvents.map(ev => (
                      <div 
                        key={ev.id} 
                        onClick={(e) => { e.stopPropagation(); onEditReservation(ev); }}
                        className={`p-2 text-[11px] leading-tight rounded border hover:border-accent-500 hover:shadow-sm transition-all cursor-pointer ${ev.status === 'Confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-accent-50 border-amber-200 text-amber-800'}`}
                        title="Click to Edit Reservation"
                      >
                        <span className="font-bold block truncate">{ev.time}</span>
                        <span className="font-medium block truncate text-primary-950">{ev.groupName}</span>
                        <span className="truncate block opacity-80 mt-1">{ev.room}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-1 block opacity-70">{ev.department}</span>
                      </div>
                    ))}
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const sortedEvents = [...dayEvents].sort((a, b) => a.time.localeCompare(b.time)); // basic sort

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 p-4 border border-slate-200 rounded flex justify-between items-center shadow-sm">
          <h3 className="text-xl font-bold text-primary-950">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
          <button 
            onClick={() => onCreateReservationOnDate(format(currentDate, 'yyyy-MM-dd'))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold text-xs uppercase rounded transition-colors shadow"
          >
            <CalendarPlus2 className="w-4 h-4" />
            Book This Day
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm min-h-[400px]">
           {sortedEvents.length > 0 ? (
             <div className="flex flex-col gap-4">
                {sortedEvents.map(ev => (
                   <div 
                     key={ev.id} 
                     onClick={() => onEditReservation(ev)}
                     className="flex gap-6 items-start p-4 border border-slate-100 rounded hover:border-accent-500 hover:bg-slate-50 transition-colors cursor-pointer group"
                     title="Click to Edit Reservation"
                   >
                      <div className="w-24 shrink-0 pt-1 text-right">
                         <span className="font-bold text-primary-950">{ev.time}</span>
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-bold text-primary-950 text-lg group-hover:text-accent-600 transition-colors">{ev.groupName}</h4>
                               <p className="text-slate-600 font-medium mt-1">{ev.room} &bull; {ev.department}</p>
                               <p className="text-slate-500 text-sm mt-1">Conf #: <span className="font-mono font-bold text-slate-700">{ev.confirmationNumber}</span></p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs uppercase text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit &rarr;</span>
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ev.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-accent-100 text-amber-800'}`}>
                                {ev.status}
                              </span>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16 gap-4">
               <p className="text-sm font-medium">No reservations for this date.</p>
               <button 
                 onClick={() => onCreateReservationOnDate(format(currentDate, 'yyyy-MM-dd'))}
                 className="flex items-center gap-1.5 px-4 py-2 bg-primary-950 hover:bg-primary-900 text-white font-bold text-xs uppercase rounded transition-colors"
               >
                 <Plus className="w-4 h-4" /> Create Reservation
               </button>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const startDate = startOfWeek(monthStart);
          const endDate = endOfWeek(monthEnd);
          const days = eachDayOfInterval({ start: startDate, end: endDate });
          
          return (
            <div key={month.toISOString()} className="bg-white p-4 border border-slate-200 rounded shadow-sm hover:border-slate-300 transition-colors cursor-pointer" onClick={() => { setCurrentDate(month); setViewMode('month'); }}>
              <h4 className="font-bold text-primary-950 text-sm uppercase tracking-widest mb-3 text-center hover:text-accent-600 transition-colors">{format(month, 'MMMM')}</h4>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-bold text-slate-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isCurrentDay = isSameDay(day, new Date('2026-07-09T12:00:00'));
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div key={i} className={`text-[10px] p-1 rounded-full aspect-square flex items-center justify-center ${!isCurrentMonth ? 'text-slate-300' : isCurrentDay ? 'bg-accent-500 text-primary-950 font-bold' : hasEvents ? 'bg-slate-100 font-bold text-primary-950' : 'text-slate-600'}`}>
                       {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderScheduleView = () => {
    const filteredRooms = ALL_ROOMS.filter(r => 
      r.name.toLowerCase().includes(calendarFilter.toLowerCase()) ||
      r.department.toLowerCase().includes(calendarFilter.toLowerCase())
    );

    const departments: Record<'Joint' | 'Senate' | 'House', typeof ALL_ROOMS> = {
      Joint: [],
      Senate: [],
      House: []
    };
    filteredRooms.forEach(r => {
      departments[r.department].push(r);
    });

    const isRoomSelected = (name: string) => selectedRooms.includes(name);
    const toggleRoom = (name: string) => {
      setSelectedRooms(prev => 
        prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
      );
    };

    const handleSelectAll = () => {
      setSelectedRooms(ALL_ROOMS.map(r => r.name));
    };

    const handleClearAll = () => {
      setSelectedRooms([]);
    };

    const handleRoomContextMenu = (e: React.MouseEvent, roomName: string) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        roomName
      });
    };

    return (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR: Calendar / Room Selection Selector */}
        <div className="w-full lg:w-72 shrink-0 border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-4 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
              <CalendarDays className="w-4 h-4 text-accent-500" />
              Rooms ({selectedRooms.length} selected)
            </h3>
            <div className="flex gap-2 text-xs font-semibold">
              <button onClick={handleSelectAll} className="text-accent-600 hover:text-amber-700 hover:underline">All</button>
              <span className="text-slate-300">|</span>
              <button onClick={handleClearAll} className="text-slate-500 hover:text-slate-600 hover:underline">Clear</button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={calendarFilter}
              onChange={(e) => setCalendarFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            {calendarFilter && (
              <button onClick={() => setCalendarFilter('')} className="absolute right-2 top-2 hover:text-red-500 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1">
            {(['Joint', 'Senate', 'House'] as const).map(dept => {
              const deptRooms = departments[dept];
              if (deptRooms.length === 0) return null;
              return (
                <div key={dept} className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {dept} ({deptRooms.filter(r => isRoomSelected(r.name)).length}/{deptRooms.length})
                  </div>
                  <div className="flex flex-col gap-1 pl-0.5">
                    {deptRooms.map(room => {
                      const isSelected = isRoomSelected(room.name);
                      const color = getRoomColorObj(room.name, roomColors);
                      const isRestricted = restrictedRooms.includes(room.name);
                      return (
                        <div
                          key={room.name}
                          onContextMenu={(e) => handleRoomContextMenu(e, room.name)}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors group ${
                            isSelected ? 'bg-white shadow-sm hover:bg-slate-50' : 'text-slate-500 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => toggleRoom(room.name)}>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-accent-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <div className={`w-3.5 h-3.5 rounded-full ${color.dot} shrink-0`} />
                            <span className="font-medium truncate" title={room.name}>{room.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRestrictedRooms(prev =>
                                  prev.includes(room.name) ? prev.filter(r => r !== room.name) : [...prev, room.name]
                                );
                              }}
                              className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
                              title={isRestricted ? "Read Permissions Restricted. Click to grant access." : "Full Permissions Allowed. Click to restrict read permissions."}
                            >
                              {isRestricted ? (
                                <Lock className="w-3.5 h-3.5 text-red-500" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>

                            <button
                              onClick={(e) => handleRoomContextMenu(e, room.name)}
                              className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
                              title="Click to change color"
                            >
                              <Palette className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-1 border-t border-slate-100 pt-2.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Right-click or click palette to change colors manually.</span>
          </div>
        </div>

        {/* TIMELINE VIEW GRID */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center min-h-[400px]">
              <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-700 mb-1">No Calendars Selected</h4>
              <p className="text-slate-500 text-xs max-w-sm">
                Select one or more room calendars in the left pane to view their schedules side-by-side in a horizontal timeline layout.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white relative">
              <div className="overflow-auto max-h-[600px] w-full">
                <table className="w-full border-collapse table-fixed select-none">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="sticky left-0 top-0 z-30 bg-slate-100 border-r border-slate-200 text-left p-3 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[200px] w-[200px] shadow-[2px_2px_5px_rgba(0,0,0,0.05)]">
                        Room / Calendar
                      </th>
                      {TIME_SLOTS.map(slot => (
                        <th key={slot} className="sticky top-0 z-20 bg-slate-100 border-r border-slate-200 text-center p-3 text-xs font-bold text-slate-500 min-w-[120px] w-[120px] shadow-[0_2px_2px_rgba(0,0,0,0.03)]">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRooms.map(roomName => {
                      const roomObj = ALL_ROOMS.find(r => r.name === roomName);
                      if (!roomObj) return null;

                      const color = getRoomColorObj(roomName, roomColors);
                      const isRestricted = restrictedRooms.includes(roomName);
                      const dateStr = format(currentDate, 'yyyy-MM-dd');
                      const roomReservations = reservations.filter(r => 
                        r.room === roomName && r.date === dateStr
                      );

                      return (
                        <tr key={roomName} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                          <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-3 shadow-[2px_0_5px_rgba(0,0,0,0.03)] min-w-[200px] w-[200px]">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${color.bg} ${color.text} ${color.border}`}>
                                {roomName.split(' ').pop()?.slice(0, 2) || roomName.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-primary-900 text-xs truncate" title={roomName}>{roomName}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {roomObj.department} • Cap: {roomObj.capacity}
                                </div>
                              </div>
                            </div>
                          </td>

                          {TIME_SLOTS.map(slot => {
                            const slotEvents = roomReservations.filter(r => r.time === slot);

                            return (
                              <td
                                key={slot}
                                onClick={() => onCreateReservationOnDate(dateStr, roomName, slot)}
                                className="border-r border-slate-100 p-1 bg-white hover:bg-accent-50/20 cursor-pointer min-h-[5rem] h-[5rem] transition-colors relative min-w-[120px] w-[120px]"
                              >
                                <div className="flex flex-col gap-1 h-full justify-start overflow-y-auto">
                                  {slotEvents.map(ev => (
                                    <div
                                      key={ev.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditReservation(ev);
                                      }}
                                      className={`p-1.5 rounded-lg border text-[11px] leading-tight select-none cursor-pointer transition-all hover:scale-102 hover:shadow-md truncate ${
                                        isRestricted
                                          ? 'bg-slate-100 border-slate-200 text-slate-500'
                                          : `${color.bg} ${color.border} ${color.text}`
                                      }`}
                                      title={
                                        isRestricted
                                          ? `Read Permissions Restricted`
                                          : `${ev.groupName} (${ev.memberSponsor}) - ${ev.time}`
                                      }
                                    >
                                      {isRestricted ? (
                                        <div className="flex items-center gap-1 font-bold">
                                          <Lock className="w-3 h-3 text-red-500 shrink-0" />
                                          <span>Busy</span>
                                        </div>
                                      ) : (
                                        <div>
                                          <div className="font-bold truncate">{ev.groupName}</div>
                                          <div className="text-[9px] opacity-75 truncate">{ev.memberSponsor}</div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {slotEvents.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                      <Plus className="w-4 h-4 text-slate-400" />
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* CUSTOM RIGHT-CLICK PALETTE CONTEXT MENU */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 w-60 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
              <div>
                <h4 className="text-xs font-bold text-primary-900 uppercase tracking-wide">Change Color</h4>
                <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={contextMenu.roomName}>
                  {contextMenu.roomName}
                </p>
              </div>
              <button onClick={() => setContextMenu(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {PREDEFINED_COLORS.map(color => {
                const isSelected = roomColors[contextMenu.roomName] === color.id || 
                  (!roomColors[contextMenu.roomName] && getFallbackColor(contextMenu.roomName) === color.id);
                return (
                  <button
                    key={color.id}
                    onClick={() => {
                      setRoomColors(prev => ({ ...prev, [contextMenu.roomName]: color.id }));
                      setContextMenu(null);
                    }}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 shadow-sm relative ${color.bg} ${color.border}`}
                    title={color.name}
                  >
                    <span className={`w-3 h-3 rounded-full ${color.dot}`} />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-primary-950 border border-white text-white rounded-full p-0.5">
                        <Check className="w-2 h-2" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {roomColors[contextMenu.roomName] && (
              <button
                onClick={() => {
                  setRoomColors(prev => {
                    const next = { ...prev };
                    delete next[contextMenu.roomName];
                    return next;
                  });
                  setContextMenu(null);
                }}
                className="w-full text-center py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-primary-900 transition-colors border border-slate-200"
              >
                Reset to Default Color
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'day': return format(currentDate, 'MMMM d, yyyy');
      case 'schedule': return `Schedule: ${format(currentDate, 'EEEE, MMMM d, yyyy')}`;
      case 'week': {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        if (isSameMonth(start, end)) {
          return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
        }
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      case 'month': return format(currentDate, 'MMMM yyyy');
      case 'year': return format(currentDate, 'yyyy');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <h2 className="text-base sm:text-lg font-bold text-primary-950 tracking-tight uppercase truncate">{getHeaderTitle()}</h2>
          <div className="flex items-center gap-1 border border-slate-300 rounded overflow-hidden shrink-0">
             <button onClick={handlePrevious} className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
             <button onClick={handleToday} className="px-3 py-1.5 text-xs font-bold text-primary-950 uppercase tracking-widest hover:bg-slate-50 transition-colors border-x border-slate-300">Today</button>
             <button onClick={handleNext} className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        
        <div className="flex gap-3 items-center flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex bg-slate-100 p-1 rounded flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {(['Day', 'Week', 'Month', 'Year', 'Schedule'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode.toLowerCase() as ViewMode)}
                className={`flex-1 sm:flex-none text-center px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded transition-colors ${
                  viewMode === mode.toLowerCase()
                    ? 'bg-white shadow-sm text-primary-950'
                    : 'text-slate-500 hover:text-primary-950'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <button 
              onClick={() => onCreateReservationOnDate(format(currentDate, 'yyyy-MM-dd'))}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-primary-950 rounded text-xs font-bold uppercase tracking-wide transition-colors shadow-sm"
            >
              <CalendarPlus2 className="w-3.5 h-3.5" />
              Book Room
            </button>
            <button onClick={() => onTriggerPrint ? onTriggerPrint('calendar') : window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm min-h-[600px]">
         {viewMode === 'day' && renderDayView()}
         {viewMode === 'schedule' && renderScheduleView()}
         {viewMode === 'week' && renderWeekView()}
         {viewMode === 'month' && renderMonthView()}
         {viewMode === 'year' && renderYearView()}
      </div>
    </div>
  );
}

