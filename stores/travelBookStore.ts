import { create } from 'zustand';
import { generateId } from '@/utils/idGenerator';
import { loadFromIndexedDB, saveToIndexedDB, isIndexedDBSupported } from '@/utils/indexedDBUtils';
import { BackendService } from '@/services/backendService';
import { supabase } from '@/lib/supabase';

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
  sceneIds?: string[]; // 所属场景ID数组，支持跨场景复用
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

// 场景接口 - 代表一个目的地/画布
export interface Scene {
  id: string;
  name: string;       // 城市/目的地名称
  x: number;          // 世界地图上的 X 坐标
  y: number;          // 世界地图上的 Y 坐标
  color?: string;     // 主题色
  startDate?: string; // 该场景的开始日期 (可选)
  endDate?: string;   // 该场景的结束日期 (可选)
  pois: CanvasPOI[];  // 该场景内的 POI 布局
  category?: string;  // 场景分类 (beach, city, etc.)
  image?: string;     // 可选图片 URL
}

// 跨场景路线接口 - 代表城市间的交通
export interface InterSceneRoute {
  id: string;
  fromSceneId: string;
  toSceneId: string;
  transportType: 'flight' | 'train' | 'bus' | 'car' | 'ship';
  departureDateTime: string;  // 出发日期时间
  arrivalDateTime: string;    // 到达日期时间
  duration?: string;
  price?: string;
  details?: string;           // 详细信息：航班号、车次等
  notes?: string;             // 备注信息
}

// 场景模板接口 - 用于保存和复用场景
export interface SceneTemplate {
  id: string;
  name: string;               // 模板名称
  description?: string;       // 模板描述
  color?: string;             // 主题色
  samplePOIs: CanvasPOI[];    // 模板包含的POI示例
  createdAt: string;          // 创建时间
}


export interface TravelBook {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination?: string; // 保留用于向后兼容
  companions?: string;
  coverImage?: string;
  pois: POI[];
  canvasPois: CanvasPOI[]; // @deprecated 迁移至 scenes[].pois
  dailyItineraries: DailyItinerary[];
  memos: Memo[];
  transportationTickets?: TransportationTicket[];
  // 多画布支持
  scenes: Scene[];
  activeSceneId: string;
  sceneRoutes: InterSceneRoute[];
}

interface TravelBookState {
  books: TravelBook[];
  currentBook: TravelBook | null;
  currentBookSnapshot: TravelBook | null;
  currentDay: number;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  sceneSwitchNotification: { sceneName: string; message: string; show: boolean } | null;
  sceneTemplates: SceneTemplate[];
  // 场景模板管理方法
  saveSceneAsTemplate: (sceneId: string, templateName: string, description?: string) => void;
  applySceneTemplate: (templateId: string, newSceneName: string, x: number, y: number) => void;
  deleteSceneTemplate: (templateId: string) => void;

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

  // Canvas POI management (deprecated - 使用 Scene POI 方法代替)
  addCanvasPOI: (poi: Omit<CanvasPOI, 'id'>) => void;
  updateCanvasPOI: (poiId: string, poi: Partial<CanvasPOI>) => void;
  deleteCanvasPOI: (poiId: string) => void;

  // Scene POI management (多画布)
  getActiveScenePois: () => CanvasPOI[];
  addScenePOI: (poi: Omit<CanvasPOI, 'id'>) => void;
  updateScenePOI: (poiId: string, poi: Partial<CanvasPOI>) => void;
  deleteScenePOI: (poiId: string) => void;

  // Daily itinerary management
  setCurrentDay: (day: number) => void;
  getDailyItinerary: (day: number) => DailyItinerary | undefined;
  ensureDailyItinerary: (day: number) => void;
  togglePoiSelection: (day: number, poiId: string) => void;
  removePoiSelection: (day: number, poiId: string) => void;
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

  // Scene management (多画布)
  addScene: (name: string, x?: number, y?: number, category?: string, image?: string) => string; // 返回 Scene ID
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  switchScene: (sceneId: string) => void;
  clearSceneSwitchNotification: () => void;
  addSceneRoute: (fromSceneId: string, toSceneId: string, transportType: InterSceneRoute['transportType'], departureDateTime?: string, arrivalDateTime?: string) => void;
  deleteSceneRoute: (routeId: string) => void;
  updateSceneRoute: (routeId: string, updates: Partial<InterSceneRoute>) => void;
  getSceneRoutes: () => InterSceneRoute[];
  getSceneRoutesByDate: () => InterSceneRoute[];
  migrateCanvasPoisToScene: () => void; // 将旧的 canvasPois 迁移到第一个 Scene

  // 场景级日期管理
  getSceneDateForDay: (sceneId: string, day: number) => string;
  getSceneStartDayInBook: (sceneId: string) => number;
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
    memos: [],
    scenes: [],
    activeSceneId: '',
    sceneRoutes: []
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
  sceneSwitchNotification: null,
  sceneTemplates: [], // 场景模板列表

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
      id: generateId(),
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      pois: [],
      canvasPois: [],
      dailyItineraries: [],
      memos: [],
      transportationTickets: [],
      scenes: [],
      activeSceneId: '',
      sceneRoutes: []
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
      id: generateId(),
      title,
      description,
      startDate,
      endDate,
      pois: [],
      canvasPois: [],
      dailyItineraries: [],
      memos: [],
      transportationTickets: [],
      scenes: [],
      activeSceneId: '',
      sceneRoutes: []
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

  saveBook: async () => {
    const { currentBook, books } = get();
    if (!currentBook) return;

    try {
      // 1. 更新本地状态
      const newBook = { ...currentBook, updated_at: new Date().toISOString() };
      const updatedBooks = books.map((b) => (b.id === newBook.id ? newBook : b));
      if (!updatedBooks.find((b) => b.id === newBook.id)) {
        updatedBooks.push(newBook);
      }

      set({
        books: updatedBooks,
        currentBook: newBook,
        currentBookSnapshot: JSON.parse(JSON.stringify(newBook)), // Update snapshot
        isDirty: false
      });

      // 2. 保存到本地存储
      if (isIndexedDBSupported()) {
        await saveToIndexedDB(updatedBooks);
      } else {
        localStorage.setItem('travelbooks', JSON.stringify(updatedBooks));
      }

      // 3. 保存到云端（如果已登录）
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 不等待云端保存完成，也不阻以此断流程（后台静默同步）
        BackendService.saveBook(newBook).catch(err => {
          console.error('Error saving to cloud:', err);
          // TODO: 添加重试队列或错误提示
        });
      }

    } catch (error: any) {
      console.error('Error saving book:', error);
      // set({ error: error.message }); // Optional: show error to user
    }
  },

  resetBook: () => {
    set((state) => ({
      currentBook: state.currentBookSnapshot,
      isDirty: false
    }));
  },

  loadBooks: async () => {
    set({ isLoading: true });
    try {
      // 1. 从本地存储加载（本地优先，确保离线可用）
      let localBooks: TravelBook[] = [];
      if (isIndexedDBSupported()) {
        localBooks = await loadFromIndexedDB<TravelBook>();
      } else {
        const stored = localStorage.getItem('travelbooks');
        localBooks = stored ? JSON.parse(stored) : [];
      }
      console.log('loadBooks: Loaded', localBooks.length, 'books from local storage');

      // 数据迁移/清理
      localBooks = localBooks.map(book => ({
        ...book,
        scenes: book.scenes || [],
        activeSceneId: book.activeSceneId || (book.scenes && book.scenes.length > 0 ? book.scenes[0].id : '') || '',
        pois: book.pois || [],
        canvasPois: book.canvasPois || [],
        sceneRoutes: book.sceneRoutes || [],
        dailyItineraries: book.dailyItineraries || [],
        memos: book.memos || [],
        transportationTickets: book.transportationTickets || []
      }));

      // 2. 尝试从云端加载（仅当已登录时）
      // 🔒 安全策略：不再盲目覆盖，而是进行智能合并
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const cloudBooks = await BackendService.loadBooks();
          console.log('loadBooks: Loaded', cloudBooks.length, 'books from cloud');

          // 智能合并：将云端独有的书籍添加到本地列表
          // 但不覆盖本地已有的书籍（保护本地数据完整性）
          const localBookIds = new Set(localBooks.map(b => b.id));
          const newBooksFromCloud = cloudBooks.filter(cb => !localBookIds.has(cb.id));

          if (newBooksFromCloud.length > 0) {
            console.log('loadBooks: Found', newBooksFromCloud.length, 'new books from cloud');
            localBooks = [...localBooks, ...newBooksFromCloud];
            // 将合并后的数据同步回本地存储
            if (isIndexedDBSupported()) {
              await saveToIndexedDB(localBooks);
            } else {
              localStorage.setItem('travelbooks', JSON.stringify(localBooks));
            }
          }
        } catch (cloudError) {
          console.error('loadBooks: Error loading from cloud (using local data):', cloudError);
          // 云端加载失败时，继续使用本地数据，不影响用户体验
        }
      }

      set({ books: localBooks, isLoading: false });
    } catch (error) {
      console.error('loadBooks: Fatal error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // POI management
  addPOI: (poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      // 确定 POI 所属的场景数组
      const targetSceneIds = poi.sceneIds || [state.currentBook.activeSceneId];
      const newPOI: POI = {
        ...poi,
        id: generateId(),
        createdAt: new Date().toISOString(),
        sceneIds: targetSceneIds
      };

      // 只更新主POI列表，不自动创建CanvasPOI
      // CanvasPOI应该只在用户手动拖拽POI到画布上时才创建

      return {
        currentBook: {
          ...state.currentBook,
          pois: [...state.currentBook.pois, newPOI]
        },
        isDirty: true
      };
    });
  },

  updatePOI: (poiId, poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      // 获取当前POI的信息
      const currentPOI = state.currentBook.pois.find(p => p.id === poiId);
      if (!currentPOI) return state;

      // 确定新的场景ID数组
      const newSceneIds = poi.sceneIds || currentPOI.sceneIds || [];
      const oldSceneIds = currentPOI.sceneIds || [];

      // 更新主 POI 列表
      const updatedMainPois = state.currentBook.pois.map((p) =>
        p.id === poiId ? { ...p, ...poi, sceneIds: newSceneIds } : p
      );

      // 更新场景内的 POI
      let updatedScenes = state.currentBook.scenes.map(scene => {
        // 更新场景内的 POI（canvas POI）
        const updatedPois = scene.pois.filter(canvasPoi =>
          !(canvasPoi.originalId === poiId || canvasPoi.id === poiId)
        );

        return {
          ...scene,
          pois: updatedPois
        };
      });

      // 向新场景添加 POI
      newSceneIds.forEach(sceneId => {
        const scene = updatedScenes.find(s => s.id === sceneId);
        if (scene) {
          // 获取当前POI的最新信息
          const updatedPOI = updatedMainPois.find(p => p.id === poiId)!;

          // 创建新的 CanvasPOI
          const canvasPOI: CanvasPOI = {
            ...updatedPOI,
            id: generateId(),
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            originalId: updatedPOI.id
          };

          updatedScenes = updatedScenes.map(s =>
            s.id === sceneId
              ? { ...s, pois: [...s.pois, canvasPOI] }
              : s
          );
        }
      });

      // 更新旧的 canvasPois（向后兼容）
      const updatedCanvasPois = state.currentBook.canvasPois.map(canvasPoi => {
        if (canvasPoi.originalId === poiId || canvasPoi.id === poiId) {
          return {
            ...canvasPoi,
            name: poi.name || canvasPoi.name,
            category: poi.category || canvasPoi.category,
            visitTime: poi.visitTime || canvasPoi.visitTime,
            notes: poi.notes || canvasPoi.notes
          };
        }
        return canvasPoi;
      });

      return {
        currentBook: {
          ...state.currentBook,
          pois: updatedMainPois,
          scenes: updatedScenes,
          canvasPois: updatedCanvasPois
        },
        isDirty: true
      };
    });
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

      // 3. 处理场景内的 POI (canvas POI)
      const updatedScenes = state.currentBook.scenes.map(scene => {
        // 删除与该 POI 相关的场景内 POI
        const filteredPois = scene.pois.filter(canvasPoi =>
          canvasPoi.originalId !== poiId && canvasPoi.id !== poiId
        );

        // 将以该 POI 为父级的场景内 POI 的 parentId 置空
        const finalPois = filteredPois.map(canvasPoi =>
          canvasPoi.parentId === poiId ? { ...canvasPoi, parentId: undefined } : canvasPoi
        );

        return {
          ...scene,
          pois: finalPois
        };
      });

      // 4. 处理旧的 canvasPois（向后兼容）
      const updatedCanvasPois = state.currentBook.canvasPois.filter(p =>
        p.originalId !== poiId && p.id !== poiId
      );

      // 将以该 POI 为父级的旧 canvasPoi 的 parentId 置空
      const finalCanvasPois = updatedCanvasPois.map(p =>
        p.parentId === poiId ? { ...p, parentId: undefined } : p
      );

      return {
        currentBook: {
          ...state.currentBook,
          pois: finalPOIs,
          scenes: updatedScenes,
          canvasPois: finalCanvasPois
        },
        isDirty: true
      };
    });
  },

  // Canvas POI management
  addCanvasPOI: (poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      const canvasPOIs = state.currentBook.canvasPois;

      // 创建新的CanvasPOI
      const newCanvasPOI: CanvasPOI = {
        ...poi,
        id: generateId(),
        originalId: poi.originalId || (poi as any).id // 优先使用已存在的 originalId，或从传入的 POI 对象中提取 id
      };

      // 处理新CanvasPOI的parentId：查找对应的CanvasPOI
      const updatedCanvasPOI = { ...newCanvasPOI };
      if (updatedCanvasPOI.parentId) {
        // 查找具有匹配originalId的CanvasPOI
        const parentCanvasPOI = canvasPOIs.find(p => p.originalId === updatedCanvasPOI.parentId);
        if (parentCanvasPOI) {
          updatedCanvasPOI.parentId = parentCanvasPOI.id;
        }
      }

      // 确保parentId始终指向CanvasPOI的ID
      let updatedCanvasPOIs = [...canvasPOIs, updatedCanvasPOI];

      // 处理父子关系：更新所有相关的POI
      updatedCanvasPOIs = updatedCanvasPOIs.map(p => {
        // 如果当前POI的parentId指向原始POI的ID，更新为CanvasPOI的ID
        if (p.parentId === updatedCanvasPOI.originalId) {
          return { ...p, parentId: updatedCanvasPOI.id };
        }
        return p;
      });

      return {
        currentBook: {
          ...state.currentBook,
          canvasPois: updatedCanvasPOIs
        },
        isDirty: true
      };
    });
  },

  updateCanvasPOI: (poiId, poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      const currentCanvasPois = state.currentBook.canvasPois;
      const targetPoi = currentCanvasPois.find(p => p.id === poiId);

      if (!targetPoi) return state;

      const updatedCanvasPois = currentCanvasPois.map((p) => {
        // 只更新目标 POI，不影响子节点
        if (p.id === poiId) {
          return { ...p, ...poi };
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

      // 平级化下属地点：使用CanvasPOI的id进行匹配
      const finalCanvasPOIs = filteredCanvasPOIs.map(p =>
        (p.parentId && p.parentId === targetPoi.id) ? { ...p, parentId: undefined } : p
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

  // Scene POI management (多画布)
  getActiveScenePois: () => {
    const { currentBook } = get();
    if (!currentBook || !currentBook.activeSceneId) {
      // 如果没有活动场景，回退到 canvasPois
      return currentBook?.canvasPois || [];
    }
    const activeScene = currentBook.scenes.find(s => s.id === currentBook.activeSceneId);
    return activeScene?.pois || [];
  },

  addScenePOI: (poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      const activeSceneId = state.currentBook.activeSceneId;
      if (!activeSceneId) {
        // 如果没有活动场景，添加到 canvasPois（向后兼容）
        const newPoi: CanvasPOI = { ...poi, id: generateId() };
        return {
          currentBook: {
            ...state.currentBook,
            canvasPois: [...state.currentBook.canvasPois, newPoi]
          },
          isDirty: true
        };
      }

      // 找到活动场景
      const activeScene = state.currentBook.scenes.find(s => s.id === activeSceneId);
      if (!activeScene) return state;

      // 创建新的CanvasPOI
      const newPoi: CanvasPOI = { ...poi, id: generateId() };

      // 处理父子关系：更新parentId以指向正确的CanvasPOI
      if (newPoi.parentId) {
        // 查找具有匹配originalId的CanvasPOI作为父节点
        const parentPoi = activeScene.pois.find(p => p.originalId === newPoi.parentId);
        if (parentPoi) {
          // 更新新POI的parentId为父节点的CanvasPOI ID
          newPoi.parentId = parentPoi.id;
        }
        // 如果找不到匹配的父节点，暂时保留原始parentId
        // 不清除，以便后续添加父节点时能识别
      }

      // 将处理好的新POI添加到数组中
      let updatedPois = [...activeScene.pois, newPoi];

      // 检查新添加的POI是否是其他已存在POI的父节点
      // 如果是，更新这些子节点的parentId
      const childrenPois = activeScene.pois.filter(p => p.parentId === newPoi.originalId);
      if (childrenPois.length > 0) {
        updatedPois = updatedPois.map(p => {
          if (childrenPois.some(child => child.id === p.id)) {
            return { ...p, parentId: newPoi.id };
          }
          return p;
        });
      }

      const updatedScenes = state.currentBook.scenes.map(scene => {
        if (scene.id === activeSceneId) {
          return { ...scene, pois: updatedPois };
        }
        return scene;
      });

      return {
        currentBook: {
          ...state.currentBook,
          scenes: updatedScenes
        },
        isDirty: true
      };
    });
  },

  updateScenePOI: (poiId, poi) => {
    set((state) => {
      if (!state.currentBook) return state;

      const activeSceneId = state.currentBook.activeSceneId;
      if (!activeSceneId) {
        // 回退到 canvasPois
        const updatedCanvasPois = state.currentBook.canvasPois.map(p =>
          p.id === poiId ? { ...p, ...poi } : p
        );
        return {
          currentBook: {
            ...state.currentBook,
            canvasPois: updatedCanvasPois
          },
          isDirty: true
        };
      }

      const updatedScenes = state.currentBook.scenes.map(scene => {
        if (scene.id === activeSceneId) {
          const updatedPois = scene.pois.map(p =>
            p.id === poiId ? { ...p, ...poi } : p
          );
          return { ...scene, pois: updatedPois };
        }
        return scene;
      });

      return {
        currentBook: {
          ...state.currentBook,
          scenes: updatedScenes
        },
        isDirty: true
      };
    });
  },

  deleteScenePOI: (poiId) => {
    set((state) => {
      if (!state.currentBook) return state;

      const activeSceneId = state.currentBook.activeSceneId;
      if (!activeSceneId) {
        // 回退到 canvasPois
        const filteredPois = state.currentBook.canvasPois.filter(p => p.id !== poiId);
        return {
          currentBook: {
            ...state.currentBook,
            canvasPois: filteredPois
          },
          isDirty: true
        };
      }

      const updatedScenes = state.currentBook.scenes.map(scene => {
        if (scene.id === activeSceneId) {
          const filteredPois = scene.pois.filter(p => p.id !== poiId);
          return { ...scene, pois: filteredPois };
        }
        return scene;
      });

      return {
        currentBook: {
          ...state.currentBook,
          scenes: updatedScenes
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
        // Always add POI to selection (support multiple selections of the same POI)
        const itinerary = dailyItineraries[itineraryIndex];
        itinerary.selectedPoiIds.push(poiId);
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

  // Remove a specific POI from selection (supports removing one occurrence at a time)
  removePoiSelection: (day, poiId) => {
    set((state) => {
      if (!state.currentBook) return state;

      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );

      if (itineraryIndex === -1) return state;

      const itinerary = dailyItineraries[itineraryIndex];

      // Find the index of the first occurrence of poiId
      const poiIndex = itinerary.selectedPoiIds.indexOf(poiId);
      if (poiIndex === -1) return state;

      // Remove the first occurrence
      const updatedSelectedPoiIds = [...itinerary.selectedPoiIds];
      updatedSelectedPoiIds.splice(poiIndex, 1);

      // Update orderedPois by removing the corresponding entry
      const updatedOrderedPois = [...itinerary.orderedPois];
      const orderedPoiIndex = updatedOrderedPois.findIndex(op => op.poiId === poiId);
      if (orderedPoiIndex !== -1) {
        updatedOrderedPois.splice(orderedPoiIndex, 1);

        // Reorder the remaining POIs
        updatedOrderedPois.forEach((op, index) => {
          op.order = index + 1;
        });
      }

      // Update routes that reference this POI
      const updatedRoutes = itinerary.routes.filter(route => {
        return route.fromPoiId !== poiId && route.toPoiId !== poiId;
      });

      // Update the itinerary
      dailyItineraries[itineraryIndex] = {
        ...itinerary,
        selectedPoiIds: updatedSelectedPoiIds,
        orderedPois: updatedOrderedPois,
        routes: updatedRoutes
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
      if (!state.currentBook || route.fromPoiId === route.toPoiId) return state;

      const dailyItineraries = [...state.currentBook.dailyItineraries];
      const itineraryIndex = dailyItineraries.findIndex(
        (itinerary) => itinerary.day === day
      );

      if (itineraryIndex === -1) return state;

      const newRoute: Route = {
        ...route,
        id: generateId()
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
        id: generateId(),
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
  },

  // Scene management (多画布)
  addScene: (name, x = 100, y = 100, category, image) => {
    const sceneId = generateId();
    set((state) => {
      if (!state.currentBook) return state;

      const newScene: Scene = {
        id: sceneId,
        name,
        x: x ?? 100,
        y: y ?? 100,
        pois: [],
        category: category || 'city',
        image: image,
        startDate: state.currentBook.startDate,
        endDate: state.currentBook.endDate
      };

      const updatedScenes = [...state.currentBook.scenes, newScene];

      return {
        currentBook: {
          ...state.currentBook,
          scenes: updatedScenes,
          activeSceneId: state.currentBook.activeSceneId || sceneId // 如果没有活动场景，则设为新场景
        },
        isDirty: true
      };
    });
    return sceneId;
  },

  updateScene: (sceneId, updates) => {
    set((state) => {
      if (!state.currentBook) return state;

      return {
        currentBook: {
          ...state.currentBook,
          scenes: state.currentBook.scenes.map(scene =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
          )
        },
        isDirty: true
      };
    });
  },

  deleteScene: (sceneId) => {
    set((state) => {
      if (!state.currentBook) return state;

      // 删除场景
      const updatedScenes = state.currentBook.scenes.filter(s => s.id !== sceneId);

      // 删除与该场景相关的场景间路线
      const updatedRoutes = state.currentBook.sceneRoutes.filter(
        r => r.fromSceneId !== sceneId && r.toSceneId !== sceneId
      );

      // 更新主 POI 列表：移除与该场景关联的 POI 的场景ID
      const updatedPois = state.currentBook.pois.map(poi => {
        // 处理新的场景ID数组格式
        if (poi.sceneIds && Array.isArray(poi.sceneIds)) {
          // 从场景ID数组中移除已删除的场景ID
          const updatedSceneIds = poi.sceneIds.filter(id => id !== sceneId);
          return { ...poi, sceneIds: updatedSceneIds };
        }
        // 处理旧的单一场景ID格式（向后兼容）
        // 如果存在旧的sceneId属性，将其转换为数组格式
        if ('sceneId' in poi && poi.sceneId === sceneId) {
          const { sceneId: _, ...rest } = poi as any;
          return { ...rest, sceneIds: [] };
        }
        return poi;
      });

      // 更新旧的 canvasPois（向后兼容）：移除与该场景相关的 POI
      const updatedCanvasPois = state.currentBook.canvasPois.filter(poi =>
        ('sceneId' in poi && poi.sceneId !== sceneId) ||
        ('sceneIds' in poi && (!poi.sceneIds || !poi.sceneIds.includes(sceneId)))
      );

      // 如果删除的是当前活动场景，切换到第一个场景
      let newActiveSceneId = state.currentBook.activeSceneId;
      if (newActiveSceneId === sceneId) {
        newActiveSceneId = updatedScenes.length > 0 ? updatedScenes[0].id : '';
      }

      // 如果切换到了新的活动场景，更新当前天数
      let updatedCurrentDay = state.currentDay;
      if (newActiveSceneId && newActiveSceneId !== sceneId) {
        // 计算新场景的起始天数
        const bookStartDate = new Date(state.currentBook.startDate);
        const newScene = updatedScenes.find(s => s.id === newActiveSceneId);
        if (newScene && newScene.startDate) {
          const sceneStartDate = new Date(newScene.startDate);
          const diffTime = sceneStartDate.getTime() - bookStartDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          updatedCurrentDay = Math.max(1, diffDays + 1);
        }
      } else if (!newActiveSceneId) {
        // 如果没有场景了，重置为第一天
        updatedCurrentDay = 1;
      }

      return {
        currentBook: {
          ...state.currentBook,
          pois: updatedPois,
          scenes: updatedScenes,
          sceneRoutes: updatedRoutes,
          activeSceneId: newActiveSceneId,
          canvasPois: updatedCanvasPois
        },
        currentDay: updatedCurrentDay,
        isDirty: true
      };
    });
  },

  // 计算给定场景中某一天的实际日期
  getSceneDateForDay: (sceneId: string, day: number): string => {
    const { currentBook } = get();
    if (!currentBook) return '';

    const scene = currentBook.scenes.find(s => s.id === sceneId);
    if (!scene) return '';

    const startDateStr = scene.startDate || currentBook.startDate;
    if (!startDateStr) return '';

    const startDate = new Date(startDateStr);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + day - 1);
    return targetDate.toISOString().split('T')[0];
  },

  // 获取当前场景的第一天是整个旅行的第几天
  getSceneStartDayInBook: (sceneId: string): number => {
    const { currentBook } = get();
    if (!currentBook) return 1;

    const scene = currentBook.scenes.find(s => s.id === sceneId);
    if (!scene) return 1;

    const bookStartDate = new Date(currentBook.startDate);
    const sceneStartDateStr = scene.startDate || currentBook.startDate;
    if (!sceneStartDateStr) return 1;

    const sceneStartDate = new Date(sceneStartDateStr);
    const diffTime = sceneStartDate.getTime() - bookStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  },

  switchScene: (sceneId) => {
    set((state) => {
      if (!state.currentBook) return state;

      const scene = state.currentBook.scenes.find(s => s.id === sceneId);
      if (!scene) return state;

      // 计算场景在整个旅行中的起始天数
      const bookStartDate = new Date(state.currentBook.startDate);
      const sceneStartDateStr = scene.startDate || state.currentBook.startDate;
      const sceneStartDate = new Date(sceneStartDateStr);
      const diffTime = sceneStartDate.getTime() - bookStartDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const sceneStartDayInBook = Math.max(1, diffDays + 1);

      return {
        currentBook: {
          ...state.currentBook,
          activeSceneId: sceneId
        },
        currentDay: sceneStartDayInBook, // 切换场景时将当前天数设置为场景的第一天
        sceneSwitchNotification: {
          sceneName: scene.name,
          message: `已切换到「${scene.name}」场景`,
          show: true
        }
      };
    });

    // 3秒后自动隐藏通知
    setTimeout(() => {
      set((state) => ({
        sceneSwitchNotification: null
      }));
    }, 3000);
  },

  // 清除场景切换通知
  clearSceneSwitchNotification: () => {
    set({ sceneSwitchNotification: null });
  },

  // 场景模板管理方法
  saveSceneAsTemplate: (sceneId: string, templateName: string, description?: string) => {
    set((state) => {
      if (!state.currentBook) return state;

      const scene = state.currentBook.scenes.find(s => s.id === sceneId);
      if (!scene) return state;

      // 创建模板数据，清除不必要的信息
      const template: SceneTemplate = {
        id: generateId(),
        name: templateName,
        description,
        color: scene.color,
        samplePOIs: scene.pois.map(poi => ({
          ...poi,
          id: generateId(), // 为模板POI生成新ID
          originalId: poi.originalId
        })),
        createdAt: new Date().toISOString()
      };

      const updatedTemplates = [...state.sceneTemplates, template];
      return {
        sceneTemplates: updatedTemplates
      };
    });
  },

  applySceneTemplate: (templateId: string, newSceneName: string, x: number, y: number) => {
    set((state) => {
      if (!state.currentBook) return state;

      const template = state.sceneTemplates.find(t => t.id === templateId);
      if (!template) return state;

      // 创建新场景
      const sceneId = generateId();
      const newScene: Scene = {
        id: sceneId,
        name: newSceneName,
        x,
        y,
        color: template.color,
        pois: template.samplePOIs.map(poi => ({
          ...poi,
          id: generateId() // 为新场景中的POI生成新ID
        })),
        startDate: state.currentBook.startDate,
        endDate: state.currentBook.endDate
      };

      // 创建主POI列表中的条目
      const newMainPOIs = template.samplePOIs.map(poi => {
        const newPoiId = generateId();
        const mainPOI: POI = {
          id: newPoiId,
          name: poi.name,
          category: poi.category,
          visitTime: poi.visitTime,
          notes: poi.notes,
          createdAt: new Date().toISOString(),
          sceneIds: [sceneId]
        };
        return mainPOI;
      });

      // 更新新场景中的POI，使其指向主POI列表中的正确ID
      const updatedScenePOIs = newScene.pois.map((poi, index) => ({
        ...poi,
        originalId: newMainPOIs[index].id
      }));

      newScene.pois = updatedScenePOIs;

      const updatedScenes = [...state.currentBook.scenes, newScene];
      const updatedMainPOIs = [...state.currentBook.pois, ...newMainPOIs];

      return {
        currentBook: {
          ...state.currentBook,
          scenes: updatedScenes,
          activeSceneId: sceneId, // 切换到新创建的场景
          pois: updatedMainPOIs
        },
        isDirty: true,
        sceneSwitchNotification: {
          sceneName: newSceneName,
          message: `已使用模板创建新场景「${newSceneName}」`,
          show: true
        }
      };
    });

    // 3秒后自动隐藏通知
    setTimeout(() => {
      set((state) => ({ sceneSwitchNotification: null }));
    }, 3000);
  },

  deleteSceneTemplate: (templateId: string) => {
    set((state) => {
      const updatedTemplates = state.sceneTemplates.filter(t => t.id !== templateId);
      return {
        sceneTemplates: updatedTemplates
      };
    });
  },

  addSceneRoute: (fromSceneId, toSceneId, transportType, departureDateTime = new Date().toISOString(), arrivalDateTime = new Date().toISOString()) => {
    set((state) => {
      if (!state.currentBook) return state;

      const newRoute: InterSceneRoute = {
        id: generateId(),
        fromSceneId,
        toSceneId,
        transportType,
        departureDateTime,
        arrivalDateTime
      };

      return {
        currentBook: {
          ...state.currentBook,
          sceneRoutes: [...state.currentBook.sceneRoutes, newRoute]
        },
        isDirty: true
      };
    });
  },

  deleteSceneRoute: (routeId) => {
    set((state) => {
      if (!state.currentBook) return state;

      return {
        currentBook: {
          ...state.currentBook,
          sceneRoutes: state.currentBook.sceneRoutes.filter(r => r.id !== routeId)
        },
        isDirty: true
      };
    });
  },

  // 更新场景间路线
  updateSceneRoute: (routeId: string, updates: Partial<InterSceneRoute>) => {
    set((state) => {
      if (!state.currentBook) return state;

      return {
        currentBook: {
          ...state.currentBook,
          sceneRoutes: state.currentBook.sceneRoutes.map(route =>
            route.id === routeId ? { ...route, ...updates } : route
          )
        },
        isDirty: true
      };
    });
  },

  // 获取所有场景间路线
  getSceneRoutes: () => {
    const { currentBook } = get();
    return currentBook?.sceneRoutes || [];
  },

  // 获取按日期排序的场景间路线
  getSceneRoutesByDate: () => {
    const { currentBook } = get();
    if (!currentBook || !currentBook.sceneRoutes) return [];

    // 按出发日期时间排序
    return [...currentBook.sceneRoutes].sort((a, b) => {
      const dateA = new Date(a.departureDateTime).getTime();
      const dateB = new Date(b.departureDateTime).getTime();
      return dateA - dateB;
    });
  },

  migrateCanvasPoisToScene: () => {
    set((state) => {
      if (!state.currentBook) return state;

      // 只有当有旧的 canvasPois 且它们尚未被迁移时才执行迁移
      if (state.currentBook.canvasPois.length === 0) {
        return state;
      }

      // 获取或创建默认场景
      let defaultSceneId = state.currentBook.activeSceneId;
      let defaultSceneName = state.currentBook.destination || '默认目的地';
      let scenes = [...state.currentBook.scenes];

      // 如果没有活动场景或场景列表为空，创建新场景
      if (!defaultSceneId || scenes.length === 0) {
        defaultSceneId = generateId();
        const newScene: Scene = {
          id: defaultSceneId,
          name: defaultSceneName,
          x: 300,
          y: 200,
          pois: [],
          startDate: state.currentBook.startDate,
          endDate: state.currentBook.endDate
        };
        scenes = [newScene];
      }

      // 迁移 canvasPois 到默认场景
      const canvasPoisMap = new Map<string, CanvasPOI>();
      const migratedPois: CanvasPOI[] = state.currentBook.canvasPois.map(poi => {
        const migratedPoi: CanvasPOI = {
          ...poi,
          sceneIds: [defaultSceneId] // 使用场景ID数组
        };
        canvasPoisMap.set(poi.id, migratedPoi);
        return migratedPoi;
      });

      // 处理 parentId 映射：确保 parentId 指向同一个场景内的 POI
      const poisWithCorrectParentId = migratedPois.map(poi => {
        if (poi.parentId) {
          // 检查父级 POI 是否存在于同一迁移列表中
          const parentPoi = canvasPoisMap.get(poi.parentId);
          if (parentPoi) {
            return {
              ...poi,
              parentId: parentPoi.id
            };
          }
        }
        return poi;
      });

      // 更新场景列表，不自动迁移所有POI到场景中
      // 只保留场景结构，POI应该由用户手动拖拽到画布上
      const updatedScenes = scenes.map(scene => {
        if (scene.id === defaultSceneId) {
          return {
            ...scene,
            pois: [] // 清空迁移的POI，让用户手动添加
          };
        }
        return scene;
      });

      // 更新主 POI 列表，添加 sceneIds
      const updatedMainPois = state.currentBook.pois.map(poi => {
        // 检查是否有对应的 canvasPoi
        const hasCanvasPoi = migratedPois.some(canvasPoi =>
          canvasPoi.originalId === poi.id || canvasPoi.id === poi.id
        );
        if (hasCanvasPoi && (!poi.sceneIds || poi.sceneIds.length === 0)) {
          return {
            ...poi,
            sceneIds: [defaultSceneId]
          };
        }
        return poi;
      });

      return {
        currentBook: {
          ...state.currentBook,
          pois: updatedMainPois,
          scenes: updatedScenes,
          activeSceneId: defaultSceneId,
          canvasPois: [] // 清空旧数据
        },
        isDirty: true
      };
    });
  }
}));
