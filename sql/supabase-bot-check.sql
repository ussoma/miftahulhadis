-- ============================================================
-- Miftahulhadis: санҷиши ТАНҲО-ХОНДАНИ бот (ҳеҷ чиз тағйир намешавад: танҳо SELECT)
-- Supabase -> SQL Editor -> ҳар блокро алоҳида иҷро кунед.
-- ============================================================

-- A) Бахши «Саволҳои Исломӣ»: чанд мавод савол/ҷавоб/матни русӣ дорад
select
  count(*)                                                        as jami,
  count(*) filter (where coalesce(question_text,'') <> '')        as bo_question_text,
  count(*) filter (where coalesce(answer_text,'')   <> '')        as bo_answer_text,
  count(*) filter (where coalesce(russian_text,'') <> '')         as bo_russian_text,
  count(*) filter (where coalesce(tajik_text,'') = '' and coalesce(content_text,'') = '' and coalesce(answer_text,'') = '') as bemazmun
from public.content_items
where section_slug = 'questions' and is_published = true;

-- B) media_url: намуд ва ҷойгиршавӣ (аудио/видео/PDF/ғайра)
select
  case
    when media_url !~* '^https?://'                        then 'НОДУРУСТ (http нест)'
    when lower(split_part(media_url,'?',1)) ~ '\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)$' then 'audio'
    when lower(split_part(media_url,'?',1)) ~ '\.(mp4|mov|m4v|webm|mkv)$'              then 'video'
    when lower(split_part(media_url,'?',1)) ~ '\.(jpe?g|png|webp|gif)$'                then 'image'
    when lower(split_part(media_url,'?',1)) ~ '\.pdf$'                                  then 'pdf'
    else 'намуд номаълум (ҳамчун пайванд меравад)'
  end as navъ,
  split_part(split_part(media_url,'//',2),'/',1) as host,
  count(*) as jami
from public.content_items
where coalesce(media_url,'') <> '' and is_published = true
group by 1, 2 order by jami desc;

-- Якчанд пайвандро дастӣ дар браузер кушоед, то боварӣ ҳосил кунед, ки файл мекушояд:
select id, section_slug, title, media_url
from public.content_items
where coalesce(media_url,'') <> '' and is_published = true
order by created_at desc limit 10;

-- C) Бахшҳои ғайрифаъол: бот онҳоро ва маводашонро нишон намедиҳад
select s.slug, s.is_active,
       (select count(*) from public.content_items c where c.section_slug = s.slug and c.is_published) as mavod_pinhon
from public.sections s
where s.is_active = false
order by s.slug;

-- Китобҳои ғайрифаъол
select b.id, b.name, b.is_active,
       (select count(*) from public.hadiths h where h.book_id::text = b.id::text and h.is_published) as hadis_pinhon
from public.hadith_books b
where b.is_active = false;

-- D) Функсияҳои бот ҳамагӣ «stable» (volatility = s): маънояш фақат мехонанд, навиштан надоранд
select proname, provolatile, prosecdef as security_definer
from pg_proc
where pronamespace = 'public'::regnamespace and proname like 'bot\_%'
order by proname;
