-- Pilot alignment (9 Oct 2026): rates by format (N4), structured deliverables, decline reasons,
-- offer type on link sends, change requests after filming, posted and paid stages.
-- Additive only: new columns default to empty, and every function keeps accepting its old arguments
-- (new arguments have defaults), so the live app keeps working before and after this runs.
-- Backup taken first in schema backup_20261009.

alter table creators add column if not exists rates jsonb default '{}';
alter table briefs add column if not exists deliverables_counts jsonb default '{}';
alter table offers add column if not exists decline_reason text;
alter table offers add column if not exists posted_at timestamptz;
alter table offers add column if not exists paid_at timestamptz;
alter table offers add column if not exists paid_amount_matches boolean;
alter table change_requests add column if not exists after_filming boolean default false;
alter table link_sends add column if not exists offer_type text default 'unclear';

-- ---------- helpers (not callable from the browser) ----------
create or replace function clean_rates(p jsonb) returns jsonb language sql immutable set search_path = public as
$$ select coalesce(jsonb_object_agg(k, ji(p, k)) filter (where ji(p, k) > 0), '{}'::jsonb)
   from unnest(array['reel', 'story', 'post', 'ugc']) k $$;

create or replace function clean_counts(p jsonb) returns jsonb language sql immutable set search_path = public as
$$ select coalesce(jsonb_object_agg(k, least(ji(p, k), 20)) filter (where ji(p, k) > 0), '{}'::jsonb)
   from unnest(array['reel', 'story', 'post', 'ugc']) k $$;

-- The fee a creator asks for a brief: each format's rate times how many the brand wants.
-- A reel or UGC video without its own rate uses the minimum fee; stories and posts without a rate add nothing.
-- Briefs without a format breakdown fall back to the minimum fee, as before.
create or replace function fee_floor(c creators, b briefs) returns int language plpgsql stable set search_path = public as $$
declare cnt jsonb := coalesce(b.deliverables_counts, '{}'); total int := 0; k text;
begin
  if cnt = '{}'::jsonb then return coalesce(c.min_fee_inr, 0); end if;
  foreach k in array array['reel', 'story', 'post', 'ugc'] loop
    total := total + coalesce(ji(cnt, k), 0) * coalesce(ji(c.rates, k), case when k in ('reel', 'ugc') then c.min_fee_inr end, 0);
  end loop;
  return total;
end $$;

create or replace function fit_of(c creators, b briefs) returns text language plpgsql stable set search_path = public as $$
declare miss boolean := false; chk boolean := false;
begin
  if exists(select 1 from unnest(coalesce(c.blocked_categories, '{}')) x where lower(x) = lower(coalesce(b.category, ''))) then miss := true; end if;
  if not b.is_barter and coalesce(b.fee_inr, 0) < fee_floor(c, b) then miss := true; end if;
  if b.is_barter and c.barter_rule = 'never' then miss := true; end if;
  if b.is_barter and coalesce(c.barter_rule, 'value') <> 'never' and coalesce(b.barter_value_inr, 0) < coalesce(c.barter_floor_inr, 0) then miss := true; end if;
  if miss then return 'misses'; end if;
  if b.usage_type = 'paid' and c.paid_ads_extra then chk := true; end if;
  if not b.is_barter and coalesce(b.payment_days, 0) > coalesce(c.max_pay_days, 9999) then chk := true; end if;
  if length(trim(coalesce(b.claims, ''))) > 0 then chk := true; end if;
  return case when chk then 'check' else 'fits' end;
end $$;

-- ---------- creator ----------
create or replace function create_creator(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare h text := lower(regexp_replace(coalesce(p->>'handle', ''), '[^a-zA-Z0-9._]', '', 'g')); t text; fl int := coalesce(ji(p, 'followers'), 0);
  r jsonb := clean_rates(coalesce(p->'rates', '{}')); mf int := coalesce(ji(clean_rates(coalesce(p->'rates', '{}')), 'reel'), ji(p, 'min_fee_inr'));
begin
  if h = '' or jt(p, 'whatsapp') is null or coalesce(mf, 0) <= 0 or coalesce((p->>'consent')::boolean, false) is not true then
    raise exception 'missing_fields'; end if;
  if exists(select 1 from creators where handle = h) then raise exception 'handle_taken'; end if;
  t := mk_token(8);
  insert into creators(handle, name, whatsapp, niche, followers, followers_band, offers_per_month, top_city, top_city_share, age_band,
    min_fee_inr, rates, barter_rule, barter_floor_inr, blocked_categories, max_pay_days, paid_ads_extra, consent, private_token)
  values (h, jt(p, 'name'), jt(p, 'whatsapp'), jt(p, 'niche'), fl,
    case when fl < 10000 then 'Under 10K' when fl < 25000 then '10K to 25K' when fl < 50000 then '25K to 50K' else '50K plus' end,
    ji(p, 'offers_per_month'), jt(p, 'top_city'), ji(p, 'top_city_share'), jt(p, 'age_band'),
    mf, r || jsonb_build_object('reel', mf), coalesce(jt(p, 'barter_rule'), 'value'), coalesce(ji(p, 'barter_floor_inr'), 0),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'blocked_categories', '[]')) x), '{}'),
    coalesce(ji(p, 'max_pay_days'), 30), coalesce((p->>'paid_ads_extra')::boolean, false), true, t);
  return jsonb_build_object('handle', h, 'private_token', t);
end $$;

create or replace function update_rules(p_token text, p jsonb) returns boolean language plpgsql security definer set search_path = public as $$
declare fl int := coalesce(ji(p, 'followers'), 0); r jsonb := clean_rates(coalesce(p->'rates', '{}'));
  mf int := coalesce(ji(clean_rates(coalesce(p->'rates', '{}')), 'reel'), ji(p, 'min_fee_inr'));
begin
  if jt(p, 'whatsapp') is null or coalesce(mf, 0) <= 0 then raise exception 'missing_fields'; end if;
  update creators set name = jt(p, 'name'), whatsapp = jt(p, 'whatsapp'), niche = jt(p, 'niche'), followers = fl,
    followers_band = case when fl < 10000 then 'Under 10K' when fl < 25000 then '10K to 25K' when fl < 50000 then '25K to 50K' else '50K plus' end,
    offers_per_month = ji(p, 'offers_per_month'), top_city = jt(p, 'top_city'), top_city_share = ji(p, 'top_city_share'), age_band = jt(p, 'age_band'),
    min_fee_inr = mf, rates = r || jsonb_build_object('reel', mf),
    barter_rule = coalesce(jt(p, 'barter_rule'), 'value'), barter_floor_inr = coalesce(ji(p, 'barter_floor_inr'), 0),
    blocked_categories = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'blocked_categories', '[]')) x), '{}'),
    max_pay_days = coalesce(ji(p, 'max_pay_days'), 30), paid_ads_extra = coalesce((p->>'paid_ads_extra')::boolean, false)
  where private_token = p_token;
  return found;
end $$;

drop function if exists offer_decline(text, text);
create or replace function offer_decline(p_token text, p_offer text, p_reason text default null) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update offers set status = 'declined', declined_at = now(),
    decline_reason = case when p_reason in ('fee', 'category', 'barter', 'timing', 'brand', 'other') then p_reason end
  where id = p_offer and creator_token = p_token and status in ('new', 'screened');
  return found;
end $$;

drop function if exists log_send_creator(text, text);
create or replace function log_send_creator(p_token text, p_brand text, p_offer_type text default 'unclear') returns boolean language plpgsql security definer set search_path = public as $$
declare h text;
begin
  select handle into h from creators where private_token = p_token;
  if h is null or nullif(trim(coalesce(p_brand, '')), '') is null then return false; end if;
  insert into link_sends(id, creator_id, brand_handle, logged_by, offer_type)
  values (mk_id('s-'), h, trim(both '@' from trim(p_brand)), 'creator', case when p_offer_type in ('paid', 'barter') then p_offer_type else 'unclear' end);
  return true;
end $$;

-- ---------- brand ----------
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
    select * into c from creators where handle = lower(trim(both '@' from trim(p_handle)));
    if not found then raise exception 'unknown_handle'; end if;
  end if;
  code := coalesce(nullif(substr(regexp_replace(lower(jt(p, 'brand_name')), '[^a-z0-9]', '', 'g'), 1, 10), ''), 'brief') || '-' || mk_token(4);
  insert into briefs(id, source, creator_id, brand_name, website, contact_name, contact_role, contact_channel, product, category, deliverables,
    deliverables_counts, fee_inr, is_barter, barter_value_inr, creators_wanted, usage_type, usage_days, revision_rounds, post_date, payment_days, claims,
    target_niche, target_city, target_age_band, time_to_submit_sec, brand_token)
  values (mk_id('b-'), src, c.handle, jt(p, 'brand_name'), jt(p, 'website'), jt(p, 'contact_name'), jt(p, 'contact_role'), jt(p, 'contact_channel'),
    jt(p, 'product'), jt(p, 'category'), jt(p, 'deliverables'), clean_counts(coalesce(p->'deliverables_counts', '{}')),
    case when coalesce((p->>'is_barter')::boolean, false) then 0 else ji(p, 'fee_inr') end, coalesce((p->>'is_barter')::boolean, false),
    case when coalesce((p->>'is_barter')::boolean, false) then ji(p, 'barter_value_inr') else 0 end,
    greatest(coalesce(ji(p, 'creators_wanted'), 1), 1), coalesce(jt(p, 'usage_type'), 'organic'),
    case when jt(p, 'usage_type') = 'paid' then coalesce(ji(p, 'usage_days'), 0) else 0 end, coalesce(ji(p, 'revision_rounds'), 0),
    (p->>'post_date')::date, ji(p, 'payment_days'), coalesce(jt(p, 'claims'), ''),
    case when src = 'campaign' then jt(p, 'target_niche') end, case when src = 'campaign' then jt(p, 'target_city') end,
    case when src = 'campaign' then jt(p, 'target_age_band') end, ji(p, 'time_to_submit_sec'), code)
  returning * into b;
  if c.handle is not null then
    insert into offers(id, brief_id, creator_id, fit_result, status, creator_token, brand_token)
    values (mk_id('o-'), b.id, c.handle, fit_of(c, b), 'new', c.private_token, code);
  end if;
  return jsonb_build_object('brief_id', b.id, 'code', code, 'source', src);
end $$;

-- ---------- agreed terms: either side's code ----------
drop function if exists deal_change(text, text, text, text);
create or replace function deal_change(p_offer text, p_token text, p_field text, p_note text, p_after_filming boolean default false) returns jsonb language plpgsql security definer set search_path = public as $$
declare o offers; s text;
begin
  select * into o from offers where id = p_offer for update;
  if not found then raise exception 'not_allowed'; end if;
  s := deal_side(o, p_token);
  if s is null then raise exception 'not_allowed'; end if;
  if nullif(trim(coalesce(p_note, '')), '') is null then raise exception 'missing_fields'; end if;
  if o.status not in ('contract_sent', 'creator_confirmed', 'brand_confirmed', 'locked') or o.paid_at is not null then return jsonb_build_object('ok', false); end if;
  insert into change_requests(id, offer_id, side, field, note, after_filming)
  values (mk_id('c-'), p_offer, s, coalesce(p_field, 'Other'), trim(p_note), coalesce(p_after_filming, false));
  update offers set status = 'change_requested', creator_confirmed_at = null, brand_confirmed_at = null, locked_at = null where id = p_offer;
  return jsonb_build_object('ok', true, 'side', s);
end $$;

-- ---------- team ----------
create or replace function team_offer(p_key text, p_offer text, p_action text, p_terms jsonb) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  if p_action = 'screen' then
    update offers set status = 'screened', screened_at = now() where id = p_offer and status = 'new';
  elsif p_action = 'contract' then
    update offers set status = 'contract_sent', contract_sent_at = now(), creator_confirmed_at = null, brand_confirmed_at = null, locked_at = null
    where id = p_offer and status in ('new', 'screened');
  elsif p_action = 'resend' then
    update offers set status = 'contract_sent', contract_sent_at = now(), terms = p_terms, creator_confirmed_at = null, brand_confirmed_at = null, locked_at = null
    where id = p_offer and status = 'change_requested';
  elsif p_action = 'posted' then
    update offers set posted_at = coalesce((nullif(p_terms->>'posted_date', ''))::date::timestamptz, now())
    where id = p_offer and status = 'locked' and posted_at is null;
  elsif p_action = 'paid' then
    update offers set paid_at = coalesce((nullif(p_terms->>'paid_date', ''))::date::timestamptz, now()),
      paid_amount_matches = coalesce((p_terms->>'amount_matches')::boolean, true)
    where id = p_offer and status = 'locked' and paid_at is null;
  else raise exception 'bad_action'; end if;
  return found;
end $$;

drop function if exists team_log_send(text, text, text);
create or replace function team_log_send(p_key text, p_creator text, p_brand text, p_offer_type text default 'unclear') returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  if not exists(select 1 from creators where handle = p_creator) or nullif(trim(coalesce(p_brand, '')), '') is null then return false; end if;
  insert into link_sends(id, creator_id, brand_handle, logged_by, offer_type)
  values (mk_id('s-'), p_creator, trim(both '@' from trim(p_brand)), 'team', case when p_offer_type in ('paid', 'barter') then p_offer_type else 'unclear' end);
  return true;
end $$;

-- Helpers stay private; Supabase grants new functions to the browser roles by default.
revoke execute on function clean_rates(jsonb), clean_counts(jsonb), fee_floor(creators, briefs) from public, anon, authenticated;
revoke execute on function offer_decline(text, text, text), log_send_creator(text, text, text), deal_change(text, text, text, text, boolean),
  team_log_send(text, text, text, text) from public;
grant execute on function offer_decline(text, text, text), log_send_creator(text, text, text), deal_change(text, text, text, text, boolean),
  team_log_send(text, text, text, text) to anon, authenticated;

-- Existing rows: each creator's reel rate is their current minimum fee; existing briefs get a format breakdown from their text.
update creators set rates = jsonb_build_object('reel', min_fee_inr) where coalesce(rates, '{}') = '{}'::jsonb and min_fee_inr > 0;
update briefs set deliverables_counts = clean_counts(jsonb_build_object(
    'reel', coalesce((regexp_match(lower(deliverables), '(\d+)\s*reel'))[1], '0'),
    'story', coalesce((regexp_match(lower(deliverables), '(\d+)\s*stor'))[1], '0'),
    'post', coalesce((regexp_match(lower(deliverables), '(\d+)\s*(post|carousel)'))[1], '0'),
    'ugc', coalesce((regexp_match(lower(deliverables), '(\d+)\s*ugc'))[1], '0')))
where coalesce(deliverables_counts, '{}') = '{}'::jsonb;
