-- =====================================================================
-- بوابة الحوكمة DGSRI — مخطط قاعدة البيانات (Supabase / PostgreSQL)
-- شغّله في SQL Editor بالترتيب: 01_schema.sql ثم 02_seed.sql
-- =====================================================================

-- ---------- الأنواع ----------
create type public.user_role   as enum ('staff', 'deputy', 'dean');          -- منسق / وكيل / عميد
create type public.entity_type as enum ('OFF', 'DEP', 'CTR', 'UNT');         -- مكتب / إدارة / مركز / وحدة
create type public.calc_type   as enum ('ratio', 'count', 'days', 'score');
create type public.wf_status   as enum ('evidence_attached', 'agency_approved', 'published', 'returned');
-- ملاحظة: حالة "لم يُدخل" = عدم وجود سجل في measurements

-- ---------- الهيكل ----------
create table public.agencies (
  code    text primary key,                 -- DEAN | GRAD | RES | INST
  name_ar text not null,
  sort    int  not null default 0
);

create table public.entities (
  code        text primary key,             -- DGSRI-UNT03
  name_ar     text not null,
  type        public.entity_type not null,
  agency_code text not null references public.agencies(code),
  duties      int  not null default 0
);

create table public.register_types (
  key     text primary key,                 -- sv, op, pr ...
  name_ar text not null
);

create table public.entity_registers (
  entity_code text not null references public.entities(code) on delete cascade,
  key         text not null references public.register_types(key),
  n           int  not null default 0,
  primary key (entity_code, key)
);

-- ---------- المستخدمون ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        public.user_role not null,
  entity_code text references public.entities(code),   -- للمنسق
  agency_code text references public.agencies(code),   -- للوكيل
  constraint staff_has_entity  check (role <> 'staff'  or entity_code is not null),
  constraint deputy_has_agency check (role <> 'deputy' or agency_code is not null)
);

-- ---------- المؤشرات والفترات ----------
create table public.kpis (
  code        text primary key,                         -- DGSRI-UNT03-KPI01
  entity_code text not null references public.entities(code) on delete cascade,
  idx         int  not null check (idx between 1 and 4),
  name_ar     text not null,
  calc        public.calc_type not null,
  base_target numeric not null,                         -- المستهدف الافتراضي (90 / 85 / 5 / 40)
  link_type   text not null default 'none' check (link_type in ('both','direct','support','none')),
  plan_code   text,                                     -- رمز الخطة مثل K3.4.1
  unique (entity_code, idx)
);

create table public.periods (
  id            bigint generated always as identity primary key,
  year          int not null,
  quarter       int not null check (quarter between 1 and 4),
  starts_on     date not null,
  ends_on       date not null,
  locked        boolean not null default false,
  lock_reason   text,
  locked_by     uuid references auth.users(id),
  locked_at     timestamptz,
  unique (year, quarter)
);

-- توليد الفترات تلقائيًا لكل سنة (4 أرباع)
create or replace function public.ensure_year(y int) returns void
language sql security definer set search_path = '' as $$
  insert into public.periods (year, quarter, starts_on, ends_on)
  select y, q,
         make_date(y, (q-1)*3 + 1, 1),
         (make_date(y, q*3, 1) + interval '1 month - 1 day')::date
  from generate_series(1, 4) q
  on conflict (year, quarter) do nothing;
$$;
revoke all on function public.ensure_year(int) from public, anon, authenticated;

-- المستهدف: يسري من الفترة المحددة فصاعدًا ولا يغيّر الفترات السابقة
create table public.kpi_targets (
  kpi_code       text   not null references public.kpis(code) on delete cascade,
  from_period_id bigint not null references public.periods(id),
  value          numeric not null check (value > 0),
  set_by         uuid references auth.users(id),
  set_at         timestamptz not null default now(),
  primary key (kpi_code, from_period_id)
);

create or replace function public.target_for(p_kpi text, p_period bigint) returns numeric
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select t.value
       from public.kpi_targets t
       join public.periods tp on tp.id = t.from_period_id
       join public.periods cp on cp.id = p_period
      where t.kpi_code = p_kpi and (tp.year, tp.quarter) <= (cp.year, cp.quarter)
      order by tp.year desc, tp.quarter desc
      limit 1),
    (select base_target from public.kpis where code = p_kpi));
$$;

-- ---------- القياسات ----------
create table public.measurements (
  id              bigint generated always as identity primary key,
  kpi_code        text   not null references public.kpis(code) on delete cascade,
  period_id       bigint not null references public.periods(id),
  numerator       numeric,
  denominator     numeric,
  value           numeric not null,
  status          public.wf_status not null default 'evidence_attached',
  evidence_path   text,                                  -- مسار الملف في Storage
  evidence_name   text,
  note            text,
  return_reason   text,
  entered_by      uuid references auth.users(id),
  updated_at      timestamptz not null default now(),
  unique (kpi_code, period_id)
);

create table public.audit_log (
  id         bigint generated always as identity primary key,
  kpi_code   text   not null,
  period_id  bigint,
  actor      uuid,
  actor_role public.user_role,
  action     text not null,
  detail     text,
  at         timestamptz not null default now()
);

create table public.register_rows (
  id          bigint generated always as identity primary key,
  entity_code text   not null references public.entities(code) on delete cascade,
  key         text   not null references public.register_types(key),
  period_id   bigint references public.periods(id),
  data        jsonb  not null,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create index on public.measurements (period_id, status);
create index on public.kpis (entity_code);
create index on public.audit_log (kpi_code, period_id);
create index on public.register_rows (entity_code, key);

-- ---------- دوال الصلاحيات ----------
create or replace function public.app_role() returns public.user_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid() $$;

create or replace function public.can_see_entity(p_entity text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    join public.entities e on e.code = p_entity
    where p.id = auth.uid()
      and (p.role = 'dean'
        or (p.role = 'deputy' and p.agency_code = e.agency_code)
        or (p.role = 'staff'  and p.entity_code = e.code)))
$$;

create or replace function public.can_approve_entity(p_entity text) returns boolean
language sql stable security definer set search_path = '' as $$
  -- الوكيل: وحدات وكالته | العميد: وحدات "الوحدات المرتبطة بالعميد مباشرة" (نفس منطق النموذج الأولي)
  select exists (
    select 1 from public.profiles p
    join public.entities e on e.code = p_entity
    where p.id = auth.uid()
      and ((p.role = 'deputy' and p.agency_code = e.agency_code)
        or (p.role = 'dean'   and e.agency_code = 'DEAN')))
$$;

create or replace function public.kpi_entity(p_kpi text) returns text
language sql stable security definer set search_path = '' as $$
  select entity_code from public.kpis where code = p_kpi $$;

-- ---------- RLS ----------
alter table public.agencies         enable row level security;
alter table public.entities         enable row level security;
alter table public.register_types   enable row level security;
alter table public.entity_registers enable row level security;
alter table public.profiles         enable row level security;
alter table public.kpis             enable row level security;
alter table public.periods          enable row level security;
alter table public.kpi_targets      enable row level security;
alter table public.measurements     enable row level security;
alter table public.audit_log        enable row level security;
alter table public.register_rows    enable row level security;

create policy agencies_read   on public.agencies       for select to authenticated using (true);
create policy rtypes_read     on public.register_types for select to authenticated using (true);
create policy periods_read    on public.periods        for select to authenticated using (true);
create policy profiles_self   on public.profiles       for select to authenticated using (id = auth.uid());
create policy entities_read   on public.entities       for select to authenticated using (public.can_see_entity(code));
create policy ereg_read       on public.entity_registers for select to authenticated using (public.can_see_entity(entity_code));
create policy kpis_read       on public.kpis           for select to authenticated using (public.can_see_entity(entity_code));
create policy targets_read    on public.kpi_targets    for select to authenticated using (public.can_see_entity(public.kpi_entity(kpi_code)));
create policy meas_read       on public.measurements   for select to authenticated using (public.can_see_entity(public.kpi_entity(kpi_code)));
create policy audit_read      on public.audit_log      for select to authenticated using (public.can_see_entity(public.kpi_entity(kpi_code)));
create policy rrows_read      on public.register_rows  for select to authenticated using (public.can_see_entity(entity_code));
create policy rrows_insert    on public.register_rows  for insert to authenticated
  with check (created_by = auth.uid() and public.app_role() = 'staff' and public.can_see_entity(entity_code));

-- الكتابة على القياسات والمستهدفات والفترات تتم عبر الدوال أدناه فقط
revoke insert, update, delete on public.measurements, public.kpi_targets, public.audit_log, public.periods from authenticated, anon;

-- ---------- دوال سير العمل ----------
create or replace function public.log_action(p_kpi text, p_period bigint, p_action text, p_detail text default null)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_log (kpi_code, period_id, actor, actor_role, action, detail)
  values (p_kpi, p_period, auth.uid(), public.app_role(), p_action, p_detail) $$;
revoke all on function public.log_action(text, bigint, text, text) from public, anon, authenticated;

-- المنسق: إدخال/إعادة إدخال قياس مع دليل الإثبات
create or replace function public.submit_measurement(
  p_kpi text, p_period bigint, p_numerator numeric, p_denominator numeric, p_value numeric,
  p_evidence_path text, p_evidence_name text, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare k public.kpis; per public.periods; cur public.measurements; v numeric;
begin
  select * into k from public.kpis where code = p_kpi;
  select * into per from public.periods where id = p_period;
  if k.code is null or per.id is null then raise exception 'مؤشر أو فترة غير موجودة'; end if;
  if public.app_role() <> 'staff' or not public.can_see_entity(k.entity_code) then raise exception 'غير مصرّح'; end if;
  if per.locked or per.starts_on > current_date then raise exception 'الفترة غير مفتوحة للإدخال'; end if;
  select * into cur from public.measurements where kpi_code = p_kpi and period_id = p_period;
  if cur.id is not null and cur.status <> 'returned' then raise exception 'السجل قيد المراجعة أو منشور'; end if;
  if k.calc = 'ratio' then
    if coalesce(p_denominator, 0) <= 0 or p_numerator < 0 or p_numerator > p_denominator then
      raise exception 'البسط والمقام غير صحيحين'; end if;
    v := round(p_numerator / p_denominator * 100, 1);
  else
    v := p_value;
  end if;
  if v is null or v < 0 then raise exception 'قيمة غير صحيحة'; end if;
  if coalesce(p_evidence_path, cur.evidence_path) is null then raise exception 'دليل الإثبات إلزامي'; end if;

  insert into public.measurements as mm (kpi_code, period_id, numerator, denominator, value, status,
                                   evidence_path, evidence_name, note, return_reason, entered_by)
  values (p_kpi, p_period, p_numerator, p_denominator, v, 'evidence_attached',
          p_evidence_path, p_evidence_name, p_note, null, auth.uid())
  on conflict (kpi_code, period_id) do update set
    numerator = excluded.numerator, denominator = excluded.denominator, value = excluded.value,
    status = 'evidence_attached', return_reason = null, note = excluded.note,
    evidence_path = coalesce(excluded.evidence_path, mm.evidence_path),
    evidence_name = coalesce(excluded.evidence_name, mm.evidence_name),
    entered_by = auth.uid(), updated_at = now();
  perform public.log_action(p_kpi, p_period, 'إدخال/تحديث القياس', 'القيمة ' || v);
end $$;

-- الوكيل/العميد: اعتماد (ونشر) أو إعادة بسبب
create or replace function public.review_measurement(p_kpi text, p_period bigint, p_approve boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare m public.measurements; per public.periods;
begin
  select * into per from public.periods where id = p_period;
  select * into m from public.measurements where kpi_code = p_kpi and period_id = p_period;
  if m.id is null or m.status <> 'evidence_attached' then raise exception 'لا يوجد سجل بانتظار الاعتماد'; end if;
  if per.locked then raise exception 'الفترة مقفلة'; end if;
  if not public.can_approve_entity(public.kpi_entity(p_kpi)) then raise exception 'غير مصرّح'; end if;
  if p_approve then
    update public.measurements set status = 'published', updated_at = now() where id = m.id;
    perform public.log_action(p_kpi, p_period, 'اعتماد ونشر');
  else
    if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'سبب الإعادة إلزامي'; end if;
    update public.measurements set status = 'returned', return_reason = p_reason, updated_at = now() where id = m.id;
    perform public.log_action(p_kpi, p_period, 'إعادة للمنسق', p_reason);
  end if;
end $$;

-- الوكيل/العميد: تعديل المستهدف من الفترة الحالية فصاعدًا
create or replace function public.set_target(p_kpi text, p_period bigint, p_value numeric)
returns void language plpgsql security definer set search_path = '' as $$
declare k public.kpis; per public.periods;
begin
  select * into k from public.kpis where code = p_kpi;
  select * into per from public.periods where id = p_period;
  if k.code is null or per.id is null then raise exception 'مؤشر أو فترة غير موجودة'; end if;
  if not public.can_approve_entity(k.entity_code) then raise exception 'غير مصرّح'; end if;
  if per.locked then raise exception 'لا يمكن تعديل المستهدف في فترة مقفلة'; end if;
  if p_value is null or p_value <= 0 or (k.calc in ('ratio','score') and p_value > 100) then raise exception 'مستهدف غير صحيح'; end if;
  -- إزالة أي تعديلات مستقبلية سابقة ثم تسجيل الجديد من هذه الفترة
  delete from public.kpi_targets t using public.periods tp
   where t.kpi_code = p_kpi and tp.id = t.from_period_id
     and (tp.year, tp.quarter) >= (per.year, per.quarter);
  insert into public.kpi_targets (kpi_code, from_period_id, value, set_by) values (p_kpi, p_period, p_value, auth.uid());
  perform public.log_action(p_kpi, p_period, 'تعديل المستهدف', p_value || ' من هذه الفترة فصاعدًا');
end $$;

-- إقفال/فتح الفترة (الفتح للعميد فقط وبسبب موثق)
create or replace function public.set_period_lock(p_period bigint, p_lock boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.app_role() not in ('dean','deputy') then raise exception 'غير مصرّح'; end if;
  if not p_lock and (public.app_role() <> 'dean' or length(trim(coalesce(p_reason,''))) < 3) then
    raise exception 'فتح الفترة للعميد وبسبب موثق'; end if;
  update public.periods set locked = p_lock, lock_reason = p_reason,
         locked_by = auth.uid(), locked_at = now() where id = p_period;
end $$;

grant execute on function
  public.submit_measurement(text,bigint,numeric,numeric,numeric,text,text,text),
  public.review_measurement(text,bigint,boolean,text),
  public.set_target(text,bigint,numeric),
  public.set_period_lock(bigint,boolean,text),
  public.target_for(text,bigint)
to authenticated;

-- ---------- عرض جاهز للواجهة: القياس + المستهدف + نسبة التحقق ----------
create view public.v_measurements with (security_invoker = true) as
select m.*, k.entity_code, k.calc,
       t.target,
       round(case when k.calc = 'days' then t.target / nullif(m.value, 0) * 100
                  else m.value / t.target * 100 end) as pct
from public.measurements m
join public.kpis k on k.code = m.kpi_code
cross join lateral (select public.target_for(m.kpi_code, m.period_id) as target) t;

-- ---------- التخزين: أدلة الإثبات (خاص) ----------
-- مسار الملف: {entity_code}/{period_id}/{kpi_code}/{filename}
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false)
on conflict (id) do nothing;

create policy evidence_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'evidence' and public.app_role() = 'staff'
              and public.can_see_entity((storage.foldername(name))[1]));
-- المنسق (بعد الرفع) والوكيل والعميد يقدرون ينزلون ضمن نطاقهم
create policy evidence_read on storage.objects for select to authenticated
  using (bucket_id = 'evidence' and public.can_see_entity((storage.foldername(name))[1]));

-- ---------- الفترات: إنشاء تلقائي كل سنة ----------
select public.ensure_year(extract(year from now())::int);
select public.ensure_year(extract(year from now())::int + 1);
-- فعّل امتداد pg_cron من Database > Extensions ثم شغّل:
-- select cron.schedule('next-year-periods', '0 0 1 12 *',
--   $$ select public.ensure_year(extract(year from now())::int + 1) $$);
