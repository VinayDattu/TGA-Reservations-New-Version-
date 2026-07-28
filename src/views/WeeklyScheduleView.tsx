import React, { useState, useMemo } from 'react';
import { Check, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Reservation } from '../types';
import { startOfWeek, endOfWeek, addDays, subWeeks, addWeeks, format, parseISO, isSameDay } from 'date-fns';

interface WeeklyScheduleViewProps {
  reservations: Reservation[];
  onToggleStatus: (res: Reservation) => void;
}

export default function WeeklyScheduleView({ reservations, onToggleStatus }: WeeklyScheduleViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const weekEnd = useMemo(() => addDays(currentWeekStart, 6), [currentWeekStart]);

  const reservationsThisWeek = useMemo(() => {
    return reservations.filter(res => {
      const resDate = parseISO(res.date);
      return resDate >= currentWeekStart && resDate <= weekEnd;
    });
  }, [reservations, currentWeekStart, weekEnd]);

  const confirmedCount = reservationsThisWeek.filter(r => r.status === 'Confirmed').length;
  const totalCount = reservationsThisWeek.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((confirmedCount / totalCount) * 100);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary-950 uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-500" />
            Weekly Schedule
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {format(currentWeekStart, 'MMM d, yyyy')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevWeek} className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 text-xs font-bold uppercase bg-white border border-slate-300 rounded hover:bg-slate-50">
            Current Week
          </button>
          <button onClick={handleNextWeek} className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <h3 className="text-xs font-bold uppercase text-slate-500">Weekly Confirmation Progress</h3>
          <span className="text-sm font-bold text-primary-950">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {confirmedCount} of {totalCount} reservations confirmed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayReservations = reservationsThisWeek.filter(res => isSameDay(parseISO(res.date), day)).sort((a, b) => a.time.localeCompare(b.time));
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className={`flex flex-col bg-white rounded border ${isToday ? 'border-accent-500 shadow-md' : 'border-slate-200 shadow-sm'} overflow-hidden`}>
              <div className={`p-3 border-b text-center ${isToday ? 'bg-accent-50' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{format(day, 'EEE')}</div>
                <div className={`text-lg font-extrabold ${isToday ? 'text-accent-600' : 'text-primary-950'}`}>{format(day, 'd')}</div>
              </div>
              <div className="p-2 flex flex-col gap-2 flex-1 overflow-y-auto min-h-[150px]">
                {dayReservations.length > 0 ? (
                  dayReservations.map(res => (
                    <div 
                      key={res.id} 
                      className={`p-2 text-xs border rounded flex flex-col gap-1 cursor-pointer transition-colors ${
                        res.status === 'Confirmed' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                      onClick={() => onToggleStatus(res)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold truncate">{res.room}</span>
                        {res.status === 'Confirmed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="opacity-80 font-medium truncate">{res.time}</div>
                      <div className="opacity-80 truncate">{res.groupName}</div>
                      <div className="mt-1 text-[9px] uppercase tracking-wider font-bold opacity-75">
                        {res.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4 flex-1 flex items-center justify-center">
                    No bookings
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
