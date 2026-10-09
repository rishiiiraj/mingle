-- Longer journeys (9 Oct 2026). Nothing is deleted: rows that should leave the app are archived.
-- After the lock the creator marks the post live with its link, the brand marks payment sent and the creator confirms
-- it arrived; creators book their verification call; brands track every creator on their brief; briefs sent to demo
-- creators stay demo; reset_demo() puts the demo data back to its starting point (upserts, and archives extra demo rows).

alter table offers add column if not exists post_link text;
alter table offers add column if not exists payment_sent_at timestamptz;
alter table offers add column if not exists archived boolean default false;
alter table briefs add column if not exists archived boolean default false;
alter table link_sends add column if not exists archived boolean default false;
alter table change_requests add column if not exists archived boolean default false;
alter table creators add column if not exists archived boolean default false;
alter table creators add column if not exists verify_slot text;

-- ---------- public and creator ----------
create or replace function public_creator(p_handle text) returns jsonb language sql stable security definer set search_path = public as
$$ select public_profile(c) from creators c where c.handle = lower(trim(both '@' from trim(coalesce(p_handle, '')))) and not coalesce(c.archived, false) $$;

create or replace function creator_me(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare c creators;
begin
  select * into c from creators where private_token = p_token and not coalesce(archived, false);
  if not found then return null; end if;
  return jsonb_build_object(
    'creators', jsonb_build_array(to_jsonb(c)),
    'offers', coalesce((select jsonb_agg(to_jsonb(o) - 'brand_token') from offers o where o.creator_id = c.handle and not coalesce(o.archived, false)), '[]'),
    'briefs', coalesce((select jsonb_agg(to_jsonb(b) - 'brand_token' - 'contact_channel') from briefs b
                        where b.id in (select brief_id from offers where creator_id = c.handle and not coalesce(archived, false))), '[]'),
    'change_requests', coalesce((select jsonb_agg(to_jsonb(r)) from change_requests r
                        where not coalesce(r.archived, false) and r.offer_id in (select id from offers where creator_id = c.handle)), '[]'),
    'link_sends', coalesce((select jsonb_agg(to_jsonb(s)) from link_sends s where s.creator_id = c.handle and not coalesce(s.archived, false)), '[]'));
end $$;

create or replace function creator_book_call(p_token text, p_slot text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if nullif(trim(coalesce(p_slot, '')), '') is null or length(p_slot) > 80 then return false; end if;
  update creators set verify_slot = trim(p_slot) where private_token = p_token and not verified;
  return found;
end $$;

-- ---------- after the lock ----------
create or replace function deal_posted(p_offer text, p_token text, p_link text default null) returns jsonb language plpgsql security definer set search_path = public as $$
declare o offers;
begin
  select * into o from offers where id = p_offer for update;
  if not found or deal_side(o, p_token) is distinct from 'creator' then raise exception 'not_allowed'; end if;
  if o.status <> 'locked' or o.posted_at is not null then return jsonb_build_object('ok', false); end if;
  update offers set posted_at = now(), post_link = nullif(left(trim(coalesce(p_link, '')), 300), '') where id = p_offer;
  return jsonb_build_object('ok', true);
end $$;

create or replace function deal_payment_sent(p_offer text, p_token text) returns jsonb language plpgsql security definer set search_path = public as $$
declare o offers;
begin
  select * into o from offers where id = p_offer for update;
  if not found or deal_side(o, p_token) is distinct from 'brand' then raise exception 'not_allowed'; end if;
  if o.status <> 'locked' or o.payment_sent_at is not null or o.paid_at is not null then return jsonb_build_object('ok', false); end if;
  update offers set payment_sent_at = now() where id = p_offer;
  return jsonb_build_object('ok', true);
end $$;

-- The creator tells us the fee has arrived.
create or replace function deal_paid(p_offer text, p_token text, p_amount_matches boolean default true) returns jsonb language plpgsql security definer set search_path = public as $$
declare o offers;
begin
  select * into o from offers where id = p_offer for update;
  if not found or deal_side(o, p_token) is distinct from 'creator' then raise exception 'not_allowed'; end if;
  if o.status <> 'locked' or o.paid_at is not null then return jsonb_build_object('ok', false); end if;
  update offers set paid_at = now(), paid_amount_matches = coalesce(p_amount_matches, true), posted_at = coalesce(posted_at, now()) where id = p_offer;
  return jsonb_build_object('ok', true);
end $$;

-- ---------- brand: every creator on the brief, so the brand can track it ----------
-- Campaign invites show the creator only once they say yes; until then the brand sees a count.
create or replace function brand_contracts(p_code text) returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not exists(select 1 from briefs where brand_token = p_code and not coalesce(archived, false)) then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true,
    'briefs', coalesce((select jsonb_agg(to_jsonb(b)) from briefs b where b.brand_token = p_code and not coalesce(b.archived, false)), '[]'),
    'offers', coalesce((select jsonb_agg(case when o.interested or o.status in ('declined', 'contract_sent', 'creator_confirmed', 'brand_confirmed', 'locked', 'change_requested') or b.source = 'creator_link'
                          then to_jsonb(o) - 'creator_token' else jsonb_build_object('id', o.id, 'brief_id', o.brief_id, 'status', o.status, 'created_at', o.created_at, 'hidden', true) end)
                        from offers o join briefs b on b.id = o.brief_id where o.brand_token = p_code and not coalesce(o.archived, false)), '[]'),
    'creators', coalesce((select jsonb_agg(public_profile(c)) from creators c
                        where c.handle in (select o.creator_id from offers o join briefs b on b.id = o.brief_id where o.brand_token = p_code and not coalesce(o.archived, false)
                          and (o.interested or o.status in ('declined', 'contract_sent', 'creator_confirmed', 'brand_confirmed', 'locked', 'change_requested') or b.source = 'creator_link'))), '[]'));
end $$;

-- Briefs sent to a demo creator are demo too, so trying Mingle never touches the pilot numbers.
create or replace function submit_brief(p jsonb, p_handle text) returns jsonb language plpgsql security definer set search_path = public as $$
declare c creators; b briefs; code text; src text := case when p_handle is null then 'campaign' else 'creator_link' end;
begin
  if jt(p, 'brand_name') is null or jt(p, 'contact_name') is null or jt(p, 'contact_channel') is null or jt(p, 'product') is null
     or jt(p, 'category') is null or jt(p, 'deliverables') is null or jt(p, 'post_date') is null or ji(p, 'payment_days') is null
     or (coalesce((p->>'is_barter')::boolean, false) and coalesce(ji(p, 'barter_value_inr'), 0) <= 0)
     or (not coalesce((p->>'is_barter')::boolean, false) and coalesce(ji(p, 'fee_inr'), 0) <= 0)
     or (src = 'campaign' and jt(p, 'target_city') is null) then
    raise exception 'missing_fields'; end if;
  if p_handle is not null then
    select * into c from creators where handle = lower(trim(both '@' from trim(p_handle))) and not coalesce(archived, false);
    if not found then raise exception 'unknown_handle'; end if;
  end if;
  code := coalesce(nullif(substr(regexp_replace(lower(jt(p, 'brand_name')), '[^a-z0-9]', '', 'g'), 1, 10), ''), 'brief') || '-' || mk_token(4);
  insert into briefs(id, source, creator_id, brand_name, website, contact_name, contact_role, contact_channel, product, category, deliverables,
    deliverables_counts, fee_inr, is_barter, barter_value_inr, creators_wanted, usage_type, usage_days, revision_rounds, post_date, payment_days, claims,
    target_niche, target_city, target_age_band, time_to_submit_sec, brand_token, demo)
  values (mk_id('b-'), src, c.handle, jt(p, 'brand_name'), jt(p, 'website'), jt(p, 'contact_name'), jt(p, 'contact_role'), jt(p, 'contact_channel'),
    jt(p, 'product'), jt(p, 'category'), jt(p, 'deliverables'), clean_counts(coalesce(p->'deliverables_counts', '{}')),
    case when coalesce((p->>'is_barter')::boolean, false) then 0 else ji(p, 'fee_inr') end, coalesce((p->>'is_barter')::boolean, false),
    case when coalesce((p->>'is_barter')::boolean, false) then ji(p, 'barter_value_inr') else 0 end,
    greatest(coalesce(ji(p, 'creators_wanted'), 1), 1), coalesce(jt(p, 'usage_type'), 'organic'),
    case when jt(p, 'usage_type') = 'paid' then coalesce(ji(p, 'usage_days'), 0) else 0 end, coalesce(ji(p, 'revision_rounds'), 0),
    (p->>'post_date')::date, ji(p, 'payment_days'), coalesce(jt(p, 'claims'), ''),
    case when src = 'campaign' then jt(p, 'target_niche') end, case when src = 'campaign' then jt(p, 'target_city') end,
    case when src = 'campaign' then jt(p, 'target_age_band') end, ji(p, 'time_to_submit_sec'), code,
    coalesce(c.demo, false) or coalesce((p->>'demo')::boolean, false))
  returning * into b;
  if c.handle is not null then
    insert into offers(id, brief_id, creator_id, fit_result, status, creator_token, brand_token, demo)
    values (mk_id('o-'), b.id, c.handle, fit_of(c, b), 'new', c.private_token, code, b.demo);
  end if;
  return jsonb_build_object('brief_id', b.id, 'code', code, 'source', src);
end $$;

-- ---------- team ----------
create or replace function team_dump(p_key text) returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  return jsonb_build_object(
    'creators', coalesce((select jsonb_agg(to_jsonb(c)) from creators c where not coalesce(c.archived, false)), '[]'),
    'briefs', coalesce((select jsonb_agg(to_jsonb(b)) from briefs b where not coalesce(b.archived, false)), '[]'),
    'offers', coalesce((select jsonb_agg(to_jsonb(o)) from offers o where not coalesce(o.archived, false)), '[]'),
    'change_requests', coalesce((select jsonb_agg(to_jsonb(r)) from change_requests r where not coalesce(r.archived, false)), '[]'),
    'link_sends', coalesce((select jsonb_agg(to_jsonb(s)) from link_sends s where not coalesce(s.archived, false)), '[]'),
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', e.id::text, 'name', e.name, 'props', e.props, 'created_at', e.created_at))
                        from (select * from events order by created_at desc limit 2000) e), '[]'));
end $$;

-- ---------- demo data: anyone can put it back to its starting point ----------
create or replace function reset_demo() returns jsonb language plpgsql security definer set search_path = public as $$
declare seed_offers text[] := array['o-dewdrop','o-leaf','o-bloomwell','o-glowfair','o-fitsip','o-petal','o-kumkum-riya','o-kumkum-meher','o-aurelia','o-mitti','o-saffron','o-neem'];
  seed_briefs text[] := array['b-dewdrop','b-leaf','b-bloomwell','b-glowfair','b-fitsip','b-petal','b-kumkum','b-aurelia','b-mitti','b-saffron','b-neem'];
  seed_sends text[] := array['s-demo-1','s-demo-2','s-demo-3','s-demo-4','s-demo-5'];
begin
  -- the first demo creator moves to a cleaner handle; the old profile is archived, not deleted
  update creators set private_token = 'retired-' || mk_token(8), archived = true, verified = false, name = 'Retired demo profile'
  where handle = 'dummy.skin.notes' and not coalesce(archived, false);

  insert into creators as c(handle, name, whatsapp, niche, followers, followers_band, offers_per_month, top_city, top_city_share, age_band, min_fee_inr, rates,
    barter_rule, barter_floor_inr, blocked_categories, max_pay_days, paid_ads_extra, consent, verified, verified_at, verify_slot, on_time_posts, total_posts, private_token, demo, archived, created_at) values
  ('riya.skinnotes', 'Riya Malhotra', '+91 98100 11234', 'Skincare', 9200, 'Under 10K', 6, 'Delhi', 31, '18 to 34', 8000, '{"reel":8000,"story":1500,"post":4000}', 'value', 2000, '{"Skin lightening","Weight loss","Crypto and trading"}', 30, true, true, true, now() - interval '9 days', null, 5, 5, 'riya-demo', true, false, now() - interval '10 days'),
  ('delhi.dewdiaries', 'Meher Kaur', '+91 98100 22345', 'Skincare', 6100, 'Under 10K', 4, 'Delhi', 35, '25 to 44', 5000, '{"reel":5000,"story":1000}', 'value', 1500, '{}', 30, true, true, true, now() - interval '8 days', null, 2, 2, 'meher-demo', true, false, now() - interval '9 days'),
  ('glow.with.anu', 'Anu Pillai', '+91 98100 33456', 'Skincare', 22000, '10K to 25K', 5, 'Mumbai', 28, '18 to 34', 12000, '{"reel":12000,"story":2500}', 'value', 3000, '{"Betting"}', 30, true, true, true, now() - interval '8 days', null, 3, 4, 'anu-demo', true, false, now() - interval '9 days'),
  ('fitwithkabir', 'Kabir Sethi', '+91 98100 44567', 'Fitness', 48000, '25K to 50K', 6, 'Delhi', 26, '18 to 34', 20000, '{"reel":20000,"story":4000}', 'never', 0, '{"Alcohol"}', 30, true, true, true, now() - interval '7 days', null, 6, 7, 'kabir-demo', true, false, now() - interval '9 days'),
  ('thrifty.mumbai', 'Zoya Merchant', '+91 98100 55678', 'Fashion', 15000, '10K to 25K', 5, 'Mumbai', 40, '18 to 24', 7000, '{"reel":7000,"post":3500}', 'value', 1500, '{}', 30, true, true, true, now() - interval '7 days', null, 4, 4, 'zoya-demo', true, false, now() - interval '9 days'),
  ('ingredient.nerd', 'Arnav Rao', '+91 98100 66789', 'Skincare', 31000, '25K to 50K', 4, 'Bengaluru', 33, '25 to 44', 15000, '{"reel":15000,"story":3000}', 'never', 0, '{"Skin lightening"}', 45, true, true, true, now() - interval '6 days', null, 8, 8, 'arnav-demo', true, false, now() - interval '9 days'),
  ('foodiefolio.del', 'Ishaan Bhalla', '+91 98100 77890', 'Food', 12000, '10K to 25K', 5, 'Delhi', 38, '25 to 44', 6000, '{"reel":6000}', 'value', 1500, '{}', 30, true, true, true, now() - interval '6 days', null, 3, 3, 'ishaan-demo', true, false, now() - interval '9 days'),
  ('minimalmuse', 'Tara Kulkarni', '+91 98100 88901', 'Skincare', 3800, 'Under 10K', 3, 'Pune', 29, '18 to 34', 4000, '{"reel":4000}', 'value', 1000, '{}', 30, true, true, true, now() - interval '5 days', null, 0, 0, 'tara-demo', true, false, now() - interval '6 days'),
  ('pune.plates', 'Neel Joshi', '+91 98100 99012', 'Food', 7400, 'Under 10K', 4, 'Pune', 44, '25 to 44', 5000, '{"reel":5000}', 'value', 1500, '{}', 30, true, true, false, null, 'Tomorrow, 6 to 7 pm', 0, 0, 'neel-demo', true, false, now() - interval '1 day')
  on conflict (handle) do update set name = excluded.name, whatsapp = excluded.whatsapp, niche = excluded.niche, followers = excluded.followers, followers_band = excluded.followers_band,
    offers_per_month = excluded.offers_per_month, top_city = excluded.top_city, top_city_share = excluded.top_city_share, age_band = excluded.age_band, min_fee_inr = excluded.min_fee_inr,
    rates = excluded.rates, barter_rule = excluded.barter_rule, barter_floor_inr = excluded.barter_floor_inr, blocked_categories = excluded.blocked_categories, max_pay_days = excluded.max_pay_days,
    paid_ads_extra = excluded.paid_ads_extra, consent = excluded.consent, verified = excluded.verified, verified_at = excluded.verified_at, verify_slot = excluded.verify_slot,
    on_time_posts = excluded.on_time_posts, total_posts = excluded.total_posts, private_token = excluded.private_token, demo = true, archived = false, created_at = excluded.created_at;

  update briefs set creator_id = 'riya.skinnotes' where creator_id = 'dummy.skin.notes';
  update offers set creator_id = 'riya.skinnotes', creator_token = 'riya-demo' where creator_id = 'dummy.skin.notes';
  update link_sends set creator_id = 'riya.skinnotes' where creator_id = 'dummy.skin.notes';

  -- extra demo rows (briefs evaluators sent, links they logged) leave the app but stay in the database
  update offers set archived = true where demo and not (id = any(seed_offers));
  update briefs set archived = true where demo and not (id = any(seed_briefs));
  update link_sends set archived = true where demo and not (id = any(seed_sends));
  update change_requests set archived = true where offer_id in (select id from offers where demo);

  insert into briefs as b(id, source, creator_id, brand_name, website, contact_name, contact_role, contact_channel, product, category, deliverables, deliverables_counts,
    fee_inr, is_barter, barter_value_inr, creators_wanted, usage_type, usage_days, revision_rounds, post_date, payment_days, claims, target_niche, target_city, target_age_band,
    time_to_submit_sec, brand_token, demo, archived, created_at) values
  ('b-dewdrop', 'creator_link', 'riya.skinnotes', 'Dewdrop Skin', 'dewdropskin.in', 'Kavya Iyer', 'Brand manager', 'kavya@dewdropskin.in', 'Niacinamide 10% serum', 'Skincare', '1 reel', '{"reel":1}', 9000, false, 0, 1, 'organic', 0, 1, current_date + 11, 15, '', null, null, null, 190, 'dewdrop-01', true, false, now() - interval '5 hours'),
  ('b-leaf', 'creator_link', 'riya.skinnotes', 'Leaf & Lather', 'leafandlather.com', 'Aditi Rao', 'Founder', '+91 99000 10101', 'Neem body soap', 'Body care', '1 reel', '{"reel":1}', 8000, false, 0, 1, 'organic', 0, 1, current_date + 16, 30, '', null, null, null, 240, 'leaf-01', true, false, now() - interval '20 hours'),
  ('b-bloomwell', 'creator_link', 'riya.skinnotes', 'Bloomwell Body', 'bloomwell.co', 'Rohan Mehta', 'Growth manager', 'rohan@bloomwell.co', 'Barrier repair lotion', 'Body care', '1 reel and 2 stories', '{"reel":1,"story":2}', 12000, false, 0, 1, 'paid', 90, 2, current_date + 14, 45, 'Say it repairs the skin barrier in 7 days', null, null, null, 300, 'bloomwell-01', true, false, now() - interval '26 hours'),
  ('b-glowfair', 'creator_link', 'riya.skinnotes', 'GlowFair', 'glowfair.in', 'Sameer Gupta', 'Marketing lead', 'sameer@glowfair.in', 'Brightening cream', 'Skin lightening', '1 reel', '{"reel":1}', 15000, false, 0, 1, 'organic', 0, 1, current_date + 9, 30, '', null, null, null, 150, 'glowfair-01', true, false, now() - interval '2 days'),
  ('b-fitsip', 'creator_link', 'riya.skinnotes', 'FitSip', 'fitsip.in', 'Varun Shah', 'Founder', '+91 99000 20202', 'Slimming green tea', 'Weight loss', '1 reel', '{"reel":1}', 6000, false, 0, 1, 'organic', 0, 1, current_date + 12, 60, '', null, null, null, 120, 'fitsip-01', true, false, now() - interval '3 days'),
  ('b-petal', 'creator_link', 'riya.skinnotes', 'Petal Mist Co', 'petalmist.co', 'Nisha Verma', 'Brand associate', 'nisha@petalmist.co', 'Rose face mist', 'Skincare', '1 reel and 3 stories', '{"reel":1,"story":3}', 0, true, 600, 1, 'organic', 0, 1, current_date + 13, 15, '', null, null, null, 90, 'petal-01', true, false, now() - interval '3 days'),
  ('b-kumkum', 'campaign', null, 'Kumkum Botanicals', 'kumkumbotanicals.in', 'Pooja Nair', 'Brand manager', 'pooja@kumkumbotanicals.in', 'Vitamin C glow serum', 'Skincare', '1 reel', '{"reel":1}', 9000, false, 0, 3, 'organic', 0, 1, current_date + 18, 30, '', 'Skincare', 'Delhi', '18 to 34', 330, 'kumkum-01', true, false, now() - interval '9 hours'),
  ('b-aurelia', 'creator_link', 'riya.skinnotes', 'Aurelia Skin', 'aureliaskin.in', 'Shreeya Kapoor', 'Head of growth', 'shreeya@aureliaskin.in', 'SPF 50 gel sunscreen', 'Skincare', '1 reel and 1 story', '{"reel":1,"story":1}', 12000, false, 0, 1, 'organic', 0, 1, current_date + 9, 15, '', null, null, null, 210, 'aurelia-01', true, false, now() - interval '2 days'),
  ('b-mitti', 'creator_link', 'riya.skinnotes', 'Mitti Naturals', 'mittinaturals.in', 'Harjinder Singh', 'Owner', '+91 99000 30303', 'Multani clay face mask', 'Skincare', '1 reel', '{"reel":1}', 9500, false, 0, 1, 'organic', 0, 1, current_date + 2, 15, '', null, null, null, 260, 'mitti-01', true, false, now() - interval '5 days'),
  ('b-saffron', 'creator_link', 'riya.skinnotes', 'Saffron & Co', 'saffronandco.in', 'Anadhika Jain', 'Co-founder', 'anadhika@saffronandco.in', 'Kumkumadi face oil', 'Skincare', '1 reel and 2 stories', '{"reel":1,"story":2}', 11500, false, 0, 1, 'organic', 0, 1, current_date - 6, 15, '', null, null, null, 280, 'saffron-01', true, false, now() - interval '14 days'),
  ('b-neem', 'creator_link', 'riya.skinnotes', 'Neem Tree Organics', 'neemtree.in', 'Vidhi Rohatgi', 'Ecommerce lead', 'vidhi@neemtree.in', 'Neem face wash', 'Skincare', '1 reel', '{"reel":1}', 8500, false, 0, 1, 'organic', 0, 1, current_date - 22, 15, '', null, null, null, 200, 'neem-01', true, false, now() - interval '30 days')
  on conflict (id) do update set source = excluded.source, creator_id = excluded.creator_id, brand_name = excluded.brand_name, website = excluded.website, contact_name = excluded.contact_name,
    contact_role = excluded.contact_role, contact_channel = excluded.contact_channel, product = excluded.product, category = excluded.category, deliverables = excluded.deliverables,
    deliverables_counts = excluded.deliverables_counts, fee_inr = excluded.fee_inr, is_barter = excluded.is_barter, barter_value_inr = excluded.barter_value_inr,
    creators_wanted = excluded.creators_wanted, usage_type = excluded.usage_type, usage_days = excluded.usage_days, revision_rounds = excluded.revision_rounds,
    post_date = excluded.post_date, payment_days = excluded.payment_days, claims = excluded.claims, target_niche = excluded.target_niche, target_city = excluded.target_city,
    target_age_band = excluded.target_age_band, time_to_submit_sec = excluded.time_to_submit_sec, brand_token = excluded.brand_token, demo = true, archived = false, created_at = excluded.created_at;

  insert into offers as o(id, brief_id, creator_id, fit_result, match_score, status, interested, interested_at, declined_at, decline_reason, screened_at, contract_sent_at,
    creator_confirmed_at, brand_confirmed_at, locked_at, posted_at, post_link, payment_sent_at, paid_at, paid_amount_matches, terms, creator_token, brand_token, demo, archived, created_at) values
  ('o-dewdrop', 'b-dewdrop', 'riya.skinnotes', 'fits', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'dewdrop-01', true, false, now() - interval '5 hours'),
  ('o-leaf', 'b-leaf', 'riya.skinnotes', 'fits', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'leaf-01', true, false, now() - interval '20 hours'),
  ('o-bloomwell', 'b-bloomwell', 'riya.skinnotes', 'check', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'bloomwell-01', true, false, now() - interval '26 hours'),
  ('o-glowfair', 'b-glowfair', 'riya.skinnotes', 'misses', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'glowfair-01', true, false, now() - interval '2 days'),
  ('o-fitsip', 'b-fitsip', 'riya.skinnotes', 'misses', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'fitsip-01', true, false, now() - interval '3 days'),
  ('o-petal', 'b-petal', 'riya.skinnotes', 'misses', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'petal-01', true, false, now() - interval '3 days'),
  ('o-kumkum-riya', 'b-kumkum', 'riya.skinnotes', 'fits', 100, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'kumkum-01', true, false, now() - interval '3 hours'),
  ('o-kumkum-meher', 'b-kumkum', 'delhi.dewdiaries', 'fits', 85, 'new', true, now() - interval '1 hour', null, null, null, null, null, null, null, null, null, null, null, null, null, 'meher-demo', 'kumkum-01', true, false, now() - interval '3 hours'),
  ('o-aurelia', 'b-aurelia', 'riya.skinnotes', 'fits', null, 'contract_sent', true, now() - interval '30 hours', null, null, null, now() - interval '3 hours', null, null, null, null, null, null, null, null, null, 'riya-demo', 'aurelia-01', true, false, now() - interval '2 days'),
  ('o-mitti', 'b-mitti', 'riya.skinnotes', 'fits', null, 'locked', true, now() - interval '4 days', null, null, null, now() - interval '4 days', now() - interval '4 days', now() - interval '3 days', now() - interval '3 days', null, null, null, null, null, null, 'riya-demo', 'mitti-01', true, false, now() - interval '5 days'),
  ('o-saffron', 'b-saffron', 'riya.skinnotes', 'fits', null, 'locked', true, now() - interval '13 days', null, null, null, now() - interval '13 days', now() - interval '12 days', now() - interval '12 days', now() - interval '12 days', now() - interval '6 days', 'https://www.instagram.com/riya.skinnotes/', null, null, null, null, 'riya-demo', 'saffron-01', true, false, now() - interval '14 days'),
  ('o-neem', 'b-neem', 'riya.skinnotes', 'fits', null, 'locked', true, now() - interval '29 days', null, null, null, now() - interval '29 days', now() - interval '28 days', now() - interval '28 days', now() - interval '28 days', now() - interval '22 days', 'https://www.instagram.com/riya.skinnotes/', now() - interval '9 days', now() - interval '8 days', true, null, 'riya-demo', 'neem-01', true, false, now() - interval '30 days')
  on conflict (id) do update set brief_id = excluded.brief_id, creator_id = excluded.creator_id, fit_result = excluded.fit_result, match_score = excluded.match_score, status = excluded.status,
    interested = excluded.interested, interested_at = excluded.interested_at, declined_at = excluded.declined_at, decline_reason = excluded.decline_reason, screened_at = excluded.screened_at,
    contract_sent_at = excluded.contract_sent_at, creator_confirmed_at = excluded.creator_confirmed_at, brand_confirmed_at = excluded.brand_confirmed_at, locked_at = excluded.locked_at,
    posted_at = excluded.posted_at, post_link = excluded.post_link, payment_sent_at = excluded.payment_sent_at, paid_at = excluded.paid_at, paid_amount_matches = excluded.paid_amount_matches,
    terms = excluded.terms, creator_token = excluded.creator_token, brand_token = excluded.brand_token, demo = true, archived = false, created_at = excluded.created_at;

  insert into link_sends as s(id, creator_id, brand_handle, sent_at, outcome, logged_by, offer_type, demo, archived) values
  ('s-demo-1', 'riya.skinnotes', 'dewdropskin', now() - interval '7 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-2', 'riya.skinnotes', 'leafandlather', now() - interval '22 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-3', 'riya.skinnotes', 'aura.essentials', now() - interval '4 days', 'went_quiet', 'creator', 'barter', true, false),
  ('s-demo-4', 'riya.skinnotes', 'aurelia.skin', now() - interval '2 days 3 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-5', 'delhi.dewdiaries', 'nykaa.glow', now() - interval '2 days', 'replied_in_dm', 'team', 'unclear', true, false)
  on conflict (id) do update set creator_id = excluded.creator_id, brand_handle = excluded.brand_handle, sent_at = excluded.sent_at, outcome = excluded.outcome,
    logged_by = excluded.logged_by, offer_type = excluded.offer_type, demo = true, archived = false;
  return jsonb_build_object('ok', true, 'reset_at', now());
end $$;

revoke execute on function creator_book_call(text, text), deal_posted(text, text, text), deal_payment_sent(text, text), deal_paid(text, text, boolean), reset_demo() from public;
grant execute on function creator_book_call(text, text), deal_posted(text, text, text), deal_payment_sent(text, text), deal_paid(text, text, boolean), reset_demo() to anon, authenticated;

select reset_demo();
