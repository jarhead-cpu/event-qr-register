-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin'))
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quota INTEGER NOT NULL DEFAULT 100,
    tanggal_event DATE NOT NULL,
    jam_event TIME NOT NULL,
    lokasi_event TEXT NOT NULL,
    link_maps TEXT,
    form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- Create registrants table
CREATE TABLE IF NOT EXISTS public.registrants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_proof_url TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'rejected')),
    email TEXT NOT NULL,
    name TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_admin_id ON public.events(admin_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_registrants_event_id ON public.registrants(event_id);
CREATE INDEX IF NOT EXISTS idx_registrants_payment_status ON public.registrants(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrants_email ON public.registrants(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for events
CREATE POLICY "Admins can view own events" ON public.events
    FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can insert own events" ON public.events
    FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update own events" ON public.events
    FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete own events" ON public.events
    FOR DELETE USING (admin_id = auth.uid());

CREATE POLICY "Public can view active events" ON public.events
    FOR SELECT USING (is_active = true);

-- Create RLS policies for registrants
CREATE POLICY "Admins can view registrants for own events" ON public.registrants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = registrants.event_id 
            AND events.admin_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert registrants" ON public.registrants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update registrants for own events" ON public.registrants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = registrants.event_id 
            AND events.admin_id = auth.uid()
        )
    );

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_registrants
    BEFORE UPDATE ON public.registrants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for event files
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-files', 'event-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for event files
CREATE POLICY "Anyone can view event files" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-files');

CREATE POLICY "Authenticated users can upload event files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'event-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'event-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to get event statistics
CREATE OR REPLACE FUNCTION public.get_event_stats(event_uuid UUID)
RETURNS JSON AS $$
DECLARE
    total_registrants INTEGER;
    confirmed_registrants INTEGER;
    pending_registrants INTEGER;
    rejected_registrants INTEGER;
    quota_limit INTEGER;
    fill_percentage DECIMAL;
BEGIN
    -- Get event quota
    SELECT quota INTO quota_limit
    FROM public.events
    WHERE id = event_uuid;
    
    -- Get registrant counts
    SELECT 
        COUNT(*) FILTER (WHERE payment_status = 'confirmed'),
        COUNT(*) FILTER (WHERE payment_status = 'pending'),
        COUNT(*) FILTER (WHERE payment_status = 'rejected'),
        COUNT(*)
    INTO confirmed_registrants, pending_registrants, rejected_registrants, total_registrants
    FROM public.registrants
    WHERE event_id = event_uuid;
    
    -- Calculate fill percentage based on confirmed registrants
    fill_percentage = CASE 
        WHEN quota_limit > 0 THEN (confirmed_registrants::DECIMAL / quota_limit::DECIMAL) * 100
        ELSE 0
    END;
    
    RETURN json_build_object(
        'total_registrants', total_registrants,
        'confirmed_registrants', confirmed_registrants,
        'pending_registrants', pending_registrants,
        'rejected_registrants', rejected_registrants,
        'quota', quota_limit,
        'remaining_quota', GREATEST(0, quota_limit - confirmed_registrants),
        'fill_percentage', ROUND(fill_percentage, 2)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;