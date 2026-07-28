const fs = require('fs');
let content = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

content = content.replace("import { VisixRoomStatus } from '../components/VisixRoomStatus';\n", "");
content = content.replace("      {/* VISIX PANEL INTEGRATION */}\n      <VisixRoomStatus />\n", "");

fs.writeFileSync('src/views/DashboardView.tsx', content, 'utf8');
