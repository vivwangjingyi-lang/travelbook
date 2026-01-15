-- ==========================================
-- 完整 RLS 策略修复脚本（一次性运行）
-- ==========================================

-- 1. 清除所有旧策略
DROP POLICY IF EXISTS "Owners can do everything" ON public.travel_books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.travel_books;
DROP POLICY IF EXISTS "Users can view their own books" ON public.travel_books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.travel_books;
DROP POLICY IF EXISTS "Users can delete their own books" ON public.travel_books;

DROP POLICY IF EXISTS "Users can insert scenes for their books" ON public.scenes;
DROP POLICY IF EXISTS "Users can update scenes for their books" ON public.scenes;
DROP POLICY IF EXISTS "Users can delete scenes for their books" ON public.scenes;
DROP POLICY IF EXISTS "Users can view scenes for their books" ON public.scenes;

DROP POLICY IF EXISTS "Users can insert pois for their books" ON public.pois;
DROP POLICY IF EXISTS "Users can update pois for their books" ON public.pois;
DROP POLICY IF EXISTS "Users can delete pois for their books" ON public.pois;
DROP POLICY IF EXISTS "Users can view pois for their books" ON public.pois;

-- 2. 启用 RLS
ALTER TABLE public.travel_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pois ENABLE ROW LEVEL SECURITY;

-- 3. travel_books 表策略
CREATE POLICY "Users can insert their own books" ON public.travel_books
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own books" ON public.travel_books
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own books" ON public.travel_books
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own books" ON public.travel_books
FOR DELETE USING (auth.uid() = owner_id);

-- 4. scenes 表策略
CREATE POLICY "Users can insert scenes for their books" ON public.scenes
FOR INSERT WITH CHECK (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

CREATE POLICY "Users can view scenes for their books" ON public.scenes
FOR SELECT USING (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update scenes for their books" ON public.scenes
FOR UPDATE USING (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete scenes for their books" ON public.scenes
FOR DELETE USING (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

-- 5. pois 表策略
CREATE POLICY "Users can insert pois for their books" ON public.pois
FOR INSERT WITH CHECK (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

CREATE POLICY "Users can view pois for their books" ON public.pois
FOR SELECT USING (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update pois for their books" ON public.pois
FOR UPDATE USING (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete pois for their books" ON public.pois
FOR DELETE USING (book_id IN (SELECT id FROM public.travel_books WHERE owner_id = auth.uid()));
