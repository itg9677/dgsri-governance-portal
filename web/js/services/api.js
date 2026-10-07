// طبقة الاتصال بـ Supabase — جاهزة للاستخدام لكنها لم تُربط بعد بواجهة app.js (انظر README الخطوة 8).
// كل دالة ترجع البيانات أو ترمي خطأ برسالة عربية قادمة من قاعدة البيانات.
(function () {
  if (!window.supabase) { console.warn('supabase-js لم يُحمّل (تحقق من الإنترنت)'); return; }
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

  window.API = {
    sb,
    // ----- الدخول -----
    signIn: async (email, password) => ok(await sb.auth.signInWithPassword({ email, password })),
    signOut: async () => ok(await sb.auth.signOut()),
    // الملف الشخصي: role = staff | deputy | dean مع entity_code أو agency_code
    me: async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return null;
      return ok(await sb.from('profiles').select('*').eq('id', user.id).single());
    },
    // ----- القراءة (RLS يحدد ما يظهر لكل دور تلقائيًا) -----
    loadStatic: async () => {
      const [agencies, entities, kpis, periods, targets, registerTypes, entityRegisters] = (await Promise.all([
        sb.from('agencies').select('*').order('sort'),
        sb.from('entities').select('*'),
        sb.from('kpis').select('*').order('code'),
        sb.from('periods').select('*').order('year').order('quarter'),
        sb.from('kpi_targets').select('*'),
        sb.from('register_types').select('*'),
        sb.from('entity_registers').select('*'),
      ])).map(ok);
      return { agencies, entities, kpis, periods, targets, registerTypes, entityRegisters };
    },
    // القياسات مع المستهدف ونسبة التحقق (pct) لفترة معينة
    loadMeasurements: async (periodId) => ok(await sb.from('v_measurements').select('*').eq('period_id', periodId)),
    // كل القياسات المرئية للمستخدم (RLS) — للنطاق الحالي يكفي؛ عند كبر البيانات أضف تقسيمًا بالصفحات
    loadAllMeasurements: async () => ok(await sb.from('v_measurements').select('*').limit(5000)),
    loadAllAudit: async () => ok(await sb.from('audit_log').select('*').order('at').limit(5000)),
    audit: async (kpiCode, periodId) =>
      ok(await sb.from('audit_log').select('*').eq('kpi_code', kpiCode).eq('period_id', periodId).order('at')),
    // ----- الكتابة (عبر دوال قاعدة البيانات فقط) -----
    submitMeasurement: async ({ kpi, periodId, numerator = null, denominator = null, value = null, evidencePath, evidenceName, note = null }) =>
      ok(await sb.rpc('submit_measurement', {
        p_kpi: kpi, p_period: periodId, p_numerator: numerator, p_denominator: denominator, p_value: value,
        p_evidence_path: evidencePath ?? null, p_evidence_name: evidenceName ?? null, p_note: note })),
    approve: async (kpi, periodId) => ok(await sb.rpc('review_measurement', { p_kpi: kpi, p_period: periodId, p_approve: true })),
    returnToStaff: async (kpi, periodId, reason) =>
      ok(await sb.rpc('review_measurement', { p_kpi: kpi, p_period: periodId, p_approve: false, p_reason: reason })),
    setTarget: async (kpi, periodId, value) => ok(await sb.rpc('set_target', { p_kpi: kpi, p_period: periodId, p_value: value })),
    setPeriodLock: async (periodId, lock, reason = null) =>
      ok(await sb.rpc('set_period_lock', { p_period: periodId, p_lock: lock, p_reason: reason })),
    // ----- أدلة الإثبات (Storage) -----
    // المسار: كود_الكيان/رقم_الفترة/كود_المؤشر/اسم_مولّد ؛ الاسم الأصلي يُحفظ في evidence_name
    uploadEvidence: async (file, entityCode, periodId, kpiCode) => {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${entityCode}/${periodId}/${kpiCode}/${Date.now()}.${ext}`;
      ok(await sb.storage.from('evidence').upload(path, file, { upsert: false }));
      return { path, name: file.name };
    },
    // رابط تنزيل مؤقت (60 ثانية)
    evidenceUrl: async (path, downloadName) =>
      (ok(await sb.storage.from('evidence').createSignedUrl(path, 60, { download: downloadName || true }))).signedUrl,
  };
})();
