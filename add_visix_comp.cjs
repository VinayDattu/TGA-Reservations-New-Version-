const fs = require('fs');

let content = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

// Insert import
content = content.replace(
  "import { ROOMS_DATA",
  "import { VisixRoomStatus } from '../components/VisixRoomStatus';\nimport { ROOMS_DATA"
);

// Find a good spot to insert the Visix panel in the UI.
// Looking for something like `<!-- End Statistics Summary -->` or right before the "Upcoming Bookings" table.

content = content.replace(
  /{ \/\* Active Facility Map \& Utilization \*\/ }/,
  `<VisixRoomStatus />\n\n        { /* Active Facility Map & Utilization */ }`
);

fs.writeFileSync('src/views/DashboardView.tsx', content, 'utf8');
