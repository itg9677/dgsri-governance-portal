/* ============================================================
 * نقطة الانطلاق
 * تُحمَّل آخر ملف: تستعيد الجلسة إن وُجدت وإلا تعرض صفحة الدخول.
 * ============================================================ */

(async () => {
  if (!window.API || !API.sb) {
    $('#app').innerHTML = '<div class="note r" style="margin:30px">تعذّر تحميل مكتبة Supabase — تحقق من vendor/supabase.js ومن config/supabase-config.js</div>';
    return;
  }
  try { await LIVE.restore(); }
  catch (e) { console.error(e); await API.signOut().catch(() => {}); loginPg(); }
})();
