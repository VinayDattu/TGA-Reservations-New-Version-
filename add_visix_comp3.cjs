const fs = require('fs');
let content = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

if (!content.includes('VisixRoomStatus')) {
  console.log('Component not added');
}

if (!content.includes('import { VisixRoomStatus }')) {
  content = content.replace("import { ROOMS_DATA", "import { VisixRoomStatus } from '../components/VisixRoomStatus';\nimport { ROOMS_DATA");
  fs.writeFileSync('src/views/DashboardView.tsx', content, 'utf8');
}
