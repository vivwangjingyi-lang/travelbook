import { supabase } from '@/lib/supabase';
import { TravelBook, Scene, POI, CanvasPOI, InterSceneRoute } from '@/stores/travelBookStore';
import { v4 as uuidv4 } from 'uuid';

// 数据库行类型定义
interface DBTravelBook {
    id: string;
    owner_id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    cover_image?: string;
    is_public: boolean;
    public_share_id: string | null;
    created_at?: string;
    updated_at?: string;
}

interface DBScene {
    id: string;
    book_id: string;
    name: string;
    x: number;
    y: number;
    color?: string;
    start_date?: string;
    end_date?: string;
    category?: string;
    image?: string;
}

interface DBPOI {
    id: string;
    scene_id?: string;
    book_id: string;
    name: string;
    category: string;
    visit_time?: string;
    notes?: string;
    x: number;
    y: number;
    parent_id?: string;
    original_id?: string;
}

// 转换工具函数
const toDBBook = (book: TravelBook, userId: string): DBTravelBook => ({
    id: book.id,
    owner_id: userId,
    title: book.title,
    description: book.description,
    start_date: book.startDate,
    end_date: book.endDate,
    cover_image: book.coverImage,
    is_public: false, // 默认为私有
    public_share_id: null,
    updated_at: new Date().toISOString(),
});

const toDBScene = (scene: Scene, bookId: string): DBScene => ({
    id: scene.id,
    book_id: bookId,
    name: scene.name,
    x: scene.x,
    y: scene.y,
    color: scene.color,
    start_date: scene.startDate,
    end_date: scene.endDate,
});

const toDBPOI = (poi: POI | CanvasPOI, bookId: string, sceneId?: string): DBPOI => ({
    id: poi.id,
    book_id: bookId,
    scene_id: sceneId,
    name: poi.name,
    category: poi.category,
    visit_time: poi.visitTime,
    notes: poi.notes,
    x: (poi as CanvasPOI).x || 0,
    y: (poi as CanvasPOI).y || 0,
    parent_id: poi.parentId,
    original_id: (poi as CanvasPOI).originalId,
});

export const BackendService = {
    // 加载用户的所有旅行书
    loadBooks: async (): Promise<TravelBook[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // 1. 获取所有书籍
        const { data: booksData, error: booksError } = await supabase
            .from('travel_books')
            .select('*')
            .eq('owner_id', user.id)
            .order('updated_at', { ascending: false });

        if (booksError || !booksData) {
            console.error('Error loading books:', booksError);
            return [];
        }

        const books: TravelBook[] = [];

        for (const bookRow of booksData) {
            // 2. 获取场景
            const { data: scenesData } = await supabase
                .from('scenes')
                .select('*')
                .eq('book_id', bookRow.id);

            // 3. 获取所有 POI (包括收集箱的和场景内的)
            const { data: poisData } = await supabase
                .from('pois')
                .select('*')
                .eq('book_id', bookRow.id);

            const dbScenes = scenesData || [];
            const dbPois = poisData || [];

            // 重组 Scenes
            const scenes: Scene[] = dbScenes.map(s => {
                const scenePois = dbPois
                    .filter(p => p.scene_id === s.id)
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        category: p.category as any,
                        visitTime: p.visit_time || '',
                        notes: p.notes || '',
                        createdAt: '', // DB暂无，可用 updated_at 或忽略
                        parentId: p.parent_id,
                        x: p.x,
                        y: p.y,
                        originalId: p.original_id,
                        sceneId: s.id
                    }));

                return {
                    id: s.id,
                    name: s.name,
                    x: s.x,
                    y: s.y,
                    color: s.color,
                    startDate: s.start_date,
                    endDate: s.end_date,
                    pois: scenePois
                };
            });

            // 重组收集箱 POIs (scene_id 为空)
            const collectionPois: POI[] = dbPois
                .filter(p => !p.scene_id)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category as any,
                    visitTime: p.visit_time || '',
                    notes: p.notes || '',
                    createdAt: '',
                    parentId: p.parent_id,
                }));

            books.push({
                id: bookRow.id,
                title: bookRow.title,
                description: bookRow.description || '',
                startDate: bookRow.start_date || '',
                endDate: bookRow.end_date || '',
                coverImage: bookRow.cover_image,
                pois: collectionPois,
                canvasPois: [], // 已废弃
                dailyItineraries: [], // TODO: 暂未实现行程表存储
                memos: [], // TODO: 暂未实现备忘录存储
                transportationTickets: [], // TODO: 暂未实现票据存储
                scenes: scenes,
                activeSceneId: scenes.length > 0 ? scenes[0].id : '',
                sceneRoutes: [] // TODO: 暂未实现场景间路由存储
            });
        }

        return books;
    },

    // 保存（创建或更新）整本旅行书
    // 注意：这是一个全量保存这可能效率不高，后续应由细粒度的 API 替代
    saveBook: async (book: TravelBook): Promise<void> => {
        console.log('BackendService.saveBook: Starting save for book:', book.id, book.title);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error('BackendService.saveBook: Auth error:', authError);
            throw authError;
        }
        if (!user) {
            console.warn('BackendService.saveBook: No user logged in, skipping cloud save.');
            return; // 静默跳过，不抛错
        }

        console.log('BackendService.saveBook: User authenticated:', user.id);

        // 1. Upsert Book
        const dbBook = toDBBook(book, user.id);
        console.log('BackendService.saveBook: Upserting book data:', dbBook);
        const { error: bookError } = await supabase
            .from('travel_books')
            .upsert(dbBook, { onConflict: 'id' });

        if (bookError) {
            console.error('BackendService.saveBook: Error upserting book:', JSON.stringify(bookError, null, 2));
            throw new Error(`Failed to save book: ${bookError.message || bookError.code || 'Unknown error'}`);
        }
        console.log('BackendService.saveBook: Book upserted successfully.');

        // 2. Upsert Scenes
        console.log('BackendService.saveBook: Scenes count:', book.scenes.length);
        if (book.scenes.length > 0) {
            const dbScenes = book.scenes.map(s => toDBScene(s, book.id));
            console.log('BackendService.saveBook: Upserting scenes:', dbScenes);
            const { error: sceneError } = await supabase
                .from('scenes')
                .upsert(dbScenes, { onConflict: 'id' });
            if (sceneError) {
                console.error('BackendService.saveBook: Error upserting scenes:', JSON.stringify(sceneError, null, 2));
                throw new Error(`Failed to save scenes: ${sceneError.message || sceneError.code || 'Unknown error'}`);
            }
            console.log('BackendService.saveBook: Scenes upserted successfully.');
        } else {
            console.log('BackendService.saveBook: No scenes to save.');
        }

        // 3. Upsert POIs
        // 收集所有 POI：包括收集箱里的 (pois) 和 场景里的 (scenes[].pois)
        let allDBPois: DBPOI[] = [];

        // 3.1 收集箱 POI
        book.pois.forEach(p => {
            allDBPois.push(toDBPOI(p, book.id, undefined)); // scene_id 为空
        });

        // 3.2 场景 POI
        book.scenes.forEach(s => {
            s.pois.forEach(p => {
                allDBPois.push(toDBPOI(p, book.id, s.id));
            });
        });

        if (allDBPois.length > 0) {
            const { error: poiError } = await supabase
                .from('pois')
                .upsert(allDBPois);
            if (poiError) throw poiError;
        }
    },

    deleteBook: async (bookId: string): Promise<void> => {
        const { error } = await supabase
            .from('travel_books')
            .delete()
            .eq('id', bookId);
        if (error) throw error;
    }
};
