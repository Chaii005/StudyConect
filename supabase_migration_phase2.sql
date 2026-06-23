-- Migration Phase 2: Supabase Egress & Performance Optimization

-- 1. Điểm 1: Thêm cột post_owner_id vào bảng comments và post_reactions
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS post_owner_id integer;
ALTER TABLE public.post_reactions ADD COLUMN IF NOT EXISTS post_owner_id integer;

-- Cập nhật dữ liệu hiện tại (Backfill)
UPDATE public.comments c
SET post_owner_id = p.user_id
FROM public.posts p
WHERE c.post_id = p.id AND c.post_owner_id IS NULL;

UPDATE public.post_reactions r
SET post_owner_id = p.user_id
FROM public.posts p
WHERE r.post_id = p.id AND r.post_owner_id IS NULL;

-- Tạo index cho cột post_owner_id để tối ưu hóa truy vấn và Realtime Filter
CREATE INDEX IF NOT EXISTS idx_comments_post_owner_id ON public.comments(post_owner_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_owner_id ON public.post_reactions(post_owner_id);


-- 2. Điểm 2: Thêm cột meetroom_id vào bảng messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS meetroom_id text;

-- Cập nhật dữ liệu hiện tại (Backfill cho phòng họp cũ)
-- Trích xuất meetroom_id từ content dạng '[meetroom:ROOM_ID] Nội dung'
-- và loại bỏ tiền tố này khỏi content để dữ liệu được sạch sẽ.
UPDATE public.messages
SET 
  meetroom_id = substring(content from '^\[meetroom:([^\]]+)\]'),
  content = substring(content from '^\[meetroom:[^\]]+\]\s*(.*)$')
WHERE content LIKE '[meetroom:%' AND meetroom_id IS NULL;

-- Tạo index cho meetroom_id
CREATE INDEX IF NOT EXISTS idx_messages_meetroom_id ON public.messages(meetroom_id);
