# TravelBook - Elegant Travel Planning Application

"Every trip is a story. Where will you go next?"

## Overview

TravelBook is an elegant travel planning application that helps users create, manage, and share complete travel stories. Users can plan journeys in chapters, including basic information, transportation arrangements, point of interest collections, route planning, etc., ultimately forming a beautiful travel book.

## Key Features

### 📖 Travel Book Management
- Create new travel books with basic journey information
- Save and edit travel details across multiple sessions
- Delete unwanted travel books
- View all travel books in a beautiful library interface
- Multi-language support (English and Chinese)

### 🔐 User Authentication & Cloud Sync (New!)
- **Email/Password Authentication**: Secure login with email verification
- **Cloud Synchronization**: All data automatically synced to Supabase
- **Multi-Device Support**: Access your travel books from any device
- **Local-First Architecture**: Works offline with automatic sync when online
- **Data Security**: Row Level Security (RLS) ensures data privacy

### 🗺️ Journey Planning Workflow

#### Chapter 0: Introduction
- Define journey basic information (name, destination, date range)
- Add companions and journey description
- Upload cover image
- Required field validation for essential information

#### Chapter 1: Departure
- Manage transportation information (flights, trains, etc.)
- Track travel documents and essentials

#### Chapter 2: Collection
- Collect and categorize points of interest (POIs)
- Organize POIs by categories (accommodation, sightseeing, food, etc.)
- Add visit times and notes for each POI
- Search, filter, and sort POIs

#### Chapter 3: Canvas
- Visualize POIs on an interactive canvas
- **World View**: Manage multiple travel scenes and destinations
- **Scene Creation**: Easily add new scenes to your journey
- Drag and drop to arrange POIs
- Create a visual map of your journey destinations
- **Parent-Child POI Relationships**: Define hierarchical relationships between POIs (e.g., theme park → attraction), automatically establishing parent-child connections regardless of addition order
- **Visual Parent-Child Indicators**: Automatic connection lines between parent and child POIs on the canvas

#### Chapter 4: Plot
- Plan daily itineraries
- Order POIs for each day
- Define routes between POIs with transportation details (walk, bus, taxi, train, car, bike)
- Visual POI indicators (child nodes displayed in gray by default)
- Route information displayed in separate component below canvas
- Optimized layer management with visible order badges and adjusted parent/child indicators
- Improved POI spacing and visibility with z-index optimization
- **Scene Switching**: Switch between different travel scenes in the Select Points of Interest interface
- **Cross-Scene POI Selection**: Select POIs from different scenes while maintaining a cumulative list of selected POIs
- **Scene Selection UI**: Intuitive scene selection interface with visual feedback

#### Chapter 5: Epilogue
- Generate personalized journey summaries
- Review daily schedules and transportation routes
- Add and manage travel memos (create, edit, delete, pin)
- Share and export travel books (copy link, export PDF, share)

### 🎨 User Experience
- Beautiful glassmorphism design with floating navigation
- Smooth animations and transitions
- Responsive layout for all devices
- Auto-save functionality to prevent data loss
- Confirmation prompts for unsaved changes

### 💾 Data Storage
- **Supabase PostgreSQL** for cloud storage and sync
- IndexedDB for local-first offline support (50MB+)
- Fallback to localStorage for backward compatibility
- Automatic data persistence and synchronization

## Technology Stack

- **Next.js 16.1.1** - React framework for production
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe JavaScript
- **Zustand 5.0.9** - Lightweight state management
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (PostgreSQL, Auth, Realtime)
- **IndexedDB** - Browser storage solution (local-first)
- **LocalStorage** - Fallback storage mechanism

## Project Structure

```
travelbook/
├── app/
│   ├── introduction/       # Chapter 0: Journey basic info
│   ├── departure/          # Chapter 1: Transportation
│   ├── collection/         # Chapter 2: POI collection
│   ├── canvas/             # Chapter 3: Visual canvas
│   ├── plot/               # Chapter 4: Itinerary planning
│   ├── epilogue/           # Chapter 5: Journey summary
│   ├── library/            # Travel book library
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
├── stores/                 # Zustand state management
├── utils/                  # Utility functions (i18n, storage)
└── public/                 # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vivwangjingyi-lang/travelbook.git
cd travelbook
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
# or
yarn build
```

## Usage

### Creating a New Travel Book
1. Click "Create New Book" on the home page
2. Fill in the required fields on the Introduction page
3. Save the book before continuing to other chapters

### Planning Your Journey
1. Navigate through the chapters using the floating navbar
2. Fill in transportation, POIs, and daily itineraries
3. Visualize your journey on the Canvas page
4. Plan your daily schedule on the Plot page

### Managing Your Travel Books
1. Return to the library to access all your travel books
2. Continue editing anytime
3. Delete unwanted travel books with confirmation

## Key Components

### FloatingNavbar
- Fixed position floating navigation
- Glassmorphism design
- Chapter navigation with current chapter indication
- Back to library functionality

### TravelCanvas
- Interactive canvas for POI visualization
- Drag and drop functionality
- Visual feedback for user interactions

### POI Management
- Add, edit, delete, and categorize points of interest
- Search and filter functionality
- Visual representation on canvas

### Memo System
- Create and manage travel memos
- Pin important memos for quick access
- Search and filter memos

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Configuration

After deployment, update Supabase Authentication settings:
- **Site URL**: Your Vercel domain (e.g., `https://your-app.vercel.app`)
- **Redirect URLs**: Add `https://your-app.vercel.app/auth/callback`

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

See `Roadmap.md` for planned features and improvements.

---

*Last Updated: 2026-01-15*