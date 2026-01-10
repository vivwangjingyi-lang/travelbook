# TravelBook - Elegant Travel Planning Application

"Every trip is a story. Where will you go next?"

## Overview

TravelBook is an elegant travel planning application that helps users create, manage, and share complete travel stories. Users can plan journeys in chapters, including basic information, transportation arrangements, point of interest collections, route planning, etc., ultimately forming a beautiful travel book.

## Features

### 📖 Travel Book Management
- Create new travel books with basic journey information
- Save and edit travel details across multiple sessions
- Delete unwanted travel books
- View all travel books in a beautiful library interface

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

#### Chapter 3: Canvas
- Visualize POIs on an interactive canvas
- Drag and drop to arrange POIs
- Create a visual map of your journey destinations

#### Chapter 4: Plot
- Plan daily itineraries
- Order POIs for each day
- Define routes between POIs with transportation details
- Calculate travel times and distances

#### Chapter 5: Epilogue
- Generate journey summaries
- Review daily schedules and transportation routes
- Add and manage travel memos

### 🎨 User Experience
- Beautiful glassmorphism design with floating navigation
- Smooth animations and transitions
- Responsive layout for all devices
- Auto-save functionality to prevent data loss
- Confirmation prompts for unsaved changes

### 💾 Data Storage
- IndexedDB for large storage capacity (50MB+)
- Fallback to localStorage for backward compatibility
- Automatic data persistence

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

## Technology Stack

- **Next.js 16.1.1** - React framework for production
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe JavaScript
- **Zustand 5.0.9** - Lightweight state management
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **IndexedDB** - Browser storage solution
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
│   └── page.tsx            # Home page (Library)
├── components/             # Reusable UI components
├── stores/                 # Zustand state management
├── utils/                  # Utility functions
└── public/                 # Static assets
```

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

### ConfirmationModal
- Reusable modal for user confirmations
- Used for unsaved changes, deletion confirmations, etc.

## Usage

1. **Create a New Journey**
   - Click "Draft New Journey" on the home page
   - Fill in the required fields on the Introduction page
   - Save the book before continuing to other chapters

2. **Plan Your Journey**
   - Navigate through the chapters using the floating navbar
   - Fill in transportation, POIs, and daily itineraries
   - Visualize your journey on the Canvas page

3. **Save and Manage**
   - Your progress is automatically saved
   - Return to the library to access all your travel books
   - Continue editing anytime

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

See `Roadmap.md` for planned features and improvements.

---

*Last Updated: 2026-01-10*
