-- بعد إنشاء المستخدمين من Authentication > Users انسخ UUID كل مستخدم وعبّه هنا ثم شغّل الملف.
-- العميد
insert into public.profiles (id, full_name, role) values
  ('98ed2970-1613-4355-befb-b331613f5ec5', 'عميد الدراسات العليا والبحث العلمي', 'dean');
-- وكيل (لازم agency_code: GRAD أو RES أو INST)
insert into public.profiles (id, full_name, role, agency_code) values
  ('42ba604a-bf3d-40e1-98c2-8be17e66c6a7', 'وكيل الدراسات العليا', 'deputy', 'GRAD');
-- منسق وحدة (لازم entity_code)
insert into public.profiles (id, full_name, role, entity_code) values
  ('1d10fab7-dd96-4afa-b238-aaee5a2855f9', 'منسق وحدة القبول والتسجيل', 'staff', 'DGSRI-UNT03');
-- أكواد الكيانات: select code, name_ar from public.entities order by code;
