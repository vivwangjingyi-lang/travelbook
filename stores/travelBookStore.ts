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
  createdAt: string;
  parentId?: string;
}

export interface CanvasPOI extends POI {
  x: number;
  y: number;
  originalId?: string;
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

// 交通票务接口
export interface TransportationTicket {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'other';
  provider: string;
  ticketNumber: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: string;
  class: string;
  notes?: string;
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
  transportationTickets?: TransportationTicket[];
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
  initNewBook: () => void;
  /** @deprecated 使用 initNewBook() + saveBook() 代替 */
  createBook: (title: string, description: string, startDate: string, endDate: string) => void;
  // 错误处理
  setError: (error: string | null) => void;
  clearError: () => void;
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
      visitTime: '2 hours',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-2',
      name: 'Louvre Museum',
      category: 'sightseeing',
      visitTime: '3 hours',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-3',
      name: 'Notre-Dame Cathedral',
      category: 'sightseeing',
      visitTime: '1.5 hours',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-4',
      name: 'Montmartre',
      category: 'sightseeing',
      visitTime: '2 hours',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-5',
      name: 'Le Grand Paris Hotel',
      category: 'accommodation',
      visitTime: 'Overnight',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-6',
      name: 'Café de Flore',
      category: 'food',
      visitTime: '1 hour',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-7',
      name: 'Champs-Élysées',
      category: 'shopping',
      visitTime: '2 hours',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'poi-8',
      name: 'Seine River Cruise',
      category: 'entertainment',
      visitTime: '1.5 hours',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];

  const initialCanvasPOIs: CanvasPOI[] = [
    {
      id: 'canvas-poi-1',
      name: 'Eiffel Tower',
      category: 'sightseeing',
      visitTime: '2 hours',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      x: 150,
      y: 100
    },
    {
      id: 'canvas-poi-2',
      name: 'Louvre Museum',
      category: 'sightseeing',
      visitTime: '3 hours',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      x: 400,
      y: 200
    },
    {
      id: 'canvas-poi-3',
      name: 'Le Grand Paris Hotel',
      category: 'accommodation',
      visitTime: 'Overnight',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      x: 250,
      y: 350
    },
    {
      id: 'canvas-poi-4',
      name: 'Café de Flore',
      category: 'food',
      visitTime: '1 hour',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      x: 500,
      y: 150
    },
    {
      id: 'canvas-poi-5',
      name: 'Champs-Élysées',
      category: 'shopping',
      visitTime: '2 hours',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
  // 错误处理方法
  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  initNewBook: () => {
    const newBook: TravelBook = {
      id: nanoid(),
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      pois: [],
      canvasPois: [],
      dailyItineraries: [],
      memos: [],
      transportationTickets: []
    };

    set({
      currentBook: newBook,
      currentBookSnapshot: JSON.parse(JSON.stringify(newBook)),
      isDirty: true // Mark as dirty since it's a new, unsaved book
    });
  },

  /** @deprecated 使用 initNewBook() + saveBook() 代替 */
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
      memos: [],
      transportationTickets: []
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

      const isNewBook = !state.books.some(b => b.id === state.currentBook!.id);

      let updatedBooks;
      if (isNewBook) {
        updatedBooks = [...state.books, state.currentBook!];
      } else {
        updatedBooks = state.books.map(b =>
          b.id === state.currentBook!.id ? state.currentBook! : b
        );
      }

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
        isLoading: false,
        error: 'Failed to load travel books'
        // 保留现有的books数组，避免在加载失败时丢失数据
      });
    }
  },

  // POI management
  addPOI: (poi) => {
    const newPOI: POI = {
      ...poi,
      id: nanoid(),
      createdAt: new Date().toISOString()
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
    set((state) => {
      if (!state.currentBook) return state;

      // 1. 过滤掉要删除的 POI
      const updatedPOIs = state.currentBook.pois.filter((p) => p.id !== poiId);

      // 2. 处理下属地点：将原来以该 POI 为父级的点的 parentId 置空
      const finalPOIs = updatedPOIs.map(p =>
        p.parentId === poiId ? { ...p, parentId: undefined } : p
      );

      // 3. 同时也要处理 canvasPois 中的关联
      const updatedCanvasPois = state.currentBook.canvasPois.map(p =>
        p.parentId === poiId ? { ...p, parentId: undefined } : p
      );

      return {
        currentBook: {
          ...state.currentBook,
          pois: finalPOIs,
          canvasPois: updatedCanvasPois
        },
        isDirty: true
      };
    });
  },

  // Canvas POI management
  addCanvasPOI: (poi) => {
    const newCanvasPOI: CanvasPOI = {
      ...poi,
      id: nanoid(),
      originalId: poi.originalId || (poi as any).id // 优先使用已存在的 originalId，或从传入的 POI 对象中提取 id
    };
    set((state) => ({
      currentBook: state.currentBook
        ? { ...state.currentBook, canvasPois: [...state.currentBook.canvasPois, newCanvasPOI] }
        : null,
      isDirty: true
    }));
  },

  updateCanvasPOI: (poiId, poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      const currentCanvasPois = state.currentBook.canvasPois;
      const targetPoi = currentCanvasPois.find(p => p.id === poiId);

      if (!targetPoi) return state;

      // 计算偏移量（如果提供了新坐标）
      const dx = poi.x !== undefined ? poi.x - targetPoi.x : 0;
      const dy = poi.y !== undefined ? poi.y - targetPoi.y : 0;

      const updatedCanvasPois = currentCanvasPois.map((p) => {
        // 更新目标 POI
        if (p.id === poiId) {
          return { ...p, ...poi };
        }

        // 如果目标 POI 是当前 POI 的父级，且坐标发生了变化，则同步偏移子级
        // 注意：在 CanvasPOI 中，parentId 对应的是父节点的 originalId 或 id，需要统一逻辑
        // 根据 deleteCanvasPOI 的逻辑，parentId 存储的是被删除点的 id
        if ((dx !== 0 || dy !== 0) && p.parentId === targetPoi.originalId) {
          return {
            ...p,
            x: p.x + dx,
            y: p.y + dy
          };
        }

        return p;
      });

      return {
        currentBook: {
          ...state.currentBook,
          canvasPois: updatedCanvasPois
        },
        isDirty: true
      };
    });
  },

  deleteCanvasPOI: (poiId) => {
    set((state) => {
      if (!state.currentBook) return state;

      const targetPoi = state.currentBook.canvasPois.find(p => p.id === poiId);
      if (!targetPoi) return state;

      const filteredCanvasPOIs = state.currentBook.canvasPois.filter((p) => p.id !== poiId);

      // 平级化下属地点：使用 originalId 进行匹配
      const finalCanvasPOIs = filteredCanvasPOIs.map(p =>
        (p.parentId && p.parentId === targetPoi.originalId) ? { ...p, parentId: undefined } : p
      );

      return {
        currentBook: {
          ...state.currentBook,
          canvasPois: finalCanvasPOIs
        },
        isDirty: true
      };
    });
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
