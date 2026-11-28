-- ============================================================
-- Miftahulhadis: китобхонаи пурраи бот дар Telegram (ҳамон Supabase)
-- Куҷо гузоштан: Supabase -> SQL Editor -> New query -> Paste -> Run.
-- Ҳеҷ ҷадвали мавҷуда (hadiths, hadith_books, content_items, sections, profiles, ...) ALTER/DROP/DELETE/UPDATE/INSERT намешавад:
--   ин файл танҳо ду ҷадвали НАВ месозад (bot_user_prefs, bot_favorites) ва функсияҳои бот.
-- ЯГОНА DROP: «drop function if exists» барои се функсияи ҲАМИН БОТ (bot_hadith_list, bot_content_list, bot_search).
--   Сабаб: дар PostgreSQL «create or replace» наметавонад сутунҳои баргардонидашударо иваз кунад, ва нусхаи
--   қаблии ин файл (агар аллакай иҷро шуда бошад) сутунҳои дигар дошт. Ин функсияҳо маълумот надоранд, танҳо мехонанд.
-- Версияи 2: russian_text, question_text, answer_text, media_url + филтри sections.is_active / hadith_books.is_active.
-- RLS хомӯш намешавад. Ҷадвалҳои нав RLS-и фаъол доранд ва БЕ policy: танҳо сервер (service_role) мебинад.
-- ============================================================

-- 1) Забон ва ҳолати ҷустуҷӯи ҳар корбар (Telegram user_id)
create table if not exists public.bot_user_prefs (
  tg_id      bigint primary key,
  lang       text not null default 'tg' check (lang in ('tg', 'ru')),
  state      text,            -- 'search' = интизори матни ҷустуҷӯ
  last_query text,            -- барои саҳифабандии натиҷаҳо
  updated_at timestamptz not null default now()
);

-- 2) Дӯстдоштаҳо: ҳар корбар танҳо аз они худро мебинад (бот бо tg_id кор мекунад)
create table if not exists public.bot_favorites (
  tg_id      bigint not null,
  kind       text   not null check (kind in ('hadith', 'content')),
  item_id    text   not null,
  created_at timestamptz not null default now(),
  primary key (tg_id, kind, item_id)
);
create index if not exists bot_favorites_user_idx on public.bot_favorites (tg_id, created_at desc);

alter table public.bot_user_prefs enable row level security;
alter table public.bot_favorites  enable row level security;
revoke all on public.bot_user_prefs from anon, authenticated;
revoke all on public.bot_favorites  from anon, authenticated;
-- policy нест: браузер/anon ба онҳо дастрасӣ надорад; бот бо service_role (дар сервер) кор мекунад.

-- 3) Нормализатсия барои ҷустуҷӯ: ҳаракоти арабӣ, шаклҳои алиф/я, ҳарфҳои тоҷикӣ -> русӣ
create or replace function public.bot_norm(t text) returns text
language sql immutable as $$
  select translate(
    lower(regexp_replace(coalesce(t, ''), '[ً-ٰٟـۖ-ۭ]', '', 'g')),
    'أإآٱىةӣӯғқҷҳё',
    'اااايهиугкчхе')
$$;

-- 4) Хондани майдони meta аз source_note (формати Mini App: __MIFTAH_META_V1__:{"source":..,"meta":{..}})
create or replace function public.bot_meta(sn text, k text) returns text
language plpgsql immutable as $$
begin
  if sn is not null and left(sn, 19) = '__MIFTAH_META_V1__:' then
    return (substr(sn, 20)::jsonb) -> 'meta' ->> k;
  end if;
  return null;
exception when others then
  return null;
end $$;

-- 5) Дидани маводи фаъол: бахше, ки sections.is_active=false дорад, пинҳон аст (ва маводи он низ).
--    Агар барои slug сатри sections набошад, бахш фаъол ҳисоб мешавад (мисли Mini App).
create or replace function public.bot_section_ok(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select not (
    exists (select 1 from public.sections s where s.slug = p_slug and s.is_active = false)
    and not exists (select 1 from public.sections s where s.slug = p_slug and coalesce(s.is_active, true))
  )
$$;

-- Китоби ғайрифаъол (hadith_books.is_active=false) низ пинҳон аст; ҳадис бе китоб намоён мемонад.
create or replace function public.bot_book_ok(p_book text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select bool_or(coalesce(b.is_active, true)) from public.hadith_books b where b.id::text = p_book),
    true)
$$;

-- 6) Рӯйхати ҳадисҳо: нашршуда, муқаддима дар боло, баъд аз рӯи рақам (1,2,...,10 — на матнӣ)
--    p_chapter: null = ҳама, '' = бе боб, 'id' = дар боби муайян
drop function if exists public.bot_hadith_list(text[], text, int, int);
create function public.bot_hadith_list(p_books text[], p_chapter text, p_off int, p_lim int)
returns table (id text, book_id text, hadith_number text, arabic_text text, tajik_text text, source_note text, total bigint)
language sql stable security definer set search_path = public as $$
  select h.id::text, h.book_id::text, h.hadith_number, h.arabic_text, h.tajik_text, h.source_note, count(*) over ()
  from public.hadiths h
  where h.is_published = true
    and h.book_id::text = any (p_books)
    and public.bot_book_ok(h.book_id::text)
    and (
      p_chapter is null
      or (p_chapter = '' and coalesce(h.source_note, '') not like '%"chapter_id":"_%"%')
      or (p_chapter <> '' and coalesce(h.source_note, '') like '%"chapter_id":"' || p_chapter || '"%')
    )
  order by
    (case when coalesce(h.source_note, '') like '%"is_preface":true%' or h.hadith_number = '0' then 0 else 1 end),
    nullif(regexp_replace(coalesce(h.hadith_number, ''), '\D', '', 'g'), '')::numeric nulls last,
    h.hadith_number
  offset greatest(p_off, 0) limit least(greatest(p_lim, 1), 50)
$$;

-- 7) Рӯйхати маводи бахшҳо (азкор = adhkar + duas). Матни русӣ (russian_text), савол/ҷавоб ва media_url низ бармегарданд.
drop function if exists public.bot_content_list(text, text, int, int);
create function public.bot_content_list(p_section text, p_chapter text, p_off int, p_lim int)
returns table (
  id text, title text, tajik_text text, arabic_text text, content_text text, source_note text, section_slug text,
  russian_text text, question_text text, answer_text text, media_url text, total bigint)
language sql stable security definer set search_path = public as $$
  select c.id::text, c.title, c.tajik_text, c.arabic_text, c.content_text, c.source_note, c.section_slug,
         c.russian_text, c.question_text, c.answer_text, c.media_url, count(*) over ()
  from public.content_items c
  where c.is_published = true
    and left(c.section_slug, 2) <> '__'
    and public.bot_section_ok(c.section_slug)
    and (c.section_slug = p_section or (p_section = 'adhkar' and c.section_slug = 'duas'))
    and (
      p_chapter is null
      or (p_chapter = '' and coalesce(c.source_note, '') not like '%"chapter_id":"_%"%')
      or (p_chapter <> '' and coalesce(c.source_note, '') like '%"chapter_id":"' || p_chapter || '"%')
    )
  order by
    (case when coalesce(c.source_note, '') like '%"is_preface":true%' then 0 else 1 end),
    c.created_at, c.id
  offset greatest(p_off, 0) limit least(greatest(p_lim, 1), 50)
$$;

-- 8) Ҷустуҷӯ: арабӣ (бе ҳаракот), тоҷикӣ, русӣ (c.russian_text низ), савол/ҷавоб, номи китоб, рақами ҳадис.
--    p_lang='ru' — сарлавҳа ва порча бо забони русӣ (агар матни русӣ бошад).
drop function if exists public.bot_search(text, int, int);
drop function if exists public.bot_search(text, int, int, text);
create function public.bot_search(p_q text, p_off int, p_lim int, p_lang text default 'tg')
returns table (kind text, id text, title text, snippet text, total bigint)
language sql stable security definer set search_path = public as $$
  with q as (
    select public.bot_norm(btrim(p_q)) as qn,
           btrim(p_q) ~ '^\d{1,6}$' as isnum,
           btrim(p_q) as raw,
           (p_lang = 'ru') as ru
  ),
  r as (
    select 1 as rk, 'book'::text as kind, b.id::text as id, b.name::text as title, ''::text as snippet, 0::numeric as ord
    from (select distinct on (lower(btrim(name))) * from public.hadith_books order by lower(btrim(name)), sort_order) b, q
    where coalesce(b.is_active, true) and length(q.qn) > 1 and public.bot_norm(b.name) like '%' || q.qn || '%'
    union all
    select 2, 'hadith', h.id::text,
           coalesce(bk.name, '') || ' · №' || h.hadith_number,
           left(case when q.ru then coalesce(nullif(public.bot_meta(h.source_note, 'russian_text'), ''), nullif(h.tajik_text, ''), h.arabic_text, '')
                     else coalesce(nullif(h.tajik_text, ''), h.arabic_text, '') end, 160),
           coalesce(nullif(regexp_replace(h.hadith_number, '\D', '', 'g'), '')::numeric, 0)
    from public.hadiths h left join public.hadith_books bk on bk.id = h.book_id, q
    where h.is_published = true and q.isnum and btrim(h.hadith_number) = q.raw
      and public.bot_book_ok(h.book_id::text)
    union all
    select 3, 'hadith', h.id::text,
           coalesce(bk.name, '') || ' · ' || case when h.hadith_number = '0' then '📖' else '№' || h.hadith_number end,
           left(case when q.ru then coalesce(nullif(public.bot_meta(h.source_note, 'russian_text'), ''), nullif(h.tajik_text, ''), h.arabic_text, '')
                     else coalesce(nullif(h.tajik_text, ''), h.arabic_text, '') end, 160),
           coalesce(nullif(regexp_replace(h.hadith_number, '\D', '', 'g'), '')::numeric, 0)
    from public.hadiths h left join public.hadith_books bk on bk.id = h.book_id, q
    where h.is_published = true and length(q.qn) > 1 and not q.isnum
      and public.bot_book_ok(h.book_id::text)
      and public.bot_norm(concat_ws(' ', h.arabic_text, h.tajik_text, h.commentary,
            public.bot_meta(h.source_note, 'russian_text'), public.bot_meta(h.source_note, 'title'),
            public.bot_meta(h.source_note, 'title_ru'), public.bot_meta(h.source_note, 'explanation_tg'),
            public.bot_meta(h.source_note, 'explanation_ru'))) like '%' || q.qn || '%'
    union all
    select 4, 'content', c.id::text,
           case when q.ru
             then coalesce(nullif(public.bot_meta(c.source_note, 'title_ru'), ''), nullif(c.title, ''), nullif(c.question_text, ''),
                           left(coalesce(nullif(c.russian_text, ''), nullif(public.bot_meta(c.source_note, 'russian_text'), ''), c.tajik_text, c.content_text, c.arabic_text, ''), 60))
             else coalesce(nullif(c.title, ''), nullif(c.question_text, ''),
                           left(coalesce(nullif(c.tajik_text, ''), c.content_text, c.answer_text, c.arabic_text, ''), 60))
           end,
           left(case when q.ru
             then coalesce(nullif(c.russian_text, ''), nullif(public.bot_meta(c.source_note, 'russian_text'), ''),
                           nullif(c.tajik_text, ''), nullif(c.content_text, ''), nullif(c.answer_text, ''), c.arabic_text, '')
             else coalesce(nullif(c.tajik_text, ''), nullif(c.content_text, ''), nullif(c.answer_text, ''), c.arabic_text, '')
           end, 160),
           0
    from public.content_items c, q
    where c.is_published = true and left(c.section_slug, 2) <> '__' and length(q.qn) > 1 and not q.isnum
      and public.bot_section_ok(c.section_slug)
      and public.bot_norm(concat_ws(' ', c.title, c.tajik_text, c.arabic_text, c.content_text,
            c.russian_text, c.question_text, c.answer_text,
            public.bot_meta(c.source_note, 'russian_text'), public.bot_meta(c.source_note, 'title_ru'),
            public.bot_meta(c.source_note, 'explanation_tg'), public.bot_meta(c.source_note, 'explanation_ru'))) like '%' || q.qn || '%'
  )
  select r.kind, r.id, r.title, r.snippet, count(*) over ()
  from r order by r.rk, r.ord, r.title
  offset greatest(p_off, 0) limit least(greatest(p_lim, 1), 20)
$$;

-- 9) Танҳо сервер (service_role) метавонад онҳоро занг занад
revoke all on function public.bot_section_ok(text)                     from public, anon, authenticated;
revoke all on function public.bot_book_ok(text)                        from public, anon, authenticated;
revoke all on function public.bot_hadith_list(text[], text, int, int)  from public, anon, authenticated;
revoke all on function public.bot_content_list(text, text, int, int)   from public, anon, authenticated;
revoke all on function public.bot_search(text, int, int, text)         from public, anon, authenticated;
grant execute on function public.bot_section_ok(text)                     to service_role;
grant execute on function public.bot_book_ok(text)                        to service_role;
grant execute on function public.bot_hadith_list(text[], text, int, int)  to service_role;
grant execute on function public.bot_content_list(text, text, int, int)   to service_role;
grant execute on function public.bot_search(text, int, int, text)         to service_role;
grant select, insert, update, delete on public.bot_user_prefs, public.bot_favorites to service_role;
