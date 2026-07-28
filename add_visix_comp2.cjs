const fs = require('fs');
let content = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

const targetStr = "      {/* ACTION ALERTS AND NOTIFICATIONS HUB */}";
const newStr = "      {/* ACTION ALERTS AND NOTIFICATIONS HUB */}\n\n      {/* VISIX PANEL INTEGRATION */}\n      <VisixRoomStatus />\n";

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/views/DashboardView.tsx', content, 'utf8');
