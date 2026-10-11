-- ============================================================================
-- Development seed data for the catalog (categories/brands/products/models/
-- parts). Safe to run anytime - uses ON CONFLICT DO NOTHING so re-running it
-- won't create duplicates.
--
-- NOTE: We deliberately do NOT seed `listings` or `need_requests` here,
-- because those need a real seller_id that references a row in auth.users,
-- and auth.users can only be populated by actually signing up (Supabase
-- manages that table for you). Two ways to get realistic sample listings:
--   1. Sign up for a test account in the running app, then use the /sell
--      form to create a few listings from src/lib/sample-data.ts by hand.
--   2. The homepage and /browse pages already render src/lib/sample-data.ts
--      as fallback "Sample" listings whenever the database has fewer than a
--      handful of real listings, so you get a realistic-looking dev
--      experience with zero setup.
-- ============================================================================

-- Categories -------------------------------------------------------------
insert into public.categories (slug, name, icon, sort_order) values
  ('electronics', 'Electronics', 'Headphones', 1),
  ('laptops', 'Laptops', 'Laptop', 2),
  ('gaming', 'Gaming', 'Gamepad2', 3),
  ('wearables', 'Wearables', 'Watch', 4),
  ('cameras', 'Cameras', 'Camera', 5),
  ('appliances', 'Appliances', 'Microwave', 6),
  ('furniture', 'Furniture', 'Armchair', 7),
  ('automotive', 'Automotive', 'Car', 8),
  ('other', 'Other', 'Puzzle', 9)
on conflict (slug) do nothing;

-- Brands -------------------------------------------------------------------
insert into public.brands (slug, name, category_id)
select v.slug, v.name, c.id
from (values
  ('sony', 'Sony', 'electronics'),
  ('dell', 'Dell', 'laptops'),
  ('canon', 'Canon', 'cameras'),
  ('apple', 'Apple', 'wearables'),
  ('jbl', 'JBL', 'electronics'),
  ('philips', 'Philips', 'appliances'),
  ('ikea', 'IKEA', 'furniture')
) as v(slug, name, category_slug)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

-- Products -------------------------------------------------------------------
insert into public.products (brand_id, category_id, name, slug)
select b.id, b.category_id, v.name, v.slug
from (values
  ('sony', 'WF-1000XM4', 'wf-1000xm4'),
  ('dell', 'Inspiron 15 5510', 'inspiron-15-5510'),
  ('canon', 'EOS R10', 'eos-r10'),
  ('apple', 'Watch Series 7', 'watch-series-7')
) as v(brand_slug, name, slug)
join public.brands b on b.slug = v.brand_slug
on conflict (brand_id, slug) do nothing;

-- Product models ---------------------------------------------------------
insert into public.product_models (product_id, version_label)
select p.id, v.version_label
from (values
  ('wf-1000xm4', 'Standard'),
  ('inspiron-15-5510', '2021'),
  ('eos-r10', 'Standard'),
  ('watch-series-7', '41mm')
) as v(product_slug, version_label)
join public.products p on p.slug = v.product_slug
on conflict (product_id, version_label) do nothing;

-- Parts --------------------------------------------------------------------
insert into public.parts (model_id, name, slug)
select m.id, v.name, v.slug
from (values
  ('wf-1000xm4', 'Standard', 'Right Earbud', 'right-earbud'),
  ('wf-1000xm4', 'Standard', 'Left Earbud', 'left-earbud'),
  ('wf-1000xm4', 'Standard', 'Charging Case', 'charging-case'),
  ('inspiron-15-5510', '2021', '65W Charger', '65w-charger'),
  ('eos-r10', 'Standard', 'Battery (LP-E17)', 'battery-lp-e17'),
  ('watch-series-7', '41mm', 'Magnetic Charging Cable', 'magnetic-charging-cable')
) as v(product_slug, version_label, name, slug)
join public.products p on p.slug = v.product_slug
join public.product_models m on m.product_id = p.id and m.version_label = v.version_label
on conflict (model_id, slug) do nothing;
