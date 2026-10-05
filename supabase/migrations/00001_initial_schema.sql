-- CareSetu Comprehensive Database Schema Migration
-- Enables PostGIS, sets up all 12 tables, GIST spatial indexes, RPC functions, triggers, and Row Level Security.

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'driver', 'pharmacist', 'admin')),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Products Table (Medicines & Equipment)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('medicine', 'equipment')),
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  mrp NUMERIC(10, 2) NOT NULL CHECK (mrp >= price),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 5. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'mock', 'upi')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'cod_pending', 'paid', 'failed')),
  upi_reference TEXT,
  delivery_address TEXT NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Ambulances Table
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id),
  vehicle_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'basic' CHECK (type IN ('basic', 'icu')),
  location GEOGRAPHY(Point, 4326),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Emergency Requests Table
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_location GEOGRAPHY(Point, 4326),
  pickup_address TEXT NOT NULL,
  ambulance_id UUID REFERENCES public.ambulances(id),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'on_the_way', 'reached', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Hospitals Table (with NULLABLE location and data_verified)
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  location GEOGRAPHY(Point, 4326), -- Nullable by design: wrong data is worse than missing data
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  specialties TEXT[],
  data_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Health Camps Table
CREATE TABLE IF NOT EXISTS public.health_camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organizer TEXT,
  description TEXT,
  location GEOGRAPHY(Point, 4326),
  address TEXT,
  start_date DATE,
  end_date DATE,
  is_free BOOLEAN NOT NULL DEFAULT true,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Chat Sessions & Messages (AI Doctor)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SPATIAL GIST INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.hospitals USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_health_camps_location ON public.health_camps USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ambulances_location ON public.ambulances USING GIST (location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emergency_requests_pickup ON public.emergency_requests USING GIST (pickup_location) WHERE pickup_location IS NOT NULL;

-- ============================================================
-- POSTGRES RPC FUNCTIONS (PostGIS)
-- ============================================================

-- Function 1: Nearby Hospitals (skips rows where location IS NULL)
CREATE OR REPLACE FUNCTION public.nearby_hospitals(lat FLOAT8, lng FLOAT8, radius_km FLOAT8)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  phone TEXT,
  location GEOGRAPHY,
  is_emergency BOOLEAN,
  specialties TEXT[],
  data_verified BOOLEAN,
  distance_km FLOAT8
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    h.id,
    h.name,
    h.address,
    h.phone,
    h.location,
    h.is_emergency,
    h.specialties,
    h.data_verified,
    ROUND((ST_Distance(h.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000.0)::numeric, 2)::FLOAT8 AS distance_km
  FROM public.hospitals h
  WHERE h.location IS NOT NULL
    AND ST_DWithin(h.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000)
  ORDER BY distance_km ASC;
$$;

-- Function 2: Nearby Health Camps
CREATE OR REPLACE FUNCTION public.nearby_camps(lat FLOAT8, lng FLOAT8, radius_km FLOAT8)
RETURNS TABLE (
  id UUID,
  title TEXT,
  organizer TEXT,
  description TEXT,
  location GEOGRAPHY,
  address TEXT,
  start_date DATE,
  end_date DATE,
  is_free BOOLEAN,
  is_demo BOOLEAN,
  distance_km FLOAT8
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.title,
    c.organizer,
    c.description,
    c.location,
    c.address,
    c.start_date,
    c.end_date,
    c.is_free,
    c.is_demo,
    ROUND((ST_Distance(c.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000.0)::numeric, 2)::FLOAT8 AS distance_km
  FROM public.health_camps c
  WHERE c.location IS NOT NULL
    AND ST_DWithin(c.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000)
    AND (c.end_date >= CURRENT_DATE OR c.end_date IS NULL)
  ORDER BY distance_km ASC;
$$;

-- Function 3: Nearest Available Ambulances
CREATE OR REPLACE FUNCTION public.nearest_ambulances(lat FLOAT8, lng FLOAT8, lim INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  driver_id UUID,
  vehicle_number TEXT,
  type TEXT,
  location GEOGRAPHY,
  is_available BOOLEAN,
  is_demo BOOLEAN,
  distance_km FLOAT8
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    a.id,
    a.driver_id,
    a.vehicle_number,
    a.type,
    a.location,
    a.is_available,
    a.is_demo,
    ROUND((ST_Distance(a.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000.0)::numeric, 2)::FLOAT8 AS distance_km
  FROM public.ambulances a
  WHERE a.is_available = true
    AND a.location IS NOT NULL
  ORDER BY a.location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  LIMIT lim;
$$;

-- ============================================================
-- AUTH TRIGGER: AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'address', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check role in RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can read/update own; admins/pharmacists can view all
CREATE POLICY "Profiles are viewable by owner or staff" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.current_user_role() IN ('admin', 'pharmacist'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.current_user_role() = 'admin');

CREATE POLICY "Profiles can be inserted by owner" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Products: Public read; Admin write
CREATE POLICY "Products are publicly viewable" ON public.products
  FOR SELECT USING (is_active = true OR public.current_user_role() = 'admin');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.current_user_role() = 'admin');

-- 3. Cart Items: Owned by user
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- 4. Prescriptions: Owner read/create; Pharmacist/Admin review
CREATE POLICY "Users view own prescriptions, staff view all" ON public.prescriptions
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_role() IN ('admin', 'pharmacist'));

CREATE POLICY "Users insert own prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update prescriptions" ON public.prescriptions
  FOR UPDATE USING (public.current_user_role() IN ('admin', 'pharmacist'));

-- 5. Orders: Users view own; Staff view all; Users insert with pending; Only staff/functions update
CREATE POLICY "Users view own orders, staff view all" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_role() IN ('admin', 'pharmacist'));

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only staff and service role can update orders" ON public.orders
  FOR UPDATE USING (public.current_user_role() IN ('admin', 'pharmacist'));

-- 6. Order Items: Accessible to order owner or staff
CREATE POLICY "Order items viewable by order owner or staff" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.current_user_role() IN ('admin', 'pharmacist'))
    )
  );

CREATE POLICY "Order items insertable by order owner" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- 7. Ambulances: Public read; Driver updates own ambulance; Admin full access
CREATE POLICY "Ambulances are viewable by all" ON public.ambulances
  FOR SELECT USING (true);

CREATE POLICY "Drivers and admin can update ambulance" ON public.ambulances
  FOR UPDATE USING (auth.uid() = driver_id OR public.current_user_role() = 'admin');

CREATE POLICY "Admins can manage ambulances" ON public.ambulances
  FOR ALL USING (public.current_user_role() = 'admin');

-- 8. Emergency Requests: User views own; Driver views assigned; Admin views all
CREATE POLICY "Users and assigned drivers view emergency requests" ON public.emergency_requests
  FOR SELECT USING (
    auth.uid() = user_id 
    OR ambulance_id IN (SELECT id FROM public.ambulances WHERE driver_id = auth.uid())
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "Users can insert emergency requests" ON public.emergency_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Assigned drivers and admin can update emergency requests" ON public.emergency_requests
  FOR UPDATE USING (
    ambulance_id IN (SELECT id FROM public.ambulances WHERE driver_id = auth.uid())
    OR public.current_user_role() = 'admin'
  );

-- 9. Hospitals: Public read; Admin write
CREATE POLICY "Hospitals are publicly viewable" ON public.hospitals
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage hospitals" ON public.hospitals
  FOR ALL USING (public.current_user_role() = 'admin');

-- 10. Health Camps: Public read; Admin write
CREATE POLICY "Health camps are publicly viewable" ON public.health_camps
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage health camps" ON public.health_camps
  FOR ALL USING (public.current_user_role() = 'admin');

-- 11. Chat Sessions: User only
CREATE POLICY "Users manage their own chat sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 12. Chat Messages: User only
CREATE POLICY "Users manage their own chat messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id);
