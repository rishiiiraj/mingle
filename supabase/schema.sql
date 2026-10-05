-- Mingle MVP1 schema. The browser never reads tables directly: row level security is on with no policies,
-- and every read or write goes through a function below that checks the right code first.

create table if not exists creators (
  handle text primary key,
  name text, whatsapp text, niche text, followers int, followers_band text, offers_per_month int,
  top_city text, top_city_share int, age_band text,
  min_fee_inr int, barter_rule text default 'value', barter_floor_inr int default 0,
  blocked_categories text[] default '{}', max_pay_days int default 30, paid_ads_extra boolean default false, consent boolean default false,
  verified boolean default false, verified_at timestamptz, on_time_posts int default 0, total_posts int default 0,
  private_token text unique not null, demo boolean default false, created_at timestamptz default now()
);
create table if not exists briefs (
  id text primary key, source text not null, creator_id text references creators(handle),
  brand_name text, website text, contact_name text, contact_role text, contact_channel text,
  product text, category text, deliverables text, fee_inr int default 0, is_barter boolean default false, barter_value_inr int default 0,
  creators_wanted int default 1, usage_type text default 'organic', usage_days int default 0, revision_rounds int default 0,
  post_date date, payment_days int, claims text default '',
  target_niche text, target_city text, target_age_band text, time_to_submit_sec int,
  brand_token text not null, demo boolean default false, created_at timestamptz default now()
);
create table if not exists offers (
  id text primary key, brief_id text references briefs(id), creator_id text references creators(handle),
  fit_result text, match_score int, status text default 'new', interested boolean default false,
  interested_at timestamptz, declined_at timestamptz, screened_at timestamptz, contract_sent_at timestamptz,
  creator_token text, brand_token text, creator_confirmed_at timestamptz, brand_confirmed_at timestamptz, locked_at timestamptz,
  terms jsonb, demo boolean default false, created_at timestamptz default now()
);
create table if not exists change_requests (
  id text primary key, offer_id text references offers(id), side text, field text, note text, created_at timestamptz default now()
);
create table if not exists link_sends (
  id text primary key, creator_id text references creators(handle), brand_handle text, sent_at timestamptz default now(),
  outcome text default '', logged_by text, demo boolean default false
);
create table if not exists events (
  id bigserial primary key, name text not null, props jsonb default '{}', created_at timestamptz default now()
);
create table if not exists settings (key text primary key, value text);

alter table creators enable row level security;
alter table briefs enable row level security;
alter table offers enable row level security;
alter table change_requests enable row level security;
alter table link_sends enable row level security;
alter table events enable row level security;
alter table settings enable row level security;
revoke all on creators, briefs, offers, change_requests, link_sends, events, settings from anon, authenticated;
create index if not exists offers_creator on offers(creator_id);
create index if not exists offers_brand on offers(brand_token);
create index if not exists events_time on events(created_at desc);

-- ---------- helpers (not callable from the browser) ----------
create or replace function mk_id(p text) returns text language sql volatile set search_path = public as
$$ select p || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12) $$;
create or replace function mk_token(n int) returns text language sql volatile set search_path = public as
$$ select substr(translate(replace(gen_random_uuid()::text, '-', ''), '01', 'xy'), 1, n) $$;
create or replace function ji(p jsonb, k text) returns int language sql immutable set search_path = public as
$$ select case when coalesce(p->>k, '') ~ '^-?[0-9]+(\.[0-9]+)?$' then round((p->>k)::numeric)::int else null end $$;
create or replace function jt(p jsonb, k text) returns text language sql immutable set search_path = public as
$$ select nullif(trim(coalesce(p->>k, '')), '') $$;
create or replace function team_ok(p_key text) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from settings where key = 'team_key' and value = p_key) $$;
create or replace function fit_of(c creators, b briefs) returns text language plpgsql stable set search_path = public as $$
declare miss boolean := false; chk boolean := false;
begin
  if exists(select 1 from unnest(coalesce(c.blocked_categories, '{}')) x where lower(x) = lower(coalesce(b.category, ''))) then miss := true; end if;
  if not b.is_barter and coalesce(b.fee_inr, 0) < coalesce(c.min_fee_inr, 0) then miss := true; end if;
  if b.is_barter and c.barter_rule = 'never' then miss := true; end if;
  if b.is_barter and coalesce(c.barter_rule, 'value') <> 'never' and coalesce(b.barter_value_inr, 0) < coalesce(c.barter_floor_inr, 0) then miss := true; end if;
  if miss then return 'misses'; end if;
  if b.usage_type = 'paid' and c.paid_ads_extra then chk := true; end if;
  if not b.is_barter and coalesce(b.payment_days, 0) > coalesce(c.max_pay_days, 9999) then chk := true; end if;
  if length(trim(coalesce(b.claims, ''))) > 0 then chk := true; end if;
  return case when chk then 'check' else 'fits' end;
end $$;
create or replace function public_profile(c creators) returns jsonb language sql stable set search_path = public as
$$ select jsonb_build_object('handle', c.handle, 'niche', c.niche, 'followers_band', c.followers_band, 'verified', c.verified,
   'top_city', c.top_city, 'top_city_share', c.top_city_share, 'age_band', c.age_band,
   'on_time_posts', c.on_time_posts, 'total_posts', c.total_posts) $$;

-- ---------- public: anyone ----------
create or replace function public_creator(p_handle text) returns jsonb language sql stable security definer set search_path = public as
$$ select public_profile(c) from creators c where c.handle = lower(trim(both '@' from trim(coalesce(p_handle, '')))) $$;

create or replace function create_creator(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare h text := lower(regexp_replace(coalesce(p->>'handle', ''), '[^a-zA-Z0-9._]', '', 'g')); t text; fl int := coalesce(ji(p, 'followers'), 0);
begin
  if h = '' or jt(p, 'whatsapp') is null or coalesce(ji(p, 'min_fee_inr'), 0) <= 0 or coalesce((p->>'consent')::boolean, false) is not true then
    raise exception 'missing_fields'; end if;
  if exists(select 1 from creators where handle = h) then raise exception 'handle_taken'; end if;
  t := mk_token(8);
  insert into creators(handle, name, whatsapp, niche, followers, followers_band, offers_per_month, top_city, top_city_share, age_band,
    min_fee_inr, barter_rule, barter_floor_inr, blocked_categories, max_pay_days, paid_ads_extra, consent, private_token)
  values (h, jt(p, 'name'), jt(p, 'whatsapp'), jt(p, 'niche'), fl,
    case when fl < 10000 then 'Under 10K' when fl < 25000 then '10K to 25K' when fl < 50000 then '25K to 50K' else '50K plus' end,
    ji(p, 'offers_per_month'), jt(p, 'top_city'), ji(p, 'top_city_share'), jt(p, 'age_band'),
    ji(p, 'min_fee_inr'), coalesce(jt(p, 'barter_rule'), 'value'), coalesce(ji(p, 'barter_floor_inr'), 0),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'blocked_categories', '[]')) x), '{}'),
    coalesce(ji(p, 'max_pay_days'), 30), coalesce((p->>'paid_ads_extra')::boolean, false), true, t);
  return jsonb_build_object('handle', h, 'private_token', t);
end $$;

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
    fee_inr, is_barter, barter_value_inr, creators_wanted, usage_type, usage_days, revision_rounds, post_date, payment_days, claims,
    target_niche, target_city, target_age_band, time_to_submit_sec, brand_token)
  values (mk_id('b-'), src, c.handle, jt(p, 'brand_name'), jt(p, 'website'), jt(p, 'contact_name'), jt(p, 'contact_role'), jt(p, 'contact_channel'),
    jt(p, 'product'), jt(p, 'category'), jt(p, 'deliverables'),
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

create or replace function log_event(p_name text, p_props jsonb) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_name !~ '^[a-z_]{3,40}$' or length(coalesce(p_props, '{}')::text) > 2000 then return; end if;
  insert into events(name, props) values (p_name, coalesce(p_props, '{}'));
end $$;

-- ---------- creator: private code ----------
create or replace function creator_me(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare c creators;
begin
  select * into c from creators where private_token = p_token;
  if not found then return null; end if;
  return jsonb_build_object(
    'creators', jsonb_build_array(to_jsonb(c)),
    'offers', coalesce((select jsonb_agg(to_jsonb(o) - 'brand_token') from offers o where o.creator_id = c.handle), '[]'),
    'briefs', coalesce((select jsonb_agg(to_jsonb(b) - 'brand_token' - 'contact_channel') from briefs b
                        where b.id in (select brief_id from offers where creator_id = c.handle)), '[]'),
    'change_requests', coalesce((select jsonb_agg(to_jsonb(r)) from change_requests r
                        where r.offer_id in (select id from offers where creator_id = c.handle)), '[]'),
    'link_sends', coalesce((select jsonb_agg(to_jsonb(s)) from link_sends s where s.creator_id = c.handle), '[]'));
end $$;

create or replace function update_rules(p_token text, p jsonb) returns boolean language plpgsql security definer set search_path = public as $$
declare fl int := coalesce(ji(p, 'followers'), 0);
begin
  if jt(p, 'whatsapp') is null or coalesce(ji(p, 'min_fee_inr'), 0) <= 0 then raise exception 'missing_fields'; end if;
  update creators set name = jt(p, 'name'), whatsapp = jt(p, 'whatsapp'), niche = jt(p, 'niche'), followers = fl,
    followers_band = case when fl < 10000 then 'Under 10K' when fl < 25000 then '10K to 25K' when fl < 50000 then '25K to 50K' else '50K plus' end,
    offers_per_month = ji(p, 'offers_per_month'), top_city = jt(p, 'top_city'), top_city_share = ji(p, 'top_city_share'), age_band = jt(p, 'age_band'),
    min_fee_inr = ji(p, 'min_fee_inr'), barter_rule = coalesce(jt(p, 'barter_rule'), 'value'), barter_floor_inr = coalesce(ji(p, 'barter_floor_inr'), 0),
    blocked_categories = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'blocked_categories', '[]')) x), '{}'),
    max_pay_days = coalesce(ji(p, 'max_pay_days'), 30), paid_ads_extra = coalesce((p->>'paid_ads_extra')::boolean, false)
  where private_token = p_token;
  return found;
end $$;

create or replace function offer_interested(p_token text, p_offer text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update offers set interested = true, interested_at = now()
  where id = p_offer and creator_token = p_token and status in ('new', 'screened') and not interested;
  return found;
end $$;

create or replace function offer_decline(p_token text, p_offer text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update offers set status = 'declined', declined_at = now()
  where id = p_offer and creator_token = p_token and status in ('new', 'screened');
  return found;
end $$;

create or replace function log_send_creator(p_token text, p_brand text) returns boolean language plpgsql security definer set search_path = public as $$
declare h text;
begin
  select handle into h from creators where private_token = p_token;
  if h is null or nullif(trim(coalesce(p_brand, '')), '') is null then return false; end if;
  insert into link_sends(id, creator_id, brand_handle, logged_by) values (mk_id('s-'), h, trim(both '@' from trim(p_brand)), 'creator');
  return true;
end $$;

-- ---------- brand: brief code ----------
create or replace function brand_contracts(p_code text) returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not exists(select 1 from briefs where brand_token = p_code) then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true,
    'briefs', coalesce((select jsonb_agg(to_jsonb(b)) from briefs b where b.brand_token = p_code), '[]'),
    'offers', coalesce((select jsonb_agg(to_jsonb(o) - 'creator_token') from offers o
                        where o.brand_token = p_code and o.status in ('contract_sent', 'creator_confirmed', 'brand_confirmed', 'locked', 'change_requested')), '[]'),
    'creators', coalesce((select jsonb_agg(public_profile(c)) from creators c
                        where c.handle in (select creator_id from offers where brand_token = p_code)), '[]'));
end $$;

-- ---------- contract: either side's code ----------
create or replace function deal_side(o offers, p_token text) returns text language sql immutable set search_path = public as
$$ select case when p_token is null then null when p_token = o.creator_token then 'creator' when p_token = o.brand_token then 'brand' end $$;

create or replace function deal_get(p_offer text, p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o offers; s text;
begin
  select * into o from offers where id = p_offer;
  if not found then return null; end if;
  s := deal_side(o, p_token);
  if s is null then return null; end if;
  return jsonb_build_object('side', s,
    'offers', jsonb_build_array(to_jsonb(o) - 'creator_token' - 'brand_token'),
    'briefs', coalesce((select jsonb_agg(to_jsonb(b) - 'brand_token' - 'contact_channel') from briefs b where b.id = o.brief_id), '[]'),
    'creators', coalesce((select jsonb_agg(public_profile(c)) from creators c where c.handle = o.creator_id), '[]'),
    'change_requests', coalesce((select jsonb_agg(to_jsonb(r)) from change_requests r where r.offer_id = o.id), '[]'));
end $$;

create or replace function deal_confirm(p_offer text, p_token text) returns jsonb language plpgsql security definer set search_path = public as $$
declare o offers; s text;
begin
  select * into o from offers where id = p_offer for update;
  if not found then raise exception 'not_allowed'; end if;
  s := deal_side(o, p_token);
  if s is null then raise exception 'not_allowed'; end if;
  if o.status not in ('contract_sent', 'creator_confirmed', 'brand_confirmed')
     or (s = 'creator' and o.creator_confirmed_at is not null) or (s = 'brand' and o.brand_confirmed_at is not null) then
    return jsonb_build_object('ok', false, 'status', o.status); end if;
  if s = 'creator' then update offers set creator_confirmed_at = now() where id = p_offer returning * into o;
  else update offers set brand_confirmed_at = now() where id = p_offer returning * into o; end if;
  if o.creator_confirmed_at is not null and o.brand_confirmed_at is not null then
    update offers set status = 'locked', locked_at = now() where id = p_offer returning * into o;
  else
    update offers set status = s || '_confirmed' where id = p_offer returning * into o;
  end if;
  return jsonb_build_object('ok', true, 'status', o.status, 'side', s);
end $$;

create or replace function deal_change(p_offer text, p_token text, p_field text, p_note text) returns jsonb language plpgsql security definer set search_path = public as $$
declare o offers; s text;
begin
  select * into o from offers where id = p_offer for update;
  if not found then raise exception 'not_allowed'; end if;
  s := deal_side(o, p_token);
  if s is null then raise exception 'not_allowed'; end if;
  if nullif(trim(coalesce(p_note, '')), '') is null then raise exception 'missing_fields'; end if;
  if o.status not in ('contract_sent', 'creator_confirmed', 'brand_confirmed', 'locked') then return jsonb_build_object('ok', false); end if;
  insert into change_requests(id, offer_id, side, field, note) values (mk_id('c-'), p_offer, s, coalesce(p_field, 'Other'), trim(p_note));
  update offers set status = 'change_requested', creator_confirmed_at = null, brand_confirmed_at = null, locked_at = null where id = p_offer;
  return jsonb_build_object('ok', true, 'side', s);
end $$;

-- ---------- team: team key ----------
create or replace function team_dump(p_key text) returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  return jsonb_build_object(
    'creators', coalesce((select jsonb_agg(to_jsonb(c)) from creators c), '[]'),
    'briefs', coalesce((select jsonb_agg(to_jsonb(b)) from briefs b), '[]'),
    'offers', coalesce((select jsonb_agg(to_jsonb(o)) from offers o), '[]'),
    'change_requests', coalesce((select jsonb_agg(to_jsonb(r)) from change_requests r), '[]'),
    'link_sends', coalesce((select jsonb_agg(to_jsonb(s)) from link_sends s), '[]'),
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', e.id::text, 'name', e.name, 'props', e.props, 'created_at', e.created_at))
                        from (select * from events order by created_at desc limit 2000) e), '[]'));
end $$;

create or replace function team_verify(p_key text, p_handle text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  update creators set verified = true, verified_at = now() where handle = p_handle and not verified;
  return found;
end $$;

create or replace function team_invite(p_key text, p_brief text, p_items jsonb) returns int language plpgsql security definer set search_path = public as $$
declare b briefs; c creators; it jsonb; n int := 0;
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  select * into b from briefs where id = p_brief;
  if not found then raise exception 'not_found'; end if;
  for it in select * from jsonb_array_elements(coalesce(p_items, '[]')) loop
    select * into c from creators where handle = it->>'handle' and verified;
    if found and not exists(select 1 from offers where brief_id = b.id and creator_id = c.handle) then
      insert into offers(id, brief_id, creator_id, fit_result, match_score, status, creator_token, brand_token, demo)
      values (mk_id('o-'), b.id, c.handle, fit_of(c, b), ji(it, 'score'), 'new', c.private_token, b.brand_token, b.demo);
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

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
  else raise exception 'bad_action'; end if;
  return found;
end $$;

create or replace function team_log_send(p_key text, p_creator text, p_brand text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  if not exists(select 1 from creators where handle = p_creator) or nullif(trim(coalesce(p_brand, '')), '') is null then return false; end if;
  insert into link_sends(id, creator_id, brand_handle, logged_by) values (mk_id('s-'), p_creator, trim(both '@' from trim(p_brand)), 'team');
  return true;
end $$;

create or replace function team_outcome(p_key text, p_send text, p_outcome text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not team_ok(p_key) then raise exception 'not_allowed'; end if;
  if coalesce(p_outcome, '') not in ('', 'filled', 'replied_in_dm', 'went_quiet') then raise exception 'bad_outcome'; end if;
  update link_sends set outcome = coalesce(p_outcome, '') where id = p_send;
  return found;
end $$;

-- Only the functions meant for the browser are callable by it.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public_creator(text), create_creator(jsonb), submit_brief(jsonb, text), log_event(text, jsonb),
  creator_me(text), update_rules(text, jsonb), offer_interested(text, text), offer_decline(text, text), log_send_creator(text, text),
  brand_contracts(text), deal_get(text, text), deal_confirm(text, text), deal_change(text, text, text, text),
  team_dump(text), team_verify(text, text), team_invite(text, text, jsonb), team_offer(text, text, text, jsonb),
  team_log_send(text, text, text), team_outcome(text, text, text) to anon, authenticated;
