-- More sample data (9 Oct 2026): seven more creators, a second campaign, and deals at every stage across creators,
-- including one paid late, so every screen and the Pilot tab have something real-looking to show. Upserts only.

alter table change_requests add column if not exists archived boolean default false;

create or replace function demo_seed_more() returns void language plpgsql security definer set search_path = public as $$
begin
  insert into creators as c(handle, name, whatsapp, niche, followers, followers_band, offers_per_month, top_city, top_city_share, age_band, min_fee_inr, rates,
    barter_rule, barter_floor_inr, blocked_categories, max_pay_days, paid_ads_extra, consent, verified, verified_at, verify_slot, on_time_posts, total_posts, private_token, demo, archived, created_at) values
  ('curlsbyaisha', 'Aisha Khan', '+91 98200 10001', 'Haircare', 18500, '10K to 25K', 5, 'Mumbai', 37, '18 to 24', 9000, '{"reel":9000,"story":1800}', 'value', 2000, '{}', 30, true, true, true, now() - interval '7 days', null, 4, 4, 'aisha-demo', true, false, now() - interval '8 days'),
  ('glamwithdia', 'Dia Sharma', '+91 98200 10002', 'Makeup', 27000, '25K to 50K', 6, 'Delhi', 42, '18 to 24', 14000, '{"reel":14000,"story":3000,"ugc":10000}', 'never', 0, '{"Skin lightening"}', 30, true, true, true, now() - interval '6 days', null, 7, 8, 'dia-demo', true, false, now() - interval '8 days'),
  ('runwithrohit', 'Rohit Nair', '+91 98200 10003', 'Fitness', 11200, '10K to 25K', 4, 'Bengaluru', 46, '25 to 44', 7500, '{"reel":7500,"post":3000}', 'value', 2500, '{"Alcohol","Betting"}', 45, false, true, true, now() - interval '5 days', null, 3, 3, 'rohit-demo', true, false, now() - interval '7 days'),
  ('wanderwithmeera', 'Meera Joshi', '+91 98200 10004', 'Travel', 34000, '25K to 50K', 3, 'Jaipur', 22, '25 to 44', 18000, '{"reel":18000,"post":6000}', 'value', 5000, '{}', 30, true, true, true, now() - interval '5 days', null, 5, 6, 'meera-demo', true, false, now() - interval '7 days'),
  ('saree.stories', 'Nandini Rao', '+91 98200 10005', 'Fashion', 8700, 'Under 10K', 5, 'Hyderabad', 48, '25 to 44', 6500, '{"reel":6500,"post":2500}', 'value', 2000, '{}', 30, true, true, true, now() - interval '4 days', null, 2, 2, 'nandini-demo', true, false, now() - interval '6 days'),
  ('chai.and.crumbs', 'Ishita Bose', '+91 98200 10006', 'Food', 14300, '10K to 25K', 6, 'Kolkata', 51, '25 to 44', 7000, '{"reel":7000,"story":1200}', 'value', 1500, '{"Alcohol"}', 30, true, true, true, now() - interval '4 days', null, 6, 6, 'ishita-demo', true, false, now() - interval '6 days'),
  ('derm.diaries.del', 'Simran Gill', '+91 98200 10007', 'Skincare', 5400, 'Under 10K', 5, 'Delhi', 44, '18 to 34', 5000, '{"reel":5000,"story":1000}', 'value', 1500, '{}', 30, true, true, false, null, 'Mon 12 Oct, 6 to 7 pm', 0, 0, 'simran-demo', true, false, now() - interval '20 hours')
  on conflict (handle) do update set name = excluded.name, whatsapp = excluded.whatsapp, niche = excluded.niche, followers = excluded.followers, followers_band = excluded.followers_band,
    offers_per_month = excluded.offers_per_month, top_city = excluded.top_city, top_city_share = excluded.top_city_share, age_band = excluded.age_band, min_fee_inr = excluded.min_fee_inr,
    rates = excluded.rates, barter_rule = excluded.barter_rule, barter_floor_inr = excluded.barter_floor_inr, blocked_categories = excluded.blocked_categories, max_pay_days = excluded.max_pay_days,
    paid_ads_extra = excluded.paid_ads_extra, consent = excluded.consent, verified = excluded.verified, verified_at = excluded.verified_at, verify_slot = excluded.verify_slot,
    on_time_posts = excluded.on_time_posts, total_posts = excluded.total_posts, private_token = excluded.private_token, demo = true, archived = false, created_at = excluded.created_at;

  insert into briefs as b(id, source, creator_id, brand_name, website, contact_name, contact_role, contact_channel, product, category, deliverables, deliverables_counts,
    fee_inr, is_barter, barter_value_inr, creators_wanted, usage_type, usage_days, revision_rounds, post_date, payment_days, claims, target_niche, target_city, target_age_band,
    time_to_submit_sec, brand_token, demo, archived, created_at) values
  ('b-tulsi', 'creator_link', 'riya.skinnotes', 'Tulsi & Thyme', 'tulsithyme.in', 'Megha Arora', 'Founder', 'megha@tulsithyme.in', 'Whipped shea body butter', 'Body care', '1 reel and 2 stories', '{"reel":1,"story":2}', 13000, false, 0, 1, 'organic', 0, 1, current_date + 12, 30, '', null, null, null, 230, 'tulsi-01', true, false, now() - interval '3 days'),
  ('b-kaya', 'creator_link', 'riya.skinnotes', 'Kaya Glow', 'kayaglow.in', 'Ritika Bansal', 'Marketing manager', 'ritika@kayaglow.in', 'Vitamin C face wash', 'Skincare', '1 reel', '{"reel":1}', 10000, false, 0, 1, 'organic', 0, 1, current_date + 8, 15, '', null, null, null, 175, 'kaya-01', true, false, now() - interval '4 days'),
  ('b-ritual', 'creator_link', 'riya.skinnotes', 'Ritual Roots', 'ritualroots.in', 'Arjun Malik', 'Brand lead', 'arjun@ritualroots.in', 'Hair growth serum', 'Haircare', '1 reel and 1 story', '{"reel":1,"story":1}', 7000, false, 0, 1, 'organic', 0, 1, current_date + 10, 30, '', null, null, null, 140, 'ritual-01', true, false, now() - interval '4 days'),
  ('b-honey', 'creator_link', 'riya.skinnotes', 'Honey & Hue', 'honeyandhue.in', 'Tanvi Desai', 'Founder', 'tanvi@honeyandhue.in', 'Tinted lip balm trio', 'Makeup', '1 reel', '{"reel":1}', 0, true, 2500, 1, 'organic', 0, 1, current_date + 7, 15, '', null, null, null, 110, 'honey-01', true, false, now() - interval '10 hours'),
  ('b-zest', 'campaign', null, 'Zest Active', 'zestactive.in', 'Karan Bhatia', 'Growth lead', 'karan@zestactive.in', 'Electrolyte drink mix', 'Fitness', '1 reel', '{"reel":1}', 9000, false, 0, 3, 'organic', 0, 1, current_date + 15, 30, '', 'Fitness', 'Bengaluru', '25 to 44', 290, 'zest-01', true, false, now() - interval '2 days'),
  ('b-lumiere', 'creator_link', 'glow.with.anu', 'Lumière Labs', 'lumierelabs.in', 'Pooja Shetty', 'Brand manager', 'pooja@lumierelabs.in', 'Retinol night cream', 'Skincare', '1 reel and 2 stories', '{"reel":1,"story":2}', 17000, false, 0, 1, 'organic', 0, 1, current_date - 20, 15, '', null, null, null, 260, 'lumiere-01', true, false, now() - interval '35 days'),
  ('b-proteinbay', 'creator_link', 'fitwithkabir', 'ProteinBay', 'proteinbay.in', 'Nikhil Rao', 'Head of marketing', 'nikhil@proteinbay.in', 'Whey protein isolate', 'Fitness', '1 reel', '{"reel":1}', 22000, false, 0, 1, 'organic', 0, 1, current_date - 30, 15, '', null, null, null, 200, 'proteinbay-01', true, false, now() - interval '45 days'),
  ('b-weave', 'creator_link', 'saree.stories', 'Weave & Co', 'weaveandco.in', 'Lakshmi Iyer', 'Founder', 'lakshmi@weaveandco.in', 'Handloom cotton saree', 'Fashion', '1 reel and 1 post', '{"reel":1,"post":1}', 9000, false, 0, 1, 'organic', 0, 1, current_date - 3, 30, '', null, null, null, 310, 'weave-01', true, false, now() - interval '12 days'),
  ('b-masala', 'creator_link', 'chai.and.crumbs', 'Masala Mile', 'masalamile.in', 'Debjani Sen', 'Co-founder', 'debjani@masalamile.in', 'Kadak chai masala blend', 'Food', '1 reel', '{"reel":1}', 8000, false, 0, 1, 'organic', 0, 1, current_date + 5, 15, '', null, null, null, 150, 'masala-01', true, false, now() - interval '6 days'),
  ('b-curl', 'creator_link', 'curlsbyaisha', 'CurlCraft', 'curlcraft.in', 'Neha Kapoor', 'Brand manager', 'neha@curlcraft.in', 'Curl defining cream', 'Haircare', '1 reel and 2 stories', '{"reel":1,"story":2}', 12600, false, 0, 1, 'organic', 0, 1, current_date + 6, 30, '', null, null, null, 220, 'curl-01', true, false, now() - interval '1 day')
  on conflict (id) do update set source = excluded.source, creator_id = excluded.creator_id, brand_name = excluded.brand_name, website = excluded.website, contact_name = excluded.contact_name,
    contact_role = excluded.contact_role, contact_channel = excluded.contact_channel, product = excluded.product, category = excluded.category, deliverables = excluded.deliverables,
    deliverables_counts = excluded.deliverables_counts, fee_inr = excluded.fee_inr, is_barter = excluded.is_barter, barter_value_inr = excluded.barter_value_inr,
    creators_wanted = excluded.creators_wanted, usage_type = excluded.usage_type, usage_days = excluded.usage_days, revision_rounds = excluded.revision_rounds,
    post_date = excluded.post_date, payment_days = excluded.payment_days, claims = excluded.claims, target_niche = excluded.target_niche, target_city = excluded.target_city,
    target_age_band = excluded.target_age_band, time_to_submit_sec = excluded.time_to_submit_sec, brand_token = excluded.brand_token, demo = true, archived = false, created_at = excluded.created_at;

  insert into offers as o(id, brief_id, creator_id, fit_result, match_score, status, interested, interested_at, declined_at, decline_reason, screened_at, contract_sent_at,
    creator_confirmed_at, brand_confirmed_at, locked_at, posted_at, post_link, payment_sent_at, paid_at, paid_amount_matches, terms, creator_token, brand_token, demo, archived, created_at) values
  ('o-tulsi', 'b-tulsi', 'riya.skinnotes', 'fits', null, 'creator_confirmed', true, now() - interval '2 days', null, null, null, now() - interval '20 hours', now() - interval '10 hours', null, null, null, null, null, null, null, null, 'riya-demo', 'tulsi-01', true, false, now() - interval '3 days'),
  ('o-kaya', 'b-kaya', 'riya.skinnotes', 'fits', null, 'change_requested', true, now() - interval '3 days', null, null, null, now() - interval '2 days', null, null, null, null, null, null, null, null, null, 'riya-demo', 'kaya-01', true, false, now() - interval '4 days'),
  ('o-ritual', 'b-ritual', 'riya.skinnotes', 'misses', null, 'declined', false, null, now() - interval '3 days', 'fee', null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'ritual-01', true, false, now() - interval '4 days'),
  ('o-honey', 'b-honey', 'riya.skinnotes', 'fits', null, 'new', false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'riya-demo', 'honey-01', true, false, now() - interval '10 hours'),
  ('o-zest-rohit', 'b-zest', 'runwithrohit', 'check', 95, 'locked', true, now() - interval '40 hours', null, null, null, now() - interval '30 hours', now() - interval '28 hours', now() - interval '20 hours', now() - interval '20 hours', null, null, null, null, null, null, 'rohit-demo', 'zest-01', true, false, now() - interval '44 hours'),
  ('o-zest-kabir', 'b-zest', 'fitwithkabir', 'misses', 80, 'declined', false, null, now() - interval '30 hours', 'fee', null, null, null, null, null, null, null, null, null, null, null, 'kabir-demo', 'zest-01', true, false, now() - interval '44 hours'),
  ('o-lumiere', 'b-lumiere', 'glow.with.anu', 'fits', null, 'locked', true, now() - interval '34 days', null, null, null, now() - interval '33 days', now() - interval '33 days', now() - interval '32 days', now() - interval '32 days', now() - interval '20 days', 'https://www.instagram.com/glow.with.anu/', now() - interval '7 days', now() - interval '6 days', true, null, 'anu-demo', 'lumiere-01', true, false, now() - interval '35 days'),
  ('o-proteinbay', 'b-proteinbay', 'fitwithkabir', 'fits', null, 'locked', true, now() - interval '44 days', null, null, null, now() - interval '43 days', now() - interval '43 days', now() - interval '42 days', now() - interval '42 days', now() - interval '30 days', 'https://www.instagram.com/fitwithkabir/', now() - interval '10 days', now() - interval '9 days', true, null, 'kabir-demo', 'proteinbay-01', true, false, now() - interval '45 days'),
  ('o-weave', 'b-weave', 'saree.stories', 'fits', null, 'locked', true, now() - interval '11 days', null, null, null, now() - interval '10 days', now() - interval '10 days', now() - interval '9 days', now() - interval '9 days', now() - interval '3 days', 'https://www.instagram.com/saree.stories/', null, null, null, null, 'nandini-demo', 'weave-01', true, false, now() - interval '12 days'),
  ('o-masala', 'b-masala', 'chai.and.crumbs', 'fits', null, 'locked', true, now() - interval '5 days', null, null, null, now() - interval '4 days', now() - interval '4 days', now() - interval '3 days', now() - interval '3 days', null, null, null, null, null, null, 'ishita-demo', 'masala-01', true, false, now() - interval '6 days'),
  ('o-curl', 'b-curl', 'curlsbyaisha', 'fits', null, 'contract_sent', true, now() - interval '18 hours', null, null, null, now() - interval '6 hours', null, null, null, null, null, null, null, null, null, 'aisha-demo', 'curl-01', true, false, now() - interval '1 day')
  on conflict (id) do update set brief_id = excluded.brief_id, creator_id = excluded.creator_id, fit_result = excluded.fit_result, match_score = excluded.match_score, status = excluded.status,
    interested = excluded.interested, interested_at = excluded.interested_at, declined_at = excluded.declined_at, decline_reason = excluded.decline_reason, screened_at = excluded.screened_at,
    contract_sent_at = excluded.contract_sent_at, creator_confirmed_at = excluded.creator_confirmed_at, brand_confirmed_at = excluded.brand_confirmed_at, locked_at = excluded.locked_at,
    posted_at = excluded.posted_at, post_link = excluded.post_link, payment_sent_at = excluded.payment_sent_at, paid_at = excluded.paid_at, paid_amount_matches = excluded.paid_amount_matches,
    terms = excluded.terms, creator_token = excluded.creator_token, brand_token = excluded.brand_token, demo = true, archived = false, created_at = excluded.created_at;

  insert into change_requests as r(id, offer_id, side, field, note, after_filming, archived, created_at) values
  ('c-demo-1', 'o-kaya', 'brand', 'Post date', 'Can we move the post to the 22nd? Our new stock lands a week late.', false, false, now() - interval '6 hours')
  on conflict (id) do update set offer_id = excluded.offer_id, side = excluded.side, field = excluded.field, note = excluded.note, after_filming = excluded.after_filming, archived = false, created_at = excluded.created_at;

  insert into link_sends as s(id, creator_id, brand_handle, sent_at, outcome, logged_by, offer_type, demo, archived) values
  ('s-demo-6', 'curlsbyaisha', 'curlcraft.in', now() - interval '26 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-7', 'chai.and.crumbs', 'masalamile', now() - interval '6 days 4 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-8', 'saree.stories', 'weaveandco', now() - interval '12 days 5 hours', 'filled', 'team', 'paid', true, false),
  ('s-demo-9', 'riya.skinnotes', 'honeyandhue', now() - interval '11 hours', 'filled', 'creator', 'barter', true, false),
  ('s-demo-10', 'riya.skinnotes', 'ritualroots', now() - interval '4 days 3 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-11', 'riya.skinnotes', 'tulsithyme', now() - interval '3 days 2 hours', 'filled', 'creator', 'paid', true, false),
  ('s-demo-12', 'glamwithdia', 'sugarpop.in', now() - interval '5 days', 'went_quiet', 'creator', 'barter', true, false),
  ('s-demo-13', 'runwithrohit', 'fitbar.in', now() - interval '20 hours', '', 'creator', 'unclear', true, false)
  on conflict (id) do update set creator_id = excluded.creator_id, brand_handle = excluded.brand_handle, sent_at = excluded.sent_at, outcome = excluded.outcome,
    logged_by = excluded.logged_by, offer_type = excluded.offer_type, demo = true, archived = false;
end $$;

revoke execute on function demo_seed_more() from public, anon, authenticated;

create or replace function reset_demo() returns jsonb language plpgsql security definer set search_path = public as $$
declare seed_offers text[] := array['o-dewdrop','o-leaf','o-bloomwell','o-glowfair','o-fitsip','o-petal','o-kumkum-riya','o-kumkum-meher','o-aurelia','o-mitti','o-saffron','o-neem','o-tulsi','o-kaya','o-ritual','o-honey','o-zest-rohit','o-zest-kabir','o-lumiere','o-proteinbay','o-weave','o-masala','o-curl'];
  seed_briefs text[] := array['b-dewdrop','b-leaf','b-bloomwell','b-glowfair','b-fitsip','b-petal','b-kumkum','b-aurelia','b-mitti','b-saffron','b-neem','b-tulsi','b-kaya','b-ritual','b-honey','b-zest','b-lumiere','b-proteinbay','b-weave','b-masala','b-curl'];
  seed_sends text[] := array['s-demo-1','s-demo-2','s-demo-3','s-demo-4','s-demo-5','s-demo-6','s-demo-7','s-demo-8','s-demo-9','s-demo-10','s-demo-11','s-demo-12','s-demo-13'];
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
  perform demo_seed_more();
  return jsonb_build_object('ok', true, 'reset_at', now());
end $$;

select reset_demo();
