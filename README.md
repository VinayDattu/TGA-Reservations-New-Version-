# TNGA Reservation System

> Room reservation system for Tennessee General Assembly (Senate, House, and Joint Chambers)

[![React](https://img.shields.io/badge/React-19.0.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.14-cyan.svg)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Architecture](#️-architecture)
- [Documentation](#-documentation)
- [Development](#-development)
- [Contributing](#-contributing)

## 🎯 Overview

The TNGA Reservation System streamlines the process of booking and managing rooms within the Tennessee General Assembly. Built with modern React and TypeScript, it provides an intuitive interface for scheduling meetings, events, and legislative sessions.

### Current Status
- **Frontend**: ✅ 95% Complete - Full UI/UX implementation
- **Backend**: 🚧 In Development - API integration in progress
- **Refactoring**: 🔄 Phases 1-4 complete (see [REFACTORING-PROGRESS.md](docs/REFACTORING-PROGRESS.md))

## ✨ Features

- 📅 **Calendar View** - Visual scheduling with drag-and-drop
- 📝 **Booking Form** - Comprehensive reservation details
- 📊 **Dashboard** - Overview of upcoming reservations
- 📋 **List View** - Filterable reservation list
- 💾 **Draft System** - Auto-save incomplete reservations
- 🔍 **Search** - Filter by room, date, department
- 📱 **Responsive** - Mobile-friendly design
- 🌓 **Dark Mode** - Theme toggle support
- ⚡ **Conflict Detection** - Automatic booking validation

## 📁 Project Structure

```
.
├── docs/                          # 📚 Documentation
│
├── scripts/                       # 🛠️ Utility/migration scripts
│   ├── *.cjs                      # Node scripts (CommonJS)
│   └── *.js                       # Migration scripts
│
├── tests/                         # 🧪 Tests and test files
│   └── test.html
│
├── src/                           # 💻 Source code (refactored)
│   ├── config/                    # Configuration
│   │   └── environment.ts         # Environment variables
│   ├── constants/                 # Organized constants
│   │   ├── departments.ts         # Department data
│   │   ├── rooms.ts               # Room configurations
│   │   ├── setupTypes.ts          # Setup types
│   │   ├── storageKeys.ts         # LocalStorage keys
│   │   └── timeSlots.ts           # Time slot definitions
│   ├── hooks/                     # Custom React hooks
│   │   ├── useReservations.ts     # Reservation logic
│   │   ├── useDrafts.ts           # Draft management
│   │   ├── useTheme.ts            # Theme management
│   │   └── useLocalStorage.ts     # Generic storage hook
│   ├── services/                  # Service layer (storage/API abstraction)
│   │   ├── reservation/           # Reservation services
│   │   ├── draft/                 # Draft services
│   │   └── storage/               # Storage abstraction
│   ├── utils/                     # Pure utility functions
│   │   ├── validation.ts          # Validation helpers
│   │   ├── dateUtils.ts           # Date utilities
│   │   ├── idGenerator.ts         # ID generation
│   │   └── conflictDetection.ts   # Booking conflicts
│   ├── mocks/                     # Mock data
│   ├── components/                # Reusable components
│   │   ├── FormControls.tsx       # Form components
│   │   └── ThemeSettings.tsx      # Theme toggle
│   ├── views/                     # Main views
│   │   ├── BookingForm.tsx        # Reservation form
│   │   ├── CalendarView.tsx       # Calendar interface
│   │   ├── DashboardView.tsx      # Dashboard
│   │   ├── ListView.tsx           # List view
│   │   ├── DraftsView.tsx         # Draft management
│   │   └── FeedbackView.tsx       # Feedback form
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── types.ts                   # TypeScript definitions
│
├── assets/                        # 🎨 Static assets
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── .env.example                   # Environment variables template

```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd TGA-Reservations-New-Version-

# Install dependencies
npm ci

# Copy environment template
cp .env.example .env
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Type Checking
```bash
# Check TypeScript errors
npm run lint
```

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: React 19.0.1 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.3
- **Styling**: Tailwind CSS 4.1.14
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion fork)
- **State Management**: Custom hooks + Context API (refactored)
- **Backend**: Currently localStorage (API integration in progress)

### Design Patterns
- **Service Layer**: Abstraction for easy storage/API swap
- **Custom Hooks**: Reusable stateful logic
- **Factory Pattern**: Service selection based on environment
- **Barrel Exports**: Clean import paths with `@/` alias

### Refactoring Progress
- ✅ **Phase 0**: Project organization complete
- ✅ **Phases 1-4**: Foundation, services, hooks, utils complete
- 🚧 **Phase 5**: Context API in progress
- ⏳ **Phases 6-8**: Component refactoring pending

See [docs/REFACTORING-PROGRESS.md](docs/REFACTORING-PROGRESS.md) for details.

## 📚 Documentation

Comprehensive documentation is available in the [docs/](docs/) folder:

- **[Executive Summary](docs/README-ANALYSIS.md)** - Overview for stakeholders
- **[Gaps Analysis](docs/GAPS-ANALYSIS.md)** - 20 identified gaps (5 critical blockers)
- **[Technical Recommendations](docs/TECHNICAL-RECOMMENDATIONS.md)** - Solutions with code examples
- **[Roadmap](docs/ROADMAP.md)** - Timeline and budget estimates (2-6 weeks)
- **[Refactoring Analysis](docs/REFACTORING-ANALYSIS.md)** - Proposed architecture
- **[Refactoring Progress](docs/REFACTORING-PROGRESS.md)** - Current status tracker
- **[Business Requirements](docs/BUSINESS_REQUIREMENTS.md)** - Business requirements

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK_DATA=true

# Authentication (future)
VITE_ENABLE_AUTH=false
VITE_AUTH_PROVIDER=azure-ad
```

### Path Aliases
The project uses TypeScript path aliases for clean imports:
```typescript
import { useReservations } from '@/hooks';
import { ROOMS_DATA } from '@/constants';
```

## 💻 Development

### Code Structure
- Follow the established folder structure in `src/`
- Use TypeScript strict mode
- Utilize custom hooks for stateful logic
- Keep components focused and single-responsibility
- Use the service layer for data operations

### Available Scripts
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Type check with TypeScript
```

### Testing
- TypeScript compilation: `npm run lint`
- Manual testing: http://localhost:3000
- Test all views: Dashboard, Calendar, List, Booking Form, Drafts

## 🤝 Contributing

### Before Committing
1. ✅ Verify app functionality in browser
2. ✅ Check for TypeScript errors (`npm run lint`)
3. ✅ Check for console errors
4. ✅ Test all views load correctly
5. ✅ Verify data persists in localStorage

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

## 📞 Contact

**Project Lead**: Vinay Datu - vinay.datu@capitol.tn.gov

## 📄 License

© 2026 Tennessee General Assembly. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-28

## 📝 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run dev:server` | Servidor Node (Microsoft Graph - experimental) |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Verificar TypeScript |

## 🧪 Testing

(Pendiente - ver [docs/GAPS-ANALYSIS.md](docs/GAPS-ANALYSIS.md) Gap #18)

## 🤝 Contribuir

1. Revisar [docs/REFACTORING-ANALYSIS.md](docs/REFACTORING-ANALYSIS.md) para entender la arquitectura
2. Crear branch desde `feature/gaps-analysis-and-improvements`
3. Seguir convenciones de código establecidas
4. No hacer commit hasta verificar que todo funciona

## 📞 Contacto

**Project Lead:** Vinay Datu - vinay.datu@capitol.tn.gov

## 📄 Licencia

Privado - Tennessee General Assembly

---

**Última actualización:** 2026-07-28
