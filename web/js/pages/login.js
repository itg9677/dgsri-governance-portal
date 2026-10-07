/* ============================================================
 * الصفحة: تسجيل الدخول
 * بريد وكلمة مرور عبر Supabase Auth (LIVE.login).
 * ============================================================ */

function loginPg() {
  $('#app').innerHTML = `<div class="lgn"><div class="lc"><div class="lo">${logoH()}<h2 style="margin-top:8px">بوابة الحوكمة</h2><div class="crumb">عمادة الدراسات العليا والبحث العلمي — جامعة القصيم</div></div>
    <label>البريد الإلكتروني</label><input type="email" id="em" dir="ltr" autocomplete="username">
    <label>كلمة المرور</label><input type="password" id="pw" dir="ltr" autocomplete="current-password">
    <div class="acts"><button class="btn" id="go" style="flex:1">دخول</button></div>
    <div id="lerr" class="note r" style="display:none;margin-top:10px"></div></div></div>`;
  const err = t => { const x = $('#lerr'); x.textContent = t; x.style.display = 'block'; };
  const submit = async () => {
    const em = $('#em').value.trim(), pw = $('#pw').value;
    if (!em || !pw) { err('أدخل البريد الإلكتروني وكلمة المرور'); return; }
    $('#go').disabled = true;
    try { await LIVE.login(em, pw); }
    catch (e) { loginPg(); err(e.message); }
  };
  $('#go').onclick = submit;
  $('#pw').onkeydown = e => { if (e.key === 'Enter') submit(); };
}
