/* ============================================================
 * خدمة البيانات الحية (LIVE)
 * تملأ E / KPIS / PER / DB من Supabase بعد تسجيل الدخول، وتنفّذ كل عمليات الكتابة
 * (إدخال، اعتماد، إعادة، مستهدف، إقفال، تنزيل دليل) عبر API ثم تعيد التحميل.
 * ============================================================ */

const LIVE = (() => {
  const TYPES = ['OFF', 'DEP', 'CTR', 'UNT'];
  const LKI = { both: 0, support: 1, direct: 2, none: 3 };   // ترتيب LINKS في app.js
  const perOf = id => PER.find(p => p.id === id);
  const msg = e => ({ 'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Email not confirmed': 'البريد غير مؤكد — تواصل مع المسؤول' }[e.message] || e.message);
  const busy = (b, on) => { if (b) b.disabled = on; };

  function currentPeriod() {
    const d = new Date().toISOString().slice(0, 10);
    return (PER.find(p => p.s <= d && d <= p.e) || [...PER].reverse().find(p => p.s <= d) || PER[0] || {}).id || null;
  }

  async function hydrate() {
    const [st, ms, au] = await Promise.all([API.loadStatic(), API.loadAllMeasurements(), API.loadAllAudit()]);
    st.agencies.forEach(a => { AG[a.code] = a.name_ar; });

    const regs = {};
    st.entityRegisters.forEach(r => (regs[r.entity_code] = regs[r.entity_code] || []).push({ k: r.key, n: r.n }));
    E.length = 0;
    [...st.entities].sort((a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type) || a.code.localeCompare(b.code))
      .forEach(e => E.push({ code: e.code, t: e.type, name: e.name_ar, ag: e.agency_code, duties: e.duties, paths: regs[e.code] || [] }));

    const eIdx = Object.fromEntries(E.map((e, i) => [e.code, i])), eBy = Object.fromEntries(E.map(e => [e.code, e]));
    KPIS.length = 0;
    st.kpis.filter(k => eBy[k.entity_code]).sort((a, b) => eIdx[a.entity_code] - eIdx[b.entity_code] || a.idx - b.idx)
      .forEach(k => KPIS.push({ code: k.code, e: eBy[k.entity_code], i: k.idx, name: k.name_ar, real: !/يُحمَّل/.test(k.name_ar),
        ct: k.calc, fr: (k.idx - 1) % 2 === 0 ? 'ربع سنوي' : 'شهري', base: +k.base_target, plan: k.plan_code, lk: LKI[k.link_type] ?? 3 }));

    const yr = new Date().getFullYear();
    PER.length = 0; DB.lock = {};
    st.periods.filter(p => p.year <= yr).forEach(p => {
      const id = p.year + '-Q' + p.quarter;
      PER.push({ id, pid: p.id, year: p.year, quarter: p.quarter, l: 'الربع ' + QN[p.quarter - 1] + ' ' + p.year, s: p.starts_on, e: p.ends_on });
      if (p.locked) DB.lock[id] = 1;
    });
    const pById = Object.fromEntries(PER.map(p => [p.pid, p]));

    DB.tg = {};
    st.targets.forEach(t => { const ix = PER.findIndex(p => p.pid === t.from_period_id); if (ix >= 0) (DB.tg[t.kpi_code] = DB.tg[t.kpi_code] || []).push({ i: ix, v: +t.value }); });
    Object.values(DB.tg).forEach(a => a.sort((x, y) => x.i - y.i));

    DB.m = {};
    ms.forEach(r => {
      const p = pById[r.period_id]; if (!p) return;
      DB.m[r.kpi_code + '|' + p.id] = { v: +r.value, num: r.numerator == null ? null : +r.numerator, den: r.denominator == null ? null : +r.denominator,
        st: r.status, ev: r.evidence_name || '', evPath: r.evidence_path, ret: r.return_reason || '', note: r.note || '', h: [] };
    });
    au.forEach(a => {
      const p = pById[a.period_id], m = p && DB.m[a.kpi_code + '|' + p.id];
      if (m) m.h.push([new Date(a.at).toLocaleString('ar-SA-u-nu-latn'), RN[a.actor_role] || '', a.action + (a.detail ? ' — ' + a.detail : '')]);
    });
    if (!perOf(S.per)) S.per = currentPeriod();
  }

  const refresh = hydrate;

  async function enter() {
    $('#app').innerHTML = '<div class="lgn"><div class="lc"><div class="lo"><h3>جارٍ تحميل البيانات…</h3></div></div></div>';
    const prof = await API.me();
    if (!prof) throw new Error('لا توجد جلسة');
    U = { role: prof.role, ent: prof.entity_code, ag: prof.agency_code };
    S = { page: 'home', ent: null, tab: 'ov', per: null }; H = [];
    await hydrate();
    render();
  }

  // تسجيل الدخول: يرمي خطأ برسالة عربية مناسبة للعرض
  async function login(email, pw) {
    try { await API.signIn(email, pw); await enter(); }
    catch (e) {
      console.error(e);
      const noProfile = /0 rows|single|JSON object/i.test(e.message);
      if (noProfile) await API.signOut().catch(() => {});
      throw new Error(noProfile ? 'حسابك غير مربوط بصلاحية — تواصل مع مسؤول النظام' : msg(e));
    }
  }

  // استعادة الجلسة عند فتح الصفحة
  async function restore() {
    const { data: { session } } = await API.sb.auth.getSession();
    if (session) await enter(); else loginPg();
  }

  async function logout() {
    await API.signOut().catch(() => {});
    U = null; E.length = 0; KPIS.length = 0; PER.length = 0; DB = { m: {}, lock: {}, tg: {}, reg: {} };
    loginPg();
  }

  async function act(code, a, reason) {
    if (a === 'return' && (!reason || reason.trim().length < 3)) { toast('سبب الإعادة إلزامي'); return; }
    const per = perOf(S.per);
    try {
      if (a === 'return') await API.returnToStaff(code, per.pid, reason.trim()); else await API.approve(code, per.pid);
      cl(); await refresh(); toast('تم تنفيذ الإجراء وتسجيله في سجل التدقيق'); render();
    } catch (e) { toast(msg(e)); }
  }

  // اعتماد جماعي: كل سجل يمر بدالة review_measurement وصلاحياتها
  async function approveAll(codes, btn) {
    const per = perOf(S.per); busy(btn, true); let ok = 0, fail = 0, last = '';
    for (const c of codes) { try { await API.approve(c, per.pid); ok++; } catch (e) { fail++; last = msg(e); } }
    await refresh();
    toast(fail ? `اعتُمد ${ok} وتعذّر ${fail}: ${last}` : `تم اعتماد ونشر ${ok} سجلاً`);
    render();
  }

  async function submit(code, { num, den, val, file, note, btn }) {
    const k = KPIS.find(x => x.code === code), per = perOf(S.per);
    busy(btn, true);
    try {
      let ev = { path: null, name: null };
      if (file) ev = await API.uploadEvidence(file, k.e.code, per.pid, code);
      await API.submitMeasurement({ kpi: code, periodId: per.pid, numerator: num, denominator: den, value: val,
        evidencePath: ev.path, evidenceName: ev.name, note: note || null });
      cl(); await refresh(); toast('أُرسل القياس لاعتماد الوكالة'); render();
    } catch (e) { toast(msg(e)); busy(btn, false); }
  }

  async function download(code) {
    const m = DB.m[code + '|' + S.per];
    if (!m || !m.evPath) { toast('لا يوجد ملف مرفق'); return; }
    try {
      const url = await API.evidenceUrl(m.evPath, m.ev);
      const a = document.createElement('a'); a.href = url; a.download = m.ev; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { toast(msg(e)); }
  }

  async function setTarget(code, v, btn) {
    busy(btn, true);
    try { await API.setTarget(code, perOf(S.per).pid, v); await refresh(); toast('تم تحديث المستهدف'); render(); kModal(code); }
    catch (e) { toast(msg(e)); busy(btn, false); }
  }

  async function lock(id, isLocked, reason, btn) {
    if (isLocked) {
      if (U.role !== 'dean') { toast('فتح الفترة حصرًا للعميد'); return; }
      if (!reason || !reason.trim()) { toast('سبب الفتح إلزامي'); return; }
    }
    busy(btn, true);
    try { await API.setPeriodLock(perOf(id).pid, !isLocked, isLocked ? reason.trim() : null); cl(); await refresh(); toast('تم التحديث'); render(); }
    catch (e) { toast(msg(e)); busy(btn, false); }
  }

  return { login, restore, logout, act, approveAll, submit, download, setTarget, lock, refresh };
})();
