const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import
content = content.replace(
  "import CalendarView from './views/CalendarView';",
  "import CalendarView from './views/CalendarView';\nimport WeeklyScheduleView from './views/WeeklyScheduleView';"
);

// Update view state type
content = content.replace(
  "const [currentView, setCurrentView] = useState<'dashboard'|'calendar'|'list'|'book'|'drafts'|'feedback'>(",
  "const [currentView, setCurrentView] = useState<'dashboard'|'calendar'|'weekly'|'list'|'book'|'drafts'|'feedback'>("
);
content = content.replace(
  "if (view && ['dashboard', 'calendar', 'list', 'book', 'drafts', 'feedback'].includes(view)) {",
  "if (view && ['dashboard', 'calendar', 'weekly', 'list', 'book', 'drafts', 'feedback'].includes(view)) {"
);

// Update nav items
const navItemsTarget = `    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },`;
const navItemsReplacement = `    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'weekly', label: 'Weekly Schedule', icon: CalendarIcon },`;
content = content.replace(navItemsTarget, navItemsReplacement);

// Add the view rendering block
const viewRenderTarget = `{currentView === 'calendar' && (
          <CalendarView 
            reservations={reservations} 
            onEditReservation={handleEditReservation} 
            onCreateReservationOnDate={handleCreateReservationOnDate}
            onTriggerPrint={handleTriggerPrint}
          />
        )}`;

const viewRenderReplacement = `{currentView === 'calendar' && (
          <CalendarView 
            reservations={reservations} 
            onEditReservation={handleEditReservation} 
            onCreateReservationOnDate={handleCreateReservationOnDate}
            onTriggerPrint={handleTriggerPrint}
          />
        )}
        {currentView === 'weekly' && (
          <WeeklyScheduleView
            reservations={reservations}
            onToggleStatus={(res) => {
              const newStatus = res.status === 'Confirmed' ? 'Pending' : 'Confirmed';
              handleSaveReservation({ ...res, status: newStatus });
            }}
          />
        )}`;

content = content.replace(viewRenderTarget, viewRenderReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
