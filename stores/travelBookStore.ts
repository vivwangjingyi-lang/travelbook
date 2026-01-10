import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { loadFromIndexedDB, saveToIndexedDB, isIndexedDBSupported } from '@/utils/indexedDBUtils';

export type POICategory = 'accommodation' | 'sightseeing' | 'food' | 'entertainment' | 'shopping' | 'transportation';

export type TransportationType = 'walk' | 'bus' | 'taxi' | 'train' | 'car' | 'bike';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  visitTime: string;
  notes?: string;
}

export interface CanvasPOI extends POI {
  x: number;
  y: number;
}

export interface DailyPOI {
  poiId: string;
  order: number;
}

export interface Route {
  id: string;
  fromPoiId: string;
  toPoiId: string;
  transportation: TransportationType;
  duration: string;
}

export interface DailyItinerary {
  day: number;
  selectedPoiIds: string[];
  orderedPois: DailyPOI[];
  routes: Route[];
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  date: string;
  pinned?: boolean;
}

export interface TravelBook {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination?: string;
  companions?: string;
  coverImage?: string;
  pois: POI[];
  canvasPois: CanvasPOI[];
  dailyItineraries: DailyItinerary[];
  memos: Memo[];
}

interface TravelBookState {
  books: TravelBook[];
  currentBook: TravelBook | null;
  currentBookSnapshot: TravelBook | null;
  currentDay: number;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Book management
  createBook: (title: string, description: string, startDate: string, endDate: string) => void;
  selectBook: (bookId: string) => void;
  updateBook: (book: Partial<TravelBook>) => void;
  deleteBook: (bookId: string) => void;
  saveBook: () => void;
  resetBook: () => void;
  loadBooks: () => void;
  
  // POI management
  addPOI: (poi: Omit<POI, 'id'>) => void;
  updatePOI: (poiId: string, poi: Partial<POI>) => void;
  deletePOI: (poiId: string) => void;
  
  // Canvas POI management
  addCanvasPOI: (poi: Omit<CanvasPOI, 'id'>) => void;
  updateCanvasPOI: (poiId: string, poi: Partial<CanvasPOI>) => void;
  deleteCanvasPOI: (poiId: string) => void;
  
  // Daily itinerary management
  setCurrentDay: (day: number) => void;
  getDailyItinerary: (day: number) => DailyItinerary | undefined;
  ensureDailyItinerary: (day: number) => void;
  togglePoiSelection: (day: number, poiId: string) => void;
  reorderDailyPois: (day: number, orderedPois: DailyPOI[]) => void;
  
  // Route management
  addRoute: (day: number, route: Omit<Route, 'id'>) => void;
  updateRoute: (day: number, routeId: string, route: Partial<Route>) => void;
  deleteRoute: (day: number, routeId: string) => void;
  
  // Memo management
  addMemo: (title: string, content: string) => void;
  updateMemo: (memoId: string, title: string, content: string) => void;
  deleteMemo: (memoId: string) => void;
  toggleMemoPin: (memoId: string) => void;
}

// Create initial test data for development
const createInitialTestData = (): TravelBook => {
  const initialPOIs: POI[] = [
    {
      id: 'poi-1',
      name: 'Eiffel Tower',
      category: 'sightseeing',
      visitTime: '2 hours'
    },
    {
      id: 'poi-2',
      name: 'Louvre Museum',
      category: 'sightseeing',
      visitTime: '3 hours'
    },
    {
      id: 'poi-3',
      name: 'Notre-Dame Cathedral',
      category: 'sightseeing',
      visitTime: '1.5 hours'
    },
    {
      id: 'poi-4',
      name: 'Montmartre',
      category: 'sightseeing',
      visitTime: '2 hours'
    },
    {
      id: 'poi-5',
      name: 'Le Grand Paris Hotel',
      category: 'accommodation',
      visitTime: 'Overnight'
    },
    {
      id: 'poi-6',
      name: 'Café de Flore',
      category: 'food',
      visitTime: '1 hour'
    },
    {
      id: 'poi-7',
      name: 'Champs-Élysées',
      category: 'shopping',
      visitTime: '2 hours'
    },
    {
      id: 'poi-8',
      name: 'Seine River Cruise',
      category: 'entertainment',
      visitTime: '1.5 hours'
    }
  ];

  const initialCanvasPOIs: CanvasPOI[] = [
    {
      id: 'canvas-poi-1',
      name: 'Eiffel Tower',
      category: 'sightseeing',
      visitTime: '2 hours',
      x: 150,
      y: 100
    },
    {
      id: 'canvas-poi-2',
      name: 'Louvre Museum',
      category: 'sightseeing',
      visitTime: '3 hours',
      x: 400,
      y: 200
    },
    {
      id: 'canvas-poi-3',
      name: 'Le Grand Paris Hotel',
      category: 'accommodation',
      visitTime: 'Overnight',
      x: 250,
      y: 350
    },
    {
      id: 'canvas-poi-4',
      name: 'Café de Flore',
      category: 'food',
      visitTime: '1 hour',
      x: 500,
      y: 150
    },
    {
      id: 'canvas-poi-5',
      name: 'Champs-Élysées',
      category: 'shopping',
      visitTime: '2 hours',
      x: 300,
      y: 250
    }
  ];

  return {
    id: 'book-1',
    title: 'Paris Adventure',
    description: 'A wonderful trip to the City of Lights',
    startDate: '2023-06-15',
    endDate: '2023-06-20',
    pois: initialPOIs,
    canvasPois: initialCanvasPOIs,
    dailyItineraries: [],
    memos: []
  };
};

// Storage functions using IndexedDB
const loadFromStorage = async (): Promise<TravelBook[]> => {
  try {
    if (isIndexedDBSupported()) {
      const books = await loadFromIndexedDB<TravelBook>();
      return books;
    } else {
      console.warn('IndexedDB not supported, falling back to localStorage');
      // Fallback to localStorage if IndexedDB is not supported
      const stored = localStorage.getItem('travelbooks');
      return stored ? JSON.parse(stored) : [];
    }
  } catch (error) {
    console.error('Error loading books from storage:', error);
    return [];
  }
};

const saveToStorage = async (books: TravelBook[]) => {
  try {
    if (isIndexedDBSupported()) {
      await saveToIndexedDB(books);
    } else {
      console.warn('IndexedDB not supported, falling back to localStorage');
      // Fallback to localStorage with size checks
      const booksJson = JSON.stringify(books);
      localStorage.setItem('travelbooks', booksJson);
    }
  } catch (error) {
    console.error('Error saving books to storage:', error);
  }
};

export const useTravelBookStore = create<TravelBookState>((set, get) => ({
  books: [],
  currentBook: null,
  currentBookSnapshot: null,
  currentDay: 1,
  isLoading: false,
  error: null,
  isDirty: false,

  // Book management
  createBook: (title, description, startDate, endDate) => {
    const newBook: TravelBook = {
      id: nanoid(),
      title,
      description,
      startDate,
      endDate,
      pois: [],
      canvasPois: [],
      dailyItineraries: [],
      memos: []
    };
    
    const updatedBooks = [...get().books, newBook];
    
    // Save asynchronously
    saveToStorage(updatedBooks).catch(error => {
      console.error('Error saving new book:', error);
    });
    
    set({
      books: updatedBooks,
      currentBook: newBook,
      currentBookSnapshot: JSON.parse(JSON.stringify(newBook)),
      isDirty: false
    });
  },

  selectBook: (bookId) => {
    const book = get().books.find(b => b.id === bookId);
    if (book) {
      set({
        currentBook: book,
        currentBookSnapshot: JSON.parse(JSON.stringify(book)),
        isDirty: false
      });
    }
  },

  updateBook: (book) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const updatedCurrentBook = { ...state.currentBook, ...book };
      
      return {
        currentBook: updatedCurrentBook,
        isDirty: true
      };
    });
  },

  deleteBook: (bookId) => {
    const updatedBooks = get().books.filter(b => b.id !== bookId);
    
    // Save asynchronously
    saveToStorage(updatedBooks).catch(error => {
      console.error('Error deleting book:', error);
    });
    
    set((state) => ({
      books: updatedBooks,
      currentBook: state.currentBook?.id === bookId ? null : state.currentBook,
      currentBookSnapshot: state.currentBook?.id === bookId ? null : state.currentBookSnapshot,
      isDirty: state.currentBook?.id === bookId ? false : state.isDirty
    }));
  },

  saveBook: () => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const updatedBooks = state.books.map(b => 
        b.id === state.currentBook!.id ? state.currentBook! : b
      );
      
      // Save asynchronously
      saveToStorage(updatedBooks).catch(error => {
        console.error('Error saving book:', error);
      });
      
      return {
        books: updatedBooks,
        currentBookSnapshot: JSON.parse(JSON.stringify(state.currentBook)),
        isDirty: false
      };
    });
  },

  resetBook: () => {
    set((state) => ({
      currentBook: state.currentBookSnapshot,
      isDirty: false
    }));
  },

  loadBooks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const books = await loadFromStorage();
      set({ books, isLoading: false });
    } catch (error) {
      console.error('Error loading books:', error);
      set({ 
        books: [], 
        isLoading: false, 
        error: 'Failed to load travel books' 
      });
    }
  },

  // POI management
  addPOI: (poi) => {
    const newPOI: POI = {
      ...poi,
      id: nanoid()
    };
    set((state) => ({
      currentBook: state.currentBook
        ? { ...state.currentBook, pois: [...state.currentBook.pois, newPOI] }
        : null,
      isDirty: true
    }));
  },

  updatePOI: (poiId, poi) => {
    set((state) => ({
      currentBook: state.currentBook
        ? {
            ...state.currentBook,
            pois: state.currentBook.pois.map((p) =>
              p.id === poiId ? { ...p, ...poi } : p
            )
          }
        : null,
      isDirty: true
    }));
  },

  deletePOI: (poiId) => {
    set((state) => ({
      currentBook: state.currentBook
        ? {
            ...state.currentBook,
            pois: state.currentBook.pois.filter((p) => p.id !== poiId)
          }
        : null,
      isDirty: true
    }));
  },

  // Canvas POI management
  addCanvasPOI: (poi) => {
    const newCanvasPOI: CanvasPOI = {
      ...poi,
      id: nanoid()
    };
    set((state) => ({
      currentBook: state.currentBook
        ? { ...state.currentBook, canvasPois: [...state.currentBook.canvasPois, newCanvasPOI] }
        : null,
      isDirty: true
    }));
  },

  updateCanvasPOI: (poiId, poi) => {
    set((state) => ({
      currentBook: state.currentBook
        ? {
            ...state.currentBook,
            canvasPois: state.currentBook.canvasPois.map((p) =>
              p.id === poiId ? { ...p, ...poi } : p
            )
          }
        : null,
      isDirty: true
    }));
  },

  deleteCanvasPOI: (poiId) => {
    set((state) => ({
      currentBook: state.currentBook
        ? {
            ...state.currentBook,
            canvasPois: state.currentBook.canvasPois.filter((p) => p.id !== poiId)
          }
        : null,
      isDirty: true
    }));
  },

  // Daily itinerary management
  setCurrentDay: (day) => {
    set({ currentDay: day });
  },

  getDailyItinerary: (day) => {
    const { currentBook } = get();
    return currentBook?.dailyItineraries.find((itinerary) => itinerary.day === day);
  },

  ensureDailyItinerary: (day) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const existingItinerary = state.currentBook.dailyItineraries.find(
        (itinerary) => itinerary.day === day
      );
      
      if (existingItinerary) return state;
      
      const newItinerary: DailyItinerary = {
        day,
        selectedPoiIds: [],
        orderedPois: [],
        routes: []
      };
      
      return {
        currentBook: {
          ...state.currentBook,
          dailyItineraries: [...state.currentBook.dailyItineraries, newItinerary]
        },
        isDirty: true
      };
    });
  },

  togglePoiSelection: (day, poiId) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );
      
      if (itineraryIndex === -1) {
        // If itinerary doesn't exist, create it
        const newItinerary: DailyItinerary = {
          day,
          selectedPoiIds: [poiId],
          orderedPois: [],
          routes: []
        };
        dailyItineraries.push(newItinerary);
      } else {
        // Toggle POI selection
        const itinerary = dailyItineraries[itineraryIndex];
        const isSelected = itinerary.selectedPoiIds.includes(poiId);
        
        if (isSelected) {
          // Remove from selection
          itinerary.selectedPoiIds = itinerary.selectedPoiIds.filter(
            (id) => id !== poiId
          );
          // Also remove from ordered POIs
          itinerary.orderedPois = itinerary.orderedPois.filter(
            (op) => op.poiId !== poiId
          );
          // Reorder the remaining POIs
          itinerary.orderedPois.forEach((op, index) => {
            op.order = index + 1;
          });
        } else {
          // Add to selection
          itinerary.selectedPoiIds.push(poiId);
        }
        
        dailyItineraries[itineraryIndex] = itinerary;
      }
      
      return {
        currentBook: {
          ...state.currentBook,
          dailyItineraries
        },
        isDirty: true
      };
    });
  },

  reorderDailyPois: (day, orderedPois) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );
      
      if (itineraryIndex === -1) return state;
      
      dailyItineraries[itineraryIndex] = {
        ...dailyItineraries[itineraryIndex],
        orderedPois
      };
      
      return {
        currentBook: {
          ...state.currentBook,
          dailyItineraries
        },
        isDirty: true
      };
    });
  },

  // Route management
  addRoute: (day, route) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );
      
      if (itineraryIndex === -1) return state;
      
      const newRoute: Route = {
        ...route,
        id: nanoid()
      };
      
      dailyItineraries[itineraryIndex] = {
        ...dailyItineraries[itineraryIndex],
        routes: [...dailyItineraries[itineraryIndex].routes, newRoute]
      };
      
      return {
        currentBook: {
          ...state.currentBook,
          dailyItineraries
        },
        isDirty: true
      };
    });
  },

  updateRoute: (day, routeId, route) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );
      
      if (itineraryIndex === -1) return state;
      
      dailyItineraries[itineraryIndex] = {
        ...dailyItineraries[itineraryIndex],
        routes: dailyItineraries[itineraryIndex].routes.map((r) =>
          r.id === routeId ? { ...r, ...route } : r
        )
      };
      
      return {
        currentBook: {
          ...state.currentBook,
          dailyItineraries
        },
        isDirty: true
      };
    });
  },

  deleteRoute: (day, routeId) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );
      
      if (itineraryIndex === -1) return state;
      
      dailyItineraries[itineraryIndex] = {
        ...dailyItineraries[itineraryIndex],
        routes: dailyItineraries[itineraryIndex].routes.filter(
          (r) => r.id !== routeId
        )
      };
      
      return {
        currentBook: {
          ...state.currentBook,
          dailyItineraries
        },
        isDirty: true
      };
    });
  },

  // Memo management
  addMemo: (title, content) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      const newMemo = {
        id: nanoid(),
        title,
        content,
        date: new Date().toISOString(),
        pinned: false
      };
      
      return {
        currentBook: {
          ...state.currentBook,
          memos: [...state.currentBook.memos, newMemo]
        },
        isDirty: true
      };
    });
  },

  updateMemo: (memoId, title, content) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      return {
        currentBook: {
          ...state.currentBook,
          memos: state.currentBook.memos.map(memo => 
            memo.id === memoId ? { ...memo, title, content } : memo
          )
        },
        isDirty: true
      };
    });
  },

  deleteMemo: (memoId) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      return {
        currentBook: {
          ...state.currentBook,
          memos: state.currentBook.memos.filter(memo => memo.id !== memoId)
        },
        isDirty: true
      };
    });
  },

  toggleMemoPin: (memoId) => {
    set((state) => {
      if (!state.currentBook) return state;
      
      return {
        currentBook: {
          ...state.currentBook,
          memos: state.currentBook.memos.map(memo => 
            memo.id === memoId ? { ...memo, pinned: !memo.pinned } : memo
          )
        },
        isDirty: true
      };
    });
  }
}));
