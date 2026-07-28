import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

export function VisixRoomStatus() {
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('visixtestA@capitol.tn.gov');

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      const end = new Date(now);
      end.setHours(end.getHours() + 8); // Look ahead 8 hours

      const res = await fetch(`/api/graph/rooms/${selectedRoom}/availability?startTime=${now.toISOString()}&endTime=${end.toISOString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch from Graph API. Ensure the MS_GRAPH_CLIENT_SECRET is set in settings.");
      }
      
      const data = await res.json();
      setAvailability(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded border border-slate-200 shadow-sm col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-950"></span> Visix Panel Integration
        </h2>
        <div className="flex items-center gap-2">
          <select 
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="visixtestA@capitol.tn.gov">Room A (Test)</option>
            <option value="visixtestB@capitol.tn.gov">Room B (Test)</option>
          </select>
          <button 
            onClick={fetchAvailability}
            disabled={loading}
            className="bg-primary-950 hover:bg-primary-900 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : availability ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Live feed from Exchange Online (Graph API):</p>
          <pre className="text-[10px] p-3 bg-slate-50 rounded border border-slate-200 overflow-x-auto text-slate-700">
            {JSON.stringify(availability, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded bg-slate-50">
           <CalendarIcon className="w-8 h-8 text-slate-300 mb-2" />
           <p className="text-xs text-slate-400 font-medium">Click "Check Status" to fetch real-time free/busy info.</p>
        </div>
      )}
    </div>
  );
}
