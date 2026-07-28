import React, { useState } from 'react';
import { Printer, Edit, Search, X, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Reservation } from '../types';

type SortColumn = 'confirmationNumber' | 'date' | 'time' | 'department' | 'room' | 'groupName' | 'status' | null;
type SortDirection = 'asc' | 'desc';

interface ListViewProps {
  reservations: Reservation[];
  onEditReservation: (res: Reservation) => void;
  onTriggerPrint?: (view: 'list') => void;
}

export default function ListView({ reservations, onEditReservation, onTriggerPrint }: ListViewProps) {
  const [typedTerm, setTypedTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(typedTerm);
  };

  const handleClearSearch = () => {
    setTypedTerm('');
    setSearchQuery('');
  };
  
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-primary-950 ml-1 inline-block" /> 
      : <ChevronDown className="w-3 h-3 text-primary-950 ml-1 inline-block" />;
  };

  const filteredReservations = reservations.filter(res => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      res.confirmationNumber.toLowerCase().includes(term) ||
      res.groupName.toLowerCase().includes(term) ||
      res.department.toLowerCase().includes(term) ||
      res.room.toLowerCase().includes(term)
    );
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aVal: string | number = a[sortColumn] || '';
    let bVal: string | number = b[sortColumn] || '';

    if (sortColumn === 'date') {
      aVal = new Date(a.date).getTime() || 0;
      bVal = new Date(b.date).getTime() || 0;
    } else if (sortColumn === 'time') {
      const aTime = new Date(`1970/01/01 ${a.time}`).getTime() || 0;
      const bTime = new Date(`1970/01/01 ${b.time}`).getTime() || 0;
      aVal = aTime;
      bVal = bTime;
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-bold text-primary-950 uppercase">List View</h2>
        <button onClick={() => onTriggerPrint ? onTriggerPrint('list') : window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded text-sm font-bold text-slate-700 uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-sm">
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xs font-bold text-primary-950 uppercase">All Reservations Directory</h2>
          
          {/* Search form with a dedicated Search Button */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto items-center print:hidden">
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search by Conf #, Room, Group..."
                value={typedTerm}
                onChange={(e) => setTypedTerm(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono pr-8"
              />
              {typedTerm && (
                <button 
                  type="button" 
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="bg-primary-950 hover:bg-primary-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest bg-slate-50/50">
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors" onClick={() => handleSort('confirmationNumber')}>
                  <div className="flex items-center">Conf # <SortIcon column="confirmationNumber" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center">Date <SortIcon column="date" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors" onClick={() => handleSort('time')}>
                  <div className="flex items-center">Time <SortIcon column="time" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center">Department <SortIcon column="department" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors" onClick={() => handleSort('room')}>
                  <div className="flex items-center">Room <SortIcon column="room" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors" onClick={() => handleSort('groupName')}>
                  <div className="flex items-center">Group <SortIcon column="groupName" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-100 group select-none transition-colors text-right" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-end">Status <SortIcon column="status" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReservations.length > 0 ? (
                sortedReservations.map(res => (
                  <tr 
                    key={res.id} 
                    onClick={() => onEditReservation(res)}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                    title="Click to Edit Reservation"
                  >
                    <td className="p-4 font-mono font-bold text-primary-950 group-hover:text-accent-600 transition-colors">{res.confirmationNumber}</td>
                    <td className="p-4 font-medium text-primary-950">{res.date}</td>
                    <td className="p-4 text-slate-600">{res.time}</td>
                    <td className="p-4 text-slate-600">{res.department}</td>
                    <td className="p-4 text-slate-600">{res.room}</td>
                    <td className="p-4 text-slate-600 font-medium">{res.groupName}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-3 h-full">
                      <span className="text-[11px] text-accent-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 print:hidden">
                        <Edit className="w-3 h-3" /> EDIT
                      </span>
                      <span className={`px-2 py-1 inline-flex rounded text-[10px] font-bold uppercase tracking-wider ${res.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-accent-100 text-amber-800'}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    {searchQuery ? `No reservations found matching "${searchQuery}"` : "No reservations recorded."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
