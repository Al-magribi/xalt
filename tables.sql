BEGIN;

CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS sales;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS settings;

CREATE TABLE IF NOT EXISTS content.kits (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.kit_gallery_images (
  id BIGSERIAL PRIMARY KEY,
  kit_id BIGINT NOT NULL REFERENCES content.kits(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.merchandise_items (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  price_amount NUMERIC(12,2) NOT NULL CHECK (price_amount >= 0),
  min_order INT NOT NULL DEFAULT 1 CHECK (min_order >= 1),
  weight_gram INT NOT NULL DEFAULT 0 CHECK (weight_gram >= 0),
  size_options TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  material_options TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  currency CHAR(3) NOT NULL DEFAULT 'IDR',
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.merchandise_gallery_images (
  id BIGSERIAL PRIMARY KEY,
  merchandise_item_id BIGINT NOT NULL REFERENCES content.merchandise_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.catalog_files (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE content.merchandise_items
  ADD COLUMN IF NOT EXISTS detail TEXT NOT NULL DEFAULT '';

ALTER TABLE content.merchandise_items
  ADD COLUMN IF NOT EXISTS min_order INT NOT NULL DEFAULT 1;

ALTER TABLE content.merchandise_items
  ADD COLUMN IF NOT EXISTS weight_gram INT NOT NULL DEFAULT 0;

ALTER TABLE content.merchandise_items
  ADD COLUMN IF NOT EXISTS size_options TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE content.merchandise_items
  ADD COLUMN IF NOT EXISTS material_options TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'merchandise_items_min_order_check'
  ) THEN
    ALTER TABLE content.merchandise_items
      ADD CONSTRAINT merchandise_items_min_order_check CHECK (min_order >= 1);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS content.process_steps (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.testimonials (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  quote TEXT NOT NULL,
  link_url TEXT,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.faqs (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.nav_items (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.trusted_logos (
  id BIGSERIAL PRIMARY KEY,
  brand_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE content.trusted_logos
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE TABLE IF NOT EXISTS sales.contact_leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  source_page TEXT,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  phone TEXT,
  email TEXT,
  real_ip INET,
  city_name TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sales.contact_leads
  ADD COLUMN IF NOT EXISTS real_ip INET;

ALTER TABLE sales.contact_leads
  ADD COLUMN IF NOT EXISTS city_name TEXT;

CREATE TABLE IF NOT EXISTS sales.product_inquiries (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES sales.contact_leads(id) ON DELETE SET NULL,
  merchandise_item_id BIGINT REFERENCES content.merchandise_items(id) ON DELETE SET NULL,
  kit_id BIGINT REFERENCES content.kits(id) ON DELETE SET NULL,
  inquiry_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_inquiries_target_check CHECK (
    merchandise_item_id IS NOT NULL OR kit_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS sales.merchandise_orders (
  id BIGSERIAL PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  merchandise_item_id BIGINT NOT NULL REFERENCES content.merchandise_items(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 1),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  subtotal_amount NUMERIC(12,2) NOT NULL CHECK (subtotal_amount >= 0),
  shipping_province_id BIGINT NOT NULL,
  shipping_province_name TEXT NOT NULL,
  shipping_city_id BIGINT NOT NULL,
  shipping_city_name TEXT NOT NULL,
  shipping_district_id BIGINT NOT NULL,
  shipping_district_name TEXT NOT NULL,
  shipping_subdistrict_id BIGINT,
  shipping_subdistrict_name TEXT,
  shipping_address TEXT NOT NULL,
  shipping_postal_code TEXT,
  shipping_courier_code TEXT NOT NULL,
  shipping_courier_name TEXT NOT NULL,
  shipping_service_code TEXT NOT NULL,
  shipping_service_name TEXT NOT NULL,
  shipping_etd TEXT,
  shipping_tracking_number TEXT,
  shipping_cost_amount NUMERIC(12,2) NOT NULL CHECK (shipping_cost_amount >= 0),
  grand_total_amount NUMERIC(12,2) NOT NULL CHECK (grand_total_amount >= 0),
  order_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    order_status IN ('draft', 'pending_payment', 'diproses', 'dikirim', 'selesai', 'paid', 'cancelled', 'expired')
  ),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')
  ),
  payment_reference TEXT,
  payment_due_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sales.merchandise_orders
  ADD COLUMN IF NOT EXISTS shipping_tracking_number TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'sales'
      AND table_name = 'merchandise_order_checkouts'
  ) THEN
    INSERT INTO sales.merchandise_orders (
      order_code,
      merchandise_item_id,
      customer_name,
      customer_email,
      customer_whatsapp,
      quantity,
      unit_price,
      subtotal_amount,
      shipping_province_id,
      shipping_province_name,
      shipping_city_id,
      shipping_city_name,
      shipping_district_id,
      shipping_district_name,
      shipping_subdistrict_id,
      shipping_subdistrict_name,
      shipping_address,
      shipping_postal_code,
      shipping_courier_code,
      shipping_courier_name,
      shipping_service_code,
      shipping_service_name,
      shipping_etd,
      shipping_cost_amount,
      grand_total_amount,
      order_status,
      payment_status,
      payment_reference,
      payment_due_at,
      notes,
      created_at,
      updated_at
    )
    SELECT
      c.order_code,
      c.merchandise_item_id,
      c.customer_name,
      c.customer_email,
      c.customer_whatsapp,
      c.quantity,
      c.unit_price,
      c.subtotal_amount,
      c.shipping_province_id,
      c.shipping_province_name,
      c.shipping_city_id,
      c.shipping_city_name,
      c.shipping_district_id,
      c.shipping_district_name,
      c.shipping_subdistrict_id,
      c.shipping_subdistrict_name,
      c.shipping_address,
      c.shipping_postal_code,
      c.shipping_courier_code,
      c.shipping_courier_name,
      c.shipping_service_code,
      c.shipping_service_name,
      c.shipping_etd,
      c.shipping_cost_amount,
      c.grand_total_amount,
      CASE
        WHEN c.payment_status = 'paid' THEN 'paid'
        WHEN c.payment_status = 'pending' THEN 'pending_payment'
        WHEN c.payment_status = 'expired' THEN 'expired'
        WHEN c.payment_status IN ('cancelled', 'failed') THEN 'cancelled'
        ELSE 'draft'
      END,
      CASE
        WHEN c.payment_status IN ('pending', 'paid', 'failed', 'expired', 'cancelled') THEN c.payment_status
        ELSE 'pending'
      END,
      c.payment_reference,
      c.payment_due_at,
      NULLIF(c.payment_status || ' | ' || COALESCE(c.transaction_status, ''), ''),
      c.created_at,
      c.updated_at
    FROM sales.merchandise_order_checkouts c
    ON CONFLICT (order_code)
    DO UPDATE SET
      order_status = EXCLUDED.order_status,
      payment_status = EXCLUDED.payment_status,
      payment_reference = EXCLUDED.payment_reference,
      payment_due_at = EXCLUDED.payment_due_at,
      notes = EXCLUDED.notes,
      updated_at = NOW();
  END IF;
END $$;

DROP TABLE IF EXISTS sales.merchandise_order_checkouts;

DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  FOR constraint_row IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'c'
      AND n.nspname = 'sales'
      AND t.relname = 'merchandise_orders'
      AND pg_get_constraintdef(c.oid) ILIKE '%order_status IN%'
  LOOP
    EXECUTE format(
      'ALTER TABLE sales.merchandise_orders DROP CONSTRAINT IF EXISTS %I',
      constraint_row.conname
    );
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'c'
      AND n.nspname = 'sales'
      AND t.relname = 'merchandise_orders'
      AND c.conname = 'merchandise_orders_order_status_check'
  ) THEN
    ALTER TABLE sales.merchandise_orders
      ADD CONSTRAINT merchandise_orders_order_status_check CHECK (
        order_status IN (
          'draft',
          'pending_payment',
          'diproses',
          'dikirim',
          'selesai',
          'paid',
          'cancelled',
          'expired'
        )
      );
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS auth.users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.activation_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.visitor_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  visitor_id TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  landing_path TEXT NOT NULL,
  entry_referrer TEXT,
  first_ip INET,
  last_ip INET,
  user_agent TEXT,
  accept_language TEXT,
  country_code CHAR(2),
  country_name TEXT,
  region_name TEXT,
  city_name TEXT,
  postal_code TEXT,
  timezone TEXT,
  is_bot BOOLEAN NOT NULL DEFAULT FALSE,
  pageview_count INT NOT NULL DEFAULT 1 CHECK (pageview_count >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.visit_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  visitor_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_type TEXT NOT NULL CHECK (
    page_type IN (
      'home',
      'catalog_detail',
      'merchandise_list',
      'merchandise_detail',
      'auth',
      'other'
    )
  ),
  route_path TEXT NOT NULL,
  route_slug TEXT,
  query_string TEXT,
  referrer TEXT,
  request_method TEXT NOT NULL DEFAULT 'GET',
  response_status INT,
  real_ip INET NOT NULL,
  ip_source TEXT NOT NULL DEFAULT 'x-forwarded-for',
  forwarded_for_chain TEXT,
  user_agent TEXT,
  accept_language TEXT,
  country_code CHAR(2),
  country_name TEXT,
  region_name TEXT,
  city_name TEXT,
  postal_code TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  timezone TEXT,
  asn TEXT,
  isp_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT visit_events_session_fk
    FOREIGN KEY (session_id) REFERENCES analytics.visitor_sessions(session_id) ON DELETE CASCADE
);

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS fbp TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS fbc TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS fbclid TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS utm_source TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS utm_medium TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS utm_term TEXT;

ALTER TABLE analytics.visit_events
  ADD COLUMN IF NOT EXISTS utm_content TEXT;

CREATE TABLE IF NOT EXISTS analytics.meta_pixel_events (
  id BIGSERIAL PRIMARY KEY,
  visit_event_id BIGINT REFERENCES analytics.visit_events(id) ON DELETE SET NULL,
  session_id UUID,
  event_name TEXT NOT NULL,
  event_id UUID NOT NULL,
  pixel_id TEXT NOT NULL,
  request_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  response_status INT,
  response_body JSONB,
  is_success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings.website_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'X-ALT',
  site_tagline TEXT,
  app_url TEXT,
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  hero_title TEXT,
  hero_description TEXT,
  hero_note TEXT,
  hero_image_url TEXT,
  hero_badge_title TEXT,
  hero_badge_text TEXT,
  default_language TEXT NOT NULL DEFAULT 'id',
  support_email TEXT,
  support_phone TEXT,
  whatsapp_number TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS hero_title TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS hero_description TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS hero_note TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS hero_badge_title TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS hero_badge_text TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS app_url TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;

ALTER TABLE settings.website_config
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE settings.website_config
  DROP COLUMN IF EXISTS hero_primary_label;

ALTER TABLE settings.website_config
  DROP COLUMN IF EXISTS hero_primary_href;

ALTER TABLE settings.website_config
  DROP COLUMN IF EXISTS hero_secondary_label;

ALTER TABLE settings.website_config
  DROP COLUMN IF EXISTS hero_secondary_href;

CREATE TABLE IF NOT EXISTS settings.seo_metadata (
  id BIGSERIAL PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  page_path TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  canonical_url TEXT,
  robots_index BOOLEAN NOT NULL DEFAULT TRUE,
  robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT NOT NULL DEFAULT 'website',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings.api_integrations (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE CHECK (
    provider IN (
      'meta_pixel',
      'google_ads',
      'midtrans',
      'raja_ongkir'
    )
  ),
  display_name TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  public_key TEXT,
  secret_key TEXT,
  merchant_id TEXT,
  endpoint_url TEXT,
  additional_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings.smtp_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  provider TEXT NOT NULL DEFAULT 'smtp',
  host TEXT NOT NULL,
  port INT NOT NULL DEFAULT 587 CHECK (port > 0 AND port <= 65535),
  secure BOOLEAN NOT NULL DEFAULT FALSE,
  encryption TEXT NOT NULL DEFAULT 'tls' CHECK (encryption IN ('none', 'ssl', 'tls')),
  username TEXT,
  password TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kits_is_active ON content.kits(is_active);
CREATE INDEX IF NOT EXISTS idx_kits_updated_at ON content.kits(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_kit_gallery_kit_id ON content.kit_gallery_images(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_gallery_sort_order ON content.kit_gallery_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_merchandise_items_is_active ON content.merchandise_items(is_active);
CREATE INDEX IF NOT EXISTS idx_merchandise_items_is_featured ON content.merchandise_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_merchandise_items_updated_at ON content.merchandise_items(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchandise_gallery_merchandise_item_id ON content.merchandise_gallery_images(merchandise_item_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_gallery_sort_order ON content.merchandise_gallery_images(sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_files_is_active ON content.catalog_files(is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_files_updated_at ON content.catalog_files(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_process_steps_is_active ON content.process_steps(is_active);
CREATE INDEX IF NOT EXISTS idx_process_steps_sort_order ON content.process_steps(sort_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON content.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order ON content.testimonials(sort_order);

CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON content.faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON content.faqs(sort_order);

CREATE INDEX IF NOT EXISTS idx_nav_items_is_active ON content.nav_items(is_active);
CREATE INDEX IF NOT EXISTS idx_nav_items_sort_order ON content.nav_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_trusted_logos_is_active ON content.trusted_logos(is_active);
CREATE INDEX IF NOT EXISTS idx_trusted_logos_sort_order ON content.trusted_logos(sort_order);

CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON sales.contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON sales.contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_updated_at ON sales.contact_leads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_real_ip ON sales.contact_leads(real_ip);
CREATE INDEX IF NOT EXISTS idx_contact_leads_city_name ON sales.contact_leads(city_name);

CREATE INDEX IF NOT EXISTS idx_product_inquiries_lead_id ON sales.product_inquiries(lead_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_merchandise_item_id ON sales.product_inquiries(merchandise_item_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_kit_id ON sales.product_inquiries(kit_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_created_at ON sales.product_inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merchandise_orders_order_code ON sales.merchandise_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_merchandise_item_id ON sales.merchandise_orders(merchandise_item_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_order_status ON sales.merchandise_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_payment_status ON sales.merchandise_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_created_at ON sales.merchandise_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_customer_email_lower ON sales.merchandise_orders((LOWER(customer_email)));
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_customer_whatsapp ON sales.merchandise_orders(customer_whatsapp);


CREATE INDEX IF NOT EXISTS idx_auth_users_is_active ON auth.users(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_users_role ON auth.users(role);
CREATE INDEX IF NOT EXISTS idx_auth_users_updated_at ON auth.users(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth.sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON auth.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON auth.password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_activation_tokens_user_id ON auth.activation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_expires_at ON auth.activation_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_first_seen_at ON analytics.visitor_sessions(first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_seen_at ON analytics.visitor_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country_code ON analytics.visitor_sessions(country_code);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_city_name ON analytics.visitor_sessions(city_name);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_first_ip ON analytics.visitor_sessions(first_ip);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_ip ON analytics.visitor_sessions(last_ip);

CREATE INDEX IF NOT EXISTS idx_visit_events_occurred_at ON analytics.visit_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_events_page_type ON analytics.visit_events(page_type);
CREATE INDEX IF NOT EXISTS idx_visit_events_route_path ON analytics.visit_events(route_path);
CREATE INDEX IF NOT EXISTS idx_visit_events_route_slug ON analytics.visit_events(route_slug);
CREATE INDEX IF NOT EXISTS idx_visit_events_session_id ON analytics.visit_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visit_events_real_ip ON analytics.visit_events(real_ip);
CREATE INDEX IF NOT EXISTS idx_visit_events_country_code ON analytics.visit_events(country_code);
CREATE INDEX IF NOT EXISTS idx_visit_events_city_name ON analytics.visit_events(city_name);
CREATE INDEX IF NOT EXISTS idx_visit_events_fbclid ON analytics.visit_events(fbclid);
CREATE INDEX IF NOT EXISTS idx_visit_events_utm_source ON analytics.visit_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_visit_events_utm_campaign ON analytics.visit_events(utm_campaign);

CREATE INDEX IF NOT EXISTS idx_meta_pixel_events_created_at ON analytics.meta_pixel_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meta_pixel_events_is_success ON analytics.meta_pixel_events(is_success);
CREATE INDEX IF NOT EXISTS idx_meta_pixel_events_session_id ON analytics.meta_pixel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_meta_pixel_events_event_id ON analytics.meta_pixel_events(event_id);

CREATE INDEX IF NOT EXISTS idx_website_config_updated_at ON settings.website_config(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_path ON settings.seo_metadata(page_path);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_updated_at ON settings.seo_metadata(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_integrations_is_active ON settings.api_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_api_integrations_environment ON settings.api_integrations(environment);
CREATE INDEX IF NOT EXISTS idx_smtp_config_is_active ON settings.smtp_config(is_active);
CREATE INDEX IF NOT EXISTS idx_smtp_config_updated_at ON settings.smtp_config(updated_at DESC);

-- =========================================================
-- Seed Dummy Data (idempotent)
-- =========================================================

INSERT INTO content.kits (slug, title, description, hero_image_url, is_active)
VALUES
  ('startup-kit', 'Startup Kit', 'Paket onboarding berisi apparel, tumbler, notebook, dan welcome card.', 'https://images.pexels.com/photos/8490187/pexels-photo-8490187.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE),
  ('bank-kit', 'Bank Kit', 'Kit premium untuk program loyalitas nasabah dan gifting korporat.', 'https://images.pexels.com/photos/29245962/pexels-photo-29245962.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE),
  ('event-kit', 'Event Kit', 'Bundle merchandise event untuk seminar, expo, dan activation.', 'https://images.pexels.com/photos/23325939/pexels-photo-23325939.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE),
  ('eco-merchandise-kit', 'Eco Merchandise Kit', 'Koleksi item ramah lingkungan untuk kampanye sustainability.', 'https://images.pexels.com/photos/17828687/pexels-photo-17828687.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content.kit_gallery_images (kit_id, image_url, sort_order)
SELECT k.id, v.image_url, v.sort_order
FROM content.kits k
JOIN (
  VALUES
    ('startup-kit', 'https://images.pexels.com/photos/8490187/pexels-photo-8490187.jpeg?auto=compress&cs=tinysrgb&w=1600', 1),
    ('startup-kit', 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1600', 2),
    ('bank-kit', 'https://images.pexels.com/photos/29245962/pexels-photo-29245962.jpeg?auto=compress&cs=tinysrgb&w=1600', 1),
    ('event-kit', 'https://images.pexels.com/photos/23325939/pexels-photo-23325939.jpeg?auto=compress&cs=tinysrgb&w=1600', 1),
    ('eco-merchandise-kit', 'https://images.pexels.com/photos/17828687/pexels-photo-17828687.jpeg?auto=compress&cs=tinysrgb&w=1600', 1)
) AS v(kit_slug, image_url, sort_order)
  ON v.kit_slug = k.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM content.kit_gallery_images g
  WHERE g.kit_id = k.id
    AND g.image_url = v.image_url
);

INSERT INTO content.merchandise_items (slug, title, detail, price_amount, min_order, weight_gram, currency, image_url, is_featured, is_active)
VALUES
  ('coffee-mugs', 'Coffee Mugs', 'Mug keramik custom logo untuk kantor, event, dan corporate gifting.', 55000, 50, 350, 'IDR', 'https://images.pexels.com/photos/1759656/pexels-photo-1759656.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE, TRUE),
  ('embroidered-shirts', 'Embroidered Shirts', 'Kemeja bordir premium dengan jahitan rapi untuk seragam perusahaan.', 185000, 50, 250, 'IDR', 'https://images.pexels.com/photos/9558583/pexels-photo-9558583.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE, TRUE),
  ('phone-cases', 'Phone Cases', 'Case ponsel custom branding untuk campaign promosi.', 90000, 50, 120, 'IDR', 'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=1600', FALSE, TRUE),
  ('hoodies', 'Hoodies', 'Hoodie fleece tebal dengan opsi sablon atau bordir.', 220000, 50, 600, 'IDR', 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=1600', TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content.process_steps (title, description, sort_order, is_active)
SELECT v.title, v.description, v.sort_order, TRUE
FROM (
  VALUES
    ('Brief', 'Diskusi kebutuhan campaign, target audiens, timeline, dan budget.', 1),
    ('Mockup', 'Tim desain menyiapkan visual konsep produk dan kemasan.', 2),
    ('Sample', 'Sampel fisik atau digital proof dikirim untuk validasi.', 3),
    ('Produksi', 'Produksi dilakukan terukur dengan kontrol proses.', 4),
    ('QC', 'Setiap item melewati quality check sebelum packing.', 5),
    ('Kirim', 'Pengiriman ke kantor pusat, cabang, atau multi-alamat.', 6)
) AS v(title, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM content.process_steps p
  WHERE p.title = v.title
);

INSERT INTO content.testimonials (client_name, title, quote, link_url, rating, sort_order, is_active)
SELECT v.client_name, v.title, v.quote, v.link_url, 5, v.sort_order, TRUE
FROM (
  VALUES
    ('Dio Pradana', 'Eksekusi campaign sangat sinkron', 'Tim X-ALT sangat rapi dari sisi komunikasi hingga pengiriman.', '#', 1),
    ('Nadia Kusuma', 'Produk premium dan support cepat', 'Kualitas produk konsisten dan support timnya responsif.', '#', 2),
    ('Rizki Aditya', 'Integrasi kebutuhan event jadi mudah', 'Distribusi kit ke banyak kota berjalan tanpa ribet.', '#', 3)
) AS v(client_name, title, quote, link_url, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM content.testimonials t
  WHERE t.client_name = v.client_name
    AND t.title = v.title
);

INSERT INTO content.faqs (question, answer, sort_order, is_active)
SELECT v.question, v.answer, v.sort_order, TRUE
FROM (
  VALUES
    ('Apakah bisa custom penuh sesuai identitas brand?', 'Bisa. Semua elemen dapat disesuaikan dengan guideline brand Anda.', 1),
    ('Berapa minimum order untuk setiap kit?', 'Minimum order menyesuaikan jenis produk dan material.', 2),
    ('Apakah X-ALT bisa kirim ke banyak alamat?', 'Ya, kami melayani pengiriman terpusat maupun multi-lokasi.', 3)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM content.faqs f
  WHERE f.question = v.question
);

INSERT INTO content.nav_items (label, href, sort_order, is_active)
SELECT v.label, v.href, v.sort_order, TRUE
FROM (
  VALUES
    ('Katalog', '#katalog', 1),
    ('FAQ', '#faq', 2),
    ('Kontak', '#kontak', 3)
) AS v(label, href, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM content.nav_items n
  WHERE n.label = v.label
    AND n.href = v.href
);

INSERT INTO content.trusted_logos (brand_name, logo_url, sort_order, is_active)
SELECT v.brand_name, v.logo_url, v.sort_order, TRUE
FROM (
  VALUES
    ('Nexora', '/logos/nexora.svg', 1),
    ('Bluebank', '/logos/bluebank.svg', 2),
    ('Ventura', '/logos/ventura.svg', 3),
    ('Urbanova', '/logos/urbanova.svg', 4)
) AS v(brand_name, logo_url, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM content.trusted_logos l
  WHERE l.brand_name = v.brand_name
);

INSERT INTO sales.contact_leads (name, message, source_page, channel, phone, email, status)
SELECT v.name, v.message, v.source_page, v.channel, v.phone, v.email, v.status
FROM (
  VALUES
    ('Andi Pratama', 'Saya ingin diskusi Event Kit untuk 300 peserta.', '/#kontak', 'whatsapp', '628123450001', 'andi@contoh.id', 'new'),
    ('Siti Rahma', 'Butuh penawaran hoodie custom untuk onboarding.', '/merchandise/hoodies', 'form', '628123450002', 'siti@contoh.id', 'contacted')
) AS v(name, message, source_page, channel, phone, email, status)
WHERE NOT EXISTS (
  SELECT 1
  FROM sales.contact_leads c
  WHERE c.email = v.email
    AND c.message = v.message
);

INSERT INTO sales.product_inquiries (lead_id, merchandise_item_id, kit_id, inquiry_text, created_at)
SELECT
  l.id,
  m.id,
  NULL,
  'Mohon estimasi produksi 100 pcs dan SLA pengiriman.',
  NOW()
FROM sales.contact_leads l
JOIN content.merchandise_items m ON m.slug = 'hoodies'
WHERE l.email = 'siti@contoh.id'
  AND NOT EXISTS (
    SELECT 1
    FROM sales.product_inquiries i
    WHERE i.lead_id = l.id
      AND i.merchandise_item_id = m.id
      AND i.inquiry_text = 'Mohon estimasi produksi 100 pcs dan SLA pengiriman.'
  );

INSERT INTO auth.users (email, password_hash, full_name, role, is_active)
VALUES
  ('admin@x-alt.id', '$2b$12$7fN9bS9IhYVt2H3QdIkN1u4nWjRWfW2B9k4hSg11f98m7P5f3hR4a', 'Admin X-ALT', 'admin', TRUE),
  ('staff@x-alt.id', '$2b$12$8Lr8zYh0f9oVQv3G9aXk2O4Q3JrTq4Y1M9x2mN5bH6pQ1dS7vC8eK', 'Staff Marketing', 'user', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO auth.sessions (user_id, refresh_token_hash, expires_at, created_at, revoked_at)
SELECT u.id, 'dummy_refresh_token_hash_admin_001', NOW() + INTERVAL '30 days', NOW(), NULL
FROM auth.users u
WHERE u.email = 'admin@x-alt.id'
  AND NOT EXISTS (
    SELECT 1
    FROM auth.sessions s
    WHERE s.user_id = u.id
      AND s.refresh_token_hash = 'dummy_refresh_token_hash_admin_001'
  );

INSERT INTO auth.password_reset_tokens (user_id, token_hash, expires_at, used_at, created_at)
SELECT u.id, 'dummy_reset_token_hash_staff_001', NOW() + INTERVAL '2 hours', NULL, NOW()
FROM auth.users u
WHERE u.email = 'staff@x-alt.id'
  AND NOT EXISTS (
    SELECT 1
    FROM auth.password_reset_tokens t
    WHERE t.user_id = u.id
      AND t.token_hash = 'dummy_reset_token_hash_staff_001'
  );

INSERT INTO analytics.visitor_sessions (
  session_id,
  visitor_id,
  first_seen_at,
  last_seen_at,
  landing_path,
  entry_referrer,
  first_ip,
  last_ip,
  user_agent,
  accept_language,
  country_code,
  country_name,
  region_name,
  city_name,
  postal_code,
  timezone,
  is_bot,
  pageview_count,
  created_at,
  updated_at
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'visitor-demo-001',
    '2026-02-20 08:10:00+07',
    '2026-02-20 08:19:00+07',
    '/',
    'https://google.com',
    '36.88.12.10',
    '36.88.12.10',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'id-ID,id;q=0.9,en-US;q=0.8',
    'ID',
    'Indonesia',
    'DKI Jakarta',
    'Jakarta',
    '10110',
    'Asia/Jakarta',
    FALSE,
    4,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'visitor-demo-002',
    '2026-02-20 09:02:00+07',
    '2026-02-20 09:07:00+07',
    '/merchandise',
    'https://instagram.com',
    '103.10.20.31',
    '103.10.20.31',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    'id-ID,id;q=0.9',
    'ID',
    'Indonesia',
    'Jawa Barat',
    'Bandung',
    '40111',
    'Asia/Jakarta',
    FALSE,
    3,
    NOW(),
    NOW()
  )
ON CONFLICT (session_id) DO NOTHING;

INSERT INTO analytics.visit_events (
  session_id,
  visitor_id,
  occurred_at,
  page_type,
  route_path,
  route_slug,
  query_string,
  referrer,
  request_method,
  response_status,
  real_ip,
  ip_source,
  forwarded_for_chain,
  user_agent,
  accept_language,
  fbp,
  fbc,
  fbclid,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_term,
  utm_content,
  country_code,
  country_name,
  region_name,
  city_name,
  postal_code,
  latitude,
  longitude,
  timezone,
  asn,
  isp_name,
  created_at
)
SELECT *
FROM (
  VALUES
    ('11111111-1111-1111-1111-111111111111'::UUID, 'visitor-demo-001', '2026-02-20 08:10:00+07'::TIMESTAMPTZ, 'home', '/', NULL, NULL, 'https://google.com', 'GET', 200, '36.88.12.10'::INET, 'x-forwarded-for', '36.88.12.10, 172.68.10.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'id-ID,id;q=0.9,en-US;q=0.8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ID', 'Indonesia', 'DKI Jakarta', 'Jakarta', '10110', -6.200000::NUMERIC(9,6), 106.816666::NUMERIC(9,6), 'Asia/Jakarta', 'AS7713', 'Telkom Indonesia', NOW()),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'visitor-demo-001', '2026-02-20 08:15:00+07'::TIMESTAMPTZ, 'merchandise_list', '/merchandise', NULL, NULL, '/', 'GET', 200, '36.88.12.10'::INET, 'x-forwarded-for', '36.88.12.10, 172.68.10.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'id-ID,id;q=0.9,en-US;q=0.8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ID', 'Indonesia', 'DKI Jakarta', 'Jakarta', '10110', -6.200000::NUMERIC(9,6), 106.816666::NUMERIC(9,6), 'Asia/Jakarta', 'AS7713', 'Telkom Indonesia', NOW()),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'visitor-demo-002', '2026-02-20 09:03:00+07'::TIMESTAMPTZ, 'merchandise_detail', '/merchandise/hoodies', 'hoodies', 'fbclid=AQwxyz123&utm_source=meta&utm_medium=paid_social&utm_campaign=launch_hoodie', '/merchandise', 'GET', 200, '103.10.20.31'::INET, 'x-real-ip', '103.10.20.31, 104.26.5.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'id-ID,id;q=0.9', 'fb.1.1708571000.1100220033', 'fb.1.1708571000.AQwxyz123', 'AQwxyz123', 'meta', 'paid_social', 'launch_hoodie', NULL, NULL, 'ID', 'Indonesia', 'Jawa Barat', 'Bandung', '40111', -6.917500::NUMERIC(9,6), 107.619100::NUMERIC(9,6), 'Asia/Jakarta', 'AS45727', 'Biznet Networks', NOW())
) AS v(
  session_id,
  visitor_id,
  occurred_at,
  page_type,
  route_path,
  route_slug,
  query_string,
  referrer,
  request_method,
  response_status,
  real_ip,
  ip_source,
  forwarded_for_chain,
  user_agent,
  accept_language,
  fbp,
  fbc,
  fbclid,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_term,
  utm_content,
  country_code,
  country_name,
  region_name,
  city_name,
  postal_code,
  latitude,
  longitude,
  timezone,
  asn,
  isp_name,
  created_at
)
WHERE NOT EXISTS (
  SELECT 1
  FROM analytics.visit_events e
  WHERE e.session_id = v.session_id
    AND e.route_path = v.route_path
    AND e.occurred_at = v.occurred_at
);

INSERT INTO settings.website_config (
  id,
  site_name,
  site_tagline,
  app_url,
  logo_url,
  logo_dark_url,
  favicon_url,
  hero_title,
  hero_description,
  hero_note,
  hero_image_url,
  hero_badge_title,
  hero_badge_text,
  default_language,
  support_email,
  support_phone,
  whatsapp_number,
  instagram_url,
  linkedin_url
)
VALUES (
  1,
  'X-ALT',
  'Solusi Merchandise Kit untuk Brand dan Event',
  'https://xaltcorp.com',
  '/logos/xalt-logo-light.svg',
  '/logos/xalt-logo-dark.svg',
  '/favicon.ico',
  'Corporate Merchandise',
  'X-ALT adalah partner end-to-end untuk Startup Kit, Bank Kit, Event Kit, dan Eco Merchandise Kit dengan standar produksi enterprise.',
  'Dipakai tim procurement, HR, marketing, dan event di perusahaan berkembang hingga enterprise.',
  'https://images.pexels.com/photos/34109327/pexels-photo-34109327.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'Produksi Terukur',
  'QC, packing, dan distribusi multi-lokasi.',
  'id',
  'hello@x-alt.id',
  '+62 877-2077-6871',
  '6287720776871',
  'https://instagram.com',
  'https://linkedin.com'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings.seo_metadata (
  page_key,
  page_path,
  meta_title,
  meta_description,
  meta_keywords,
  canonical_url,
  robots_index,
  robots_follow,
  og_title,
  og_description,
  og_image_url,
  og_type,
  twitter_card,
  twitter_title,
  twitter_description,
  twitter_image_url
)
VALUES
  (
    'home',
    '/',
    'X-ALT | Solusi Merchandise Kit untuk Brand & Event',
    'X-ALT menyediakan merchandise kit modern untuk startup, bank, dan event.',
    ARRAY['merchandise', 'startup kit', 'bank kit', 'event kit', 'corporate gifting'],
    'https://x-alt.id',
    TRUE,
    TRUE,
    'X-ALT | Solusi Merchandise Kit untuk Brand & Event',
    'Startup Kit, Bank Kit, Event Kit, dan Eco Merchandise Kit dengan kualitas premium.',
    'https://x-alt.id/og/home.jpg',
    'website',
    'summary_large_image',
    'X-ALT | Solusi Merchandise Kit untuk Brand & Event',
    'Temukan koleksi merchandise kit custom untuk kebutuhan brand dan event perusahaan.',
    'https://x-alt.id/og/home.jpg'
  ),
  (
    'merchandise_list',
    '/merchandise',
    'Semua Merchandise | X-ALT',
    'Jelajahi seluruh pilihan merchandise lengkap dengan estimasi harga dan minimum order.',
    ARRAY['merchandise custom', 'harga merchandise', 'minimum order'],
    'https://x-alt.id/merchandise',
    TRUE,
    TRUE,
    'Semua Merchandise | X-ALT',
    'Pilihan produk populer untuk branding, onboarding, dan event.',
    'https://x-alt.id/og/merchandise.jpg',
    'website',
    'summary_large_image',
    'Semua Merchandise | X-ALT',
    'Produk merchandise custom siap produksi untuk kebutuhan perusahaan.',
    'https://x-alt.id/og/merchandise.jpg'
  )
ON CONFLICT (page_key) DO NOTHING;

INSERT INTO settings.api_integrations (
  provider,
  display_name,
  environment,
  is_active,
  public_key,
  secret_key,
  merchant_id,
  endpoint_url,
  additional_config,
  last_tested_at
)
VALUES
  (
    'meta_pixel',
    'Meta Pixel',
    'production',
    TRUE,
    '123456789012345',
    'meta-access-token-placeholder',
    NULL,
    NULL,
    '{
      "event_tracking": ["PageView", "ViewContent", "Lead"],
      "test_event_code": null
    }'::JSONB,
    NOW()
  ),
  (
    'google_ads',
    'Google Ads Pixel',
    'production',
    TRUE,
    'AW-1234567890',
    NULL,
    NULL,
    NULL,
    '{"conversion_labels": {"lead": "abcDEFghiJKL"}}'::JSONB,
    NOW()
  ),
  (
    'midtrans',
    'Midtrans Snap',
    'sandbox',
    FALSE,
    'SB-Mid-client-xxxxxxxx',
    'SB-Mid-server-xxxxxxxx',
    'G123456789',
    'https://app.sandbox.midtrans.com/snap/v1/transactions',
    '{"payment_methods": ["bank_transfer", "gopay", "qris"]}'::JSONB,
    NULL
  ),
  (
    'raja_ongkir',
    'RajaOngkir',
    'sandbox',
    FALSE,
    'rajaongkir-public-xxxxx',
    'rajaongkir-secret-xxxxx',
    NULL,
    'https://rajaongkir.komerce.id/api/v1',
    '{
      "couriers": ["jne", "tiki", "pos"],
      "store_origin": {
        "province_id": null,
        "province_name": null,
        "city_id": null,
        "city_name": null,
        "district_id": null,
        "district_name": null,
        "subdistrict_id": null,
        "subdistrict_name": null
      }
    }'::JSONB,
    NULL
  )
ON CONFLICT (provider) DO NOTHING;

INSERT INTO settings.smtp_config (
  id,
  provider,
  host,
  port,
  secure,
  encryption,
  username,
  password,
  from_name,
  from_email,
  reply_to_email,
  is_active,
  last_tested_at
)
VALUES (
  1,
  'smtp',
  'smtp.gmail.com',
  587,
  FALSE,
  'tls',
  'no-reply@x-alt.id',
  'replace-with-real-smtp-password',
  'X-ALT Support',
  'no-reply@x-alt.id',
  'support@x-alt.id',
  FALSE,
  NULL
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
