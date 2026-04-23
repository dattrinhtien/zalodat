-- ============================================
-- ZaloDat Database Schema
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms viewable by authenticated" ON public.rooms
  FOR SELECT TO authenticated USING (true);

-- Insert default room
INSERT INTO public.rooms (name, description)
VALUES ('General', 'Phòng chat chung mặc định')
ON CONFLICT DO NOTHING;

-- 3. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by authenticated" ON public.messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- DONE! Bây giờ hãy:
-- 1. Vào Storage > New Bucket > Tên: "chat-attachments" > Public: ON
-- 2. Tạo policy cho bucket:
--    - Policy name: "Allow authenticated uploads"
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - Policy: (auth.role() = 'authenticated')
--
--    - Policy name: "Allow public reads"  
--    - Allowed operation: SELECT
--    - Target roles: public
--    - Policy: true
-- ============================================
