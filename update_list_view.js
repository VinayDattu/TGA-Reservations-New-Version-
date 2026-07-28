const fs = require('fs');

let content = fs.readFileSync('src/views/ListView.tsx', 'utf8');

// replace imports
content = content.replace(
  "import { Printer, Edit, Search, X } from 'lucide-react';",
  "import { Printer, Edit, Search, X, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';"
);

// update component
const stateReplacement = `
  const [typedTerm, setTypedTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  type SortColumn = 'confirmationNumber' | 'date' | 'time' | 'department' | 'room' | 'groupName' | 'status' | null;
  type SortDirection = 'asc' | 'desc';
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

    // Handle special cases like date and time
    if (sortColumn === 'date') {
      aVal = new Date(a.date).getTime() || 0;
      bVal = new Date(b.date).getTime() || 0;
    } else if (sortColumn === 'time') {
      const aTime = new Date(\`1970/01/01 \${a.time}\`).getTime() || 0;
      const bTime = new Date(\`1970/01/01 \${b.time}\`).getTime() || 0;
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
`;

content = content.replace(/  const \[typedTerm, setTypedTerm\] = useState\(''\);[\s\S]*?  }\);/m, stateReplacement.trim());

// replace mapping over filteredReservations to sortedReservations
content = content.replace(/filteredReservations\.length > 0/g, 'sortedReservations.length > 0');
content = content.replace(/filteredReservations\.map/g, 'sortedReservations.map');

// replace the headers
const theadReplacement = `
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
`;

content = content.replace(/            <thead>[\s\S]*?<\/thead>/m, theadReplacement.trim());

fs.writeFileSync('src/views/ListView.tsx', content, 'utf8');
