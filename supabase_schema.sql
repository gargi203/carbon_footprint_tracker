-- Supabase Database Schema for EcoTrack AI
-- Copy and run this script in your Supabase SQL Editor to initialize the database tables and RLS security policies.

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  onboarding_data JSONB,
  calculation_result JSONB,
  eco_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Carbon History Table
CREATE TABLE IF NOT EXISTS public.history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week TEXT NOT NULL,
  date DATE NOT NULL,
  co2_emissions INTEGER NOT NULL,
  breakdown JSONB NOT NULL,
  eco_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- 3. Create Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT PRIMARY KEY, -- Using text IDs matching client-side random strings
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  co2_savings NUMERIC NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATE NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- 4. Create Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_reward INTEGER NOT NULL,
  co2_savings NUMERIC NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at DATE,
  priority TEXT NOT NULL
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- 5. Create Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  is_earned BOOLEAN DEFAULT FALSE,
  earned_at DATE
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Security Policies

-- Profiles Policies
CREATE POLICY "Allow users to select their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- History Policies
CREATE POLICY "Allow users to select their own history" 
  ON public.history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own history" 
  ON public.history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own history" 
  ON public.history FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own history" 
  ON public.history FOR DELETE 
  USING (auth.uid() = user_id);

-- Goals Policies
CREATE POLICY "Allow users to select their own goals" 
  ON public.goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own goals" 
  ON public.goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own goals" 
  ON public.goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own goals" 
  ON public.goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Challenges Policies
CREATE POLICY "Allow users to select their own challenges" 
  ON public.challenges FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert/update their own challenges" 
  ON public.challenges FOR ALL 
  USING (auth.uid() = user_id);

-- Badges Policies
CREATE POLICY "Allow users to select their own badges" 
  ON public.badges FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert/update their own badges" 
  ON public.badges FOR ALL 
  USING (auth.uid() = user_id);

-- 7. Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, eco_points)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
